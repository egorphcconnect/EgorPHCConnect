import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, LogOut, Search, Image as ImageIcon, RefreshCw, Eye,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin } from "@/lib/admin-bootstrap.functions";
import type { PHC, HealthArticle, OperatingHours } from "@/lib/types";
import { SERVICE_CATEGORIES, HEALTH_CATEGORIES } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Egor PHC Connect" }] }),
  component: AdminPage,
});

const FACILITY_TYPES = ["Primary Health Centre", "Health Post", "Comprehensive Health Centre", "Maternity"];

// ---- Open/Closed (Africa/Lagos) ----
function nowLagosParts() {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const wd = (parts.weekday ?? "Mon").toLowerCase();
  const day = wd.startsWith("sun") ? 0 : wd.startsWith("sat") ? 6 : 1;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return { day, minutes };
}
function isOpenLagos(hours: OperatingHours | null | undefined): boolean {
  if (!hours) return false;
  const { day, minutes } = nowLagosParts();
  const range = day === 0 ? hours.sun : day === 6 ? hours.sat : hours.mon_fri;
  if (!range || !/^\d/.test(range)) return false;
  const [s, e] = range.split("-");
  if (!s || !e) return false;
  const [sh, sm] = s.split(":").map(Number);
  const [eh, em] = e.split(":").map(Number);
  return minutes >= sh * 60 + sm && minutes <= eh * 60 + em;
}

function AdminPage() {
  const navigate = useNavigate();
  const claim = useServerFn(claimFirstAdmin);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { navigate({ to: "/auth" }); return; }
      setUserEmail(u.user.email ?? null);
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", u.user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      if (!admin) {
        // try to claim if no admins exist
        try {
          const r = await claim();
          if (r.claimed) { setIsAdmin(true); toast.success("You are the first administrator."); }
          else setIsAdmin(false);
        } catch { setIsAdmin(false); }
      } else setIsAdmin(true);
      setLoading(false);
    })();
  }, [navigate, claim]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Not an administrator</CardTitle>
            <CardDescription>
              {userEmail} is signed in but doesn't have the admin role. Ask an existing administrator to grant you access.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" asChild><Link to="/">Home</Link></Button>
            <Button onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Signed in as {userEmail}</p>
        </div>
        <Button variant="outline" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
      </div>

      <Tabs defaultValue="phcs">
        <TabsList>
          <TabsTrigger value="phcs">PHCs</TabsTrigger>
          <TabsTrigger value="articles">Health Articles</TabsTrigger>
        </TabsList>
        <TabsContent value="phcs"><PhcManager /></TabsContent>
        <TabsContent value="articles"><ArticleManager /></TabsContent>
      </Tabs>
    </div>
  );
}

// =================== PHC MANAGER ===================
type PhcWithExtras = PHC & { facility_type: string | null; image_url: string | null };

