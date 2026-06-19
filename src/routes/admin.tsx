import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut } from "lucide-react";
import {
  verifyAdmin,
  listAllPhcs,
  upsertPhc,
  deletePhc,
  listAllArticles,
  upsertArticle,
  deleteArticle,
} from "@/lib/admin.functions";
import type { PHC, HealthArticle } from "@/lib/types";
import { SERVICE_CATEGORIES, HEALTH_CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin · Egor PHC Connect" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

const STORAGE_KEY = "egor-admin-session";

function AdminPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setToken(stored);
  }, []);

  function clearSession() {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }

  if (!token) return <Login onSuccess={setToken} />;
  return <Dashboard token={token} onLogout={clearSession} onSessionInvalid={clearSession} />;
}

function Login({ onSuccess }: { onSuccess: (t: string) => void }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const verify = useServerFn(verifyAdmin);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await verify({ data: { passcode: value } });
      sessionStorage.setItem(STORAGE_KEY, token);
      setValue("");
      onSuccess(token);
    } catch (err: any) {
      toast.error(err?.message || "Invalid passcode");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Admin sign-in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pc">Passcode</Label>
              <Input
                id="pc"
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Checking…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Dashboard({ passcode, onLogout }: { passcode: string; onLogout: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage PHCs and Health Articles.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
      <Tabs defaultValue="phcs">
        <TabsList>
          <TabsTrigger value="phcs">PHCs</TabsTrigger>
          <TabsTrigger value="articles">Health Articles</TabsTrigger>
        </TabsList>
        <TabsContent value="phcs" className="mt-6">
          <PhcsAdmin passcode={passcode} />
        </TabsContent>
        <TabsContent value="articles" className="mt-6">
          <ArticlesAdmin passcode={passcode} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =================== PHCs ===================

const emptyPhc = {
  name: "",
  address: "",
  ward: "",
  services: [] as string[],
  operating_hours: { mon_fri: "", sat: "", sun: "" },
  contact_phone: "",
  latitude: "" as string | number,
  longitude: "" as string | number,
  status: "active",
};

type PhcForm = typeof emptyPhc;

function PhcsAdmin({ passcode }: { passcode: string }) {
  const router = useRouter();
  const fetchAll = useServerFn(listAllPhcs);
  const save = useServerFn(upsertPhc);
  const remove = useServerFn(deletePhc);

  const [rows, setRows] = useState<PHC[] | null>(null);
  const [editing, setEditing] = useState<{ id?: string; form: PhcForm } | null>(null);
  const [confirmDel, setConfirmDel] = useState<PHC | null>(null);

  async function reload() {
    try {
      const data = await fetchAll({ data: { passcode } });
      setRows(data);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load");
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openNew() {
    setEditing({ form: { ...emptyPhc, operating_hours: { ...emptyPhc.operating_hours } } });
  }

  function openEdit(p: PHC) {
    setEditing({
      id: p.id,
      form: {
        name: p.name,
        address: p.address,
        ward: p.ward,
        services: p.services ?? [],
        operating_hours: {
          mon_fri: p.operating_hours?.mon_fri ?? "",
          sat: p.operating_hours?.sat ?? "",
          sun: p.operating_hours?.sun ?? "",
        },
        contact_phone: p.contact_phone ?? "",
        latitude: p.latitude ?? "",
        longitude: p.longitude ?? "",
        status: p.status,
      },
    });
  }

  async function submit() {
    if (!editing) return;
    const f = editing.form;
    try {
      await save({
        data: {
          passcode,
          id: editing.id,
          phc: {
            name: f.name,
            address: f.address,
            ward: f.ward,
            services: f.services,
            operating_hours: f.operating_hours,
            contact_phone: f.contact_phone || null,
            latitude: f.latitude === "" ? null : Number(f.latitude),
            longitude: f.longitude === "" ? null : Number(f.longitude),
            status: f.status || "active",
          },
        },
      });
      toast.success(editing.id ? "PHC updated" : "PHC added");
      setEditing(null);
      reload();
      router.invalidate();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  }

  async function confirmDelete() {
    if (!confirmDel) return;
    try {
      await remove({ data: { passcode, id: confirmDel.id } });
      toast.success("PHC deleted");
      setConfirmDel(null);
      reload();
      router.invalidate();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Primary Healthcare Centres</CardTitle>
        <Button size="sm" onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Add PHC
        </Button>
      </CardHeader>
      <CardContent>
        {rows === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No PHCs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.ward}</TableCell>
                    <TableCell>{p.contact_phone || "—"}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDel(p)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit PHC" : "Add new PHC"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name">
                  <Input
                    value={editing.form.name}
                    onChange={(e) =>
                      setEditing({ ...editing, form: { ...editing.form, name: e.target.value } })
                    }
                  />
                </Field>
                <Field label="Ward">
                  <Input
                    value={editing.form.ward}
                    onChange={(e) =>
                      setEditing({ ...editing, form: { ...editing.form, ward: e.target.value } })
                    }
                  />
                </Field>
              </div>
              <Field label="Address">
                <Input
                  value={editing.form.address}
                  onChange={(e) =>
                    setEditing({ ...editing, form: { ...editing.form, address: e.target.value } })
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Phone">
                  <Input
                    value={editing.form.contact_phone}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        form: { ...editing.form, contact_phone: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field label="Latitude">
                  <Input
                    type="number"
                    step="any"
                    value={editing.form.latitude}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        form: { ...editing.form, latitude: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field label="Longitude">
                  <Input
                    type="number"
                    step="any"
                    value={editing.form.longitude}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        form: { ...editing.form, longitude: e.target.value },
                      })
                    }
                  />
                </Field>
              </div>
              <div>
                <Label className="mb-2 block">Services</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SERVICE_CATEGORIES.map((s) => {
                    const checked = editing.form.services.includes(s);
                    return (
                      <label key={s} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => {
                            const next = c
                              ? [...editing.form.services, s]
                              : editing.form.services.filter((x) => x !== s);
                            setEditing({ ...editing, form: { ...editing.form, services: next } });
                          }}
                        />
                        {s}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Hours Mon–Fri" hint="e.g. 08:00-17:00">
                  <Input
                    value={editing.form.operating_hours.mon_fri}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        form: {
                          ...editing.form,
                          operating_hours: {
                            ...editing.form.operating_hours,
                            mon_fri: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Field>
                <Field label="Hours Saturday">
                  <Input
                    value={editing.form.operating_hours.sat}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        form: {
                          ...editing.form,
                          operating_hours: {
                            ...editing.form.operating_hours,
                            sat: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Field>
                <Field label="Hours Sunday">
                  <Input
                    value={editing.form.operating_hours.sun}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        form: {
                          ...editing.form,
                          operating_hours: {
                            ...editing.form.operating_hours,
                            sun: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Field>
              </div>
              <Field label="Status" hint="active, inactive, under-maintenance">
                <Input
                  value={editing.form.status}
                  onChange={(e) =>
                    setEditing({ ...editing, form: { ...editing.form, status: e.target.value } })
                  }
                />
              </Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={submit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this PHC?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDel?.name} will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// =================== Articles ===================

const emptyArticle = {
  title: "",
  category: HEALTH_CATEGORIES[0] as string,
  summary: "",
  content: "",
  tags: "",
  published: true,
};

type ArticleForm = typeof emptyArticle;
type AdminArticle = HealthArticle & { published: boolean };

function ArticlesAdmin({ passcode }: { passcode: string }) {
  const router = useRouter();
  const fetchAll = useServerFn(listAllArticles);
  const save = useServerFn(upsertArticle);
  const remove = useServerFn(deleteArticle);

  const [rows, setRows] = useState<AdminArticle[] | null>(null);
  const [editing, setEditing] = useState<{ id?: string; form: ArticleForm } | null>(null);
  const [confirmDel, setConfirmDel] = useState<AdminArticle | null>(null);

  async function reload() {
    try {
      const data = await fetchAll({ data: { passcode } });
      setRows(data);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load");
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openNew() {
    setEditing({ form: { ...emptyArticle } });
  }

  function openEdit(a: AdminArticle) {
    setEditing({
      id: a.id,
      form: {
        title: a.title,
        category: a.category,
        summary: a.summary,
        content: a.content,
        tags: (a.tags ?? []).join(", "),
        published: a.published,
      },
    });
  }

  async function submit() {
    if (!editing) return;
    const f = editing.form;
    try {
      await save({
        data: {
          passcode,
          id: editing.id,
          article: {
            title: f.title,
            category: f.category,
            summary: f.summary,
            content: f.content,
            tags: f.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            published: f.published,
          },
        },
      });
      toast.success(editing.id ? "Article updated" : "Article added");
      setEditing(null);
      reload();
      router.invalidate();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  }

  async function confirmDelete() {
    if (!confirmDel) return;
    try {
      await remove({ data: { passcode, id: confirmDel.id } });
      toast.success("Article deleted");
      setConfirmDel(null);
      reload();
      router.invalidate();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Health Articles</CardTitle>
        <Button size="sm" onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Article
        </Button>
      </CardHeader>
      <CardContent>
        {rows === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No articles yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>{a.published ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDel(a)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Article" : "Add new Article"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <Field label="Title">
                <Input
                  value={editing.form.title}
                  onChange={(e) =>
                    setEditing({ ...editing, form: { ...editing.form, title: e.target.value } })
                  }
                />
              </Field>
              <Field label="Category">
                <Input
                  list="cat-list"
                  value={editing.form.category}
                  onChange={(e) =>
                    setEditing({ ...editing, form: { ...editing.form, category: e.target.value } })
                  }
                />
                <datalist id="cat-list">
                  {HEALTH_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Summary" hint="One or two sentences shown on the list">
                <Textarea
                  rows={2}
                  value={editing.form.summary}
                  onChange={(e) =>
                    setEditing({ ...editing, form: { ...editing.form, summary: e.target.value } })
                  }
                />
              </Field>
              <Field label="Content">
                <Textarea
                  rows={10}
                  value={editing.form.content}
                  onChange={(e) =>
                    setEditing({ ...editing, form: { ...editing.form, content: e.target.value } })
                  }
                />
              </Field>
              <Field label="Tags" hint="Comma-separated">
                <Input
                  value={editing.form.tags}
                  onChange={(e) =>
                    setEditing({ ...editing, form: { ...editing.form, tags: e.target.value } })
                  }
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={editing.form.published}
                  onCheckedChange={(c) =>
                    setEditing({
                      ...editing,
                      form: { ...editing.form, published: c === true },
                    })
                  }
                />
                Published (visible to residents)
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={submit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDel?.title}" will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