function PhcManager() {
  const [rows, setRows] = useState<PhcWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [ward, setWard] = useState<string>("all");
  const [ftype, setFtype] = useState<string>("all");
  const [openFilter, setOpenFilter] = useState<string>("all");
  const [editing, setEditing] = useState<PhcWithExtras | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<PhcWithExtras | null>(null);
  const [viewing, setViewing] = useState<PhcWithExtras | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("phcs").select("*").order("name");
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as PhcWithExtras[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const wards = useMemo(() => Array.from(new Set(rows.map((r) => r.ward))).sort(), [rows]);
  const ftypes = useMemo(
    () => Array.from(new Set(rows.map((r) => r.facility_type).filter(Boolean) as string[])).sort(),
    [rows],
  );

  const filtered = rows.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (ward !== "all" && r.ward !== ward) return false;
    if (ftype !== "all" && r.facility_type !== ftype) return false;
    if (openFilter !== "all") {
      const open = isOpenLagos(r.operating_hours);
      if (openFilter === "open" && !open) return false;
      if (openFilter === "closed" && open) return false;
    }
    return true;
  });

  const totalActive = rows.filter((r) => r.status === "active").length;

  async function onDelete() {
    if (!deleting) return;
    const { error } = await supabase.from("phcs").delete().eq("id", deleting.id);
    if (error) toast.error(error.message);
    else { toast.success("PHC deleted"); setDeleting(null); load(); }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total PHCs</CardDescription><CardTitle className="text-3xl">{rows.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Active</CardDescription><CardTitle className="text-3xl">{totalActive}</CardTitle></CardHeader></Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Quick actions</CardDescription></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setAdding(true)}><Plus className="mr-1 h-4 w-4" />Add PHC</Button>
            <Button size="sm" variant="outline" onClick={load}><RefreshCw className="mr-1 h-4 w-4" />Refresh</Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name…" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={ward} onValueChange={setWard}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Ward" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All wards</SelectItem>
            {wards.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={ftype} onValueChange={setFtype}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {ftypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={openFilter} onValueChange={setOpenFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Open & closed</SelectItem>
            <SelectItem value="open">Open now</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No PHCs match the current filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Hours (Mon–Fri)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const open = isOpenLagos(p.operating_hours);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.ward}</TableCell>
                      <TableCell className="text-muted-foreground">{p.facility_type ?? "—"}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{p.operating_hours?.mon_fri ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={open ? "default" : "secondary"}>{open ? "Open now" : "Closed"}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {new Date(p.last_updated).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setViewing(p)} aria-label="View"><Eye className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditing(p)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleting(p)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {(adding || editing) && (
        <PhcForm
          phc={editing}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSaved={() => { setAdding(false); setEditing(null); load(); }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this PHC?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              {viewing.image_url && <img src={viewing.image_url} alt={viewing.name} className="h-40 w-full rounded object-cover" />}
              <p><b>Ward:</b> {viewing.ward}</p>
              <p><b>Type:</b> {viewing.facility_type ?? "—"}</p>
              <p><b>Address:</b> {viewing.address}</p>
              <p><b>Phone:</b> {viewing.contact_phone ?? "—"}</p>
              <p><b>Hours:</b> Mon–Fri {viewing.operating_hours?.mon_fri ?? "—"}, Sat {viewing.operating_hours?.sat ?? "—"}, Sun {viewing.operating_hours?.sun ?? "—"}</p>
              <p><b>Services:</b> {viewing.services?.join(", ") || "—"}</p>
              <p><b>Coords:</b> {viewing.latitude ?? "—"}, {viewing.longitude ?? "—"}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PhcForm({ phc, onClose, onSaved }: {
  phc: PhcWithExtras | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = !!phc;
  const [form, setForm] = useState({
    name: phc?.name ?? "",
    address: phc?.address ?? "",
    ward: phc?.ward ?? "",
    facility_type: phc?.facility_type ?? "Primary Health Centre",
    contact_phone: phc?.contact_phone ?? "",
    latitude: phc?.latitude?.toString() ?? "",
    longitude: phc?.longitude?.toString() ?? "",
    mon_fri: phc?.operating_hours?.mon_fri ?? "08:00-16:00",
    sat: phc?.operating_hours?.sat ?? "09:00-13:00",
    sun: phc?.operating_hours?.sun ?? "Closed",
    status: phc?.status ?? "active",
    services: phc?.services ?? [],
    image_url: phc?.image_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function toggleService(s: string, on: boolean) {
    setForm((f) => ({
      ...f,
      services: on ? Array.from(new Set([...f.services, s])) : f.services.filter((x) => x !== s),
    }));
  }

  async function handleImage(file: File) {
    setUploading(true);
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("phc-images").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("phc-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.ward.trim()) {
      toast.error("Name, address and ward are required"); return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      ward: form.ward.trim(),
      facility_type: form.facility_type || null,
      contact_phone: form.contact_phone.trim() || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      operating_hours: { mon_fri: form.mon_fri, sat: form.sat, sun: form.sun },
      status: form.status,
      services: form.services,
      image_url: form.image_url || null,
      last_updated: new Date().toISOString(),
    };
    const { error } = editing
      ? await supabase.from("phcs").update(payload).eq("id", phc!.id)
      : await supabase.from("phcs").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success(editing ? "PHC updated" : "PHC added"); onSaved(); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit PHC" : "Add new PHC"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Ward *"><Input value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} required /></Field>
            <Field label="Facility type">
              <Select value={form.facility_type} onValueChange={(v) => setForm({ ...form, facility_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FACILITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Address *"><Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Phone"><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></Field>
            <Field label="Latitude"><Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></Field>
            <Field label="Longitude"><Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></Field>
          </div>

          <div className="space-y-2">
            <Label>Operating hours (24h, e.g. 08:00-16:00 or "Closed")</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input placeholder="Mon–Fri" value={form.mon_fri} onChange={(e) => setForm({ ...form, mon_fri: e.target.value })} />
              <Input placeholder="Saturday" value={form.sat} onChange={(e) => setForm({ ...form, sat: e.target.value })} />
              <Input placeholder="Sunday" value={form.sun} onChange={(e) => setForm({ ...form, sun: e.target.value })} />
            </div>
            <p className="text-xs text-muted-foreground">Open/Closed status is calculated live in Africa/Lagos time.</p>
          </div>

          <div className="space-y-2">
            <Label>Services offered</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SERVICE_CATEGORIES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.services.includes(s)} onCheckedChange={(v) => toggleService(s, !!v)} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>PHC image</Label>
            {form.image_url && <img src={form.image_url} alt="" className="h-32 w-full rounded object-cover" />}
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => {
                const f = e.target.files?.[0]; if (f) handleImage(f);
              }} />
              {form.image_url && (
                <Button type="button" size="sm" variant="ghost" onClick={() => setForm({ ...form, image_url: "" })}>
                  Clear
                </Button>
              )}
            </div>
            {uploading && <p className="text-xs text-muted-foreground"><ImageIcon className="mr-1 inline h-3 w-3" />Uploading…</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || uploading}>{saving ? "Saving…" : editing ? "Save changes" : "Create PHC"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

// =================== ARTICLES ===================
type ArticleRow = HealthArticle & { published: boolean };

function ArticleManager() {
  const [rows, setRows] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ArticleRow | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<ArticleRow | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("health_articles").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as ArticleRow[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function onDelete() {
    if (!deleting) return;
    const { error } = await supabase.from("health_articles").delete().eq("id", deleting.id);
    if (error) toast.error(error.message);
    else { toast.success("Article deleted"); setDeleting(null); load(); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Health articles</h2>
        <Button onClick={() => setAdding(true)}><Plus className="mr-1 h-4 w-4" />New article</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? <div className="p-4"><Skeleton className="h-24 w-full" /></div>
            : rows.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground">No articles yet.</div>
            : (
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Published</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.title}</TableCell>
                      <TableCell>{a.category}</TableCell>
                      <TableCell><Badge variant={a.published ? "default" : "secondary"}>{a.published ? "Yes" : "No"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => setEditing(a)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleting(a)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>

      {(adding || editing) && (
        <ArticleForm article={editing} onClose={() => { setAdding(false); setEditing(null); }} onSaved={() => { setAdding(false); setEditing(null); load(); }} />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
            <AlertDialogDescription>{deleting?.title} will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ArticleForm({ article, onClose, onSaved }: {
  article: ArticleRow | null; onClose: () => void; onSaved: () => void;
}) {
  const editing = !!article;
  const [f, setF] = useState({
    title: article?.title ?? "",
    category: article?.category ?? HEALTH_CATEGORIES[0],
    summary: article?.summary ?? "",
    content: article?.content ?? "",
    tags: (article?.tags ?? []).join(", "),
    published: article?.published ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title.trim() || !f.summary.trim() || !f.content.trim()) {
      toast.error("Title, summary and content are required"); return;
    }
    setSaving(true);
    const payload = {
      title: f.title.trim(),
      category: f.category,
      summary: f.summary.trim(),
      content: f.content.trim(),
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      published: f.published,
    };
    const { error } = editing
      ? await supabase.from("health_articles").update(payload).eq("id", article!.id)
      : await supabase.from("health_articles").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success(editing ? "Article updated" : "Article created"); onSaved(); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Edit article" : "New article"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-3">
          <Field label="Title *"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required /></Field>
          <Field label="Category">
            <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{HEALTH_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Summary *"><Textarea rows={2} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} required /></Field>
          <Field label="Content *"><Textarea rows={8} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} required /></Field>
          <Field label="Tags (comma separated)"><Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} />
            Published
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
