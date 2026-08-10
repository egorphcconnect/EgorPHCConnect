import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, LogOut, Search, Image as ImageIcon, RefreshCw, Eye,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin } from "@/lib/admin-bootstrap.functions";
import type { PHC, HealthArticle, DayKey } from "@/lib/types";
import {
  isOpenLagos, formatTime, DAY_KEYS, DAY_LABELS, dayServices,
} from "@/lib/types";
import { ServiceMultiSelect } from "@/components/service-multi-select";
import { PhcImage, extractPhcImagePath } from "@/components/phc-image";


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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
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
        <TabsList className="flex-wrap">
          <TabsTrigger value="phcs">PHCs</TabsTrigger>
          <TabsTrigger value="articles">Health Articles</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="content">Website Content</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
        </TabsList>
        <TabsContent value="phcs"><PhcManager /></TabsContent>
        <TabsContent value="articles"><ArticleManager /></TabsContent>
        <TabsContent value="categories"><CategoryManager /></TabsContent>
        <TabsContent value="content"><SiteCopyManager /></TabsContent>
        <TabsContent value="stakeholders"><StakeholderManager /></TabsContent>
      </Tabs>
    </div>
  );
}

// =================== PHC MANAGER ===================
function PhcManager() {
  const [rows, setRows] = useState<PHC[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [ward, setWard] = useState<string>("all");
  const [ftype, setFtype] = useState<string>("all");
  const [openFilter, setOpenFilter] = useState<string>("all");
  const [editing, setEditing] = useState<PHC | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<PHC | null>(null);
  const [viewing, setViewing] = useState<PHC | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("phcs").select("*").order("name");
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as PHC[]);
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
      const open = isOpenLagos(r.opening_time, r.closing_time);
      if (openFilter === "open" && !open) return false;
      if (openFilter === "closed" && open) return false;
    }
    return true;
  });

  const openNowCount = rows.filter((r) => isOpenLagos(r.opening_time, r.closing_time)).length;

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
        <Card><CardHeader className="pb-2"><CardDescription>Open right now</CardDescription><CardTitle className="text-3xl">{openNowCount}</CardTitle></CardHeader></Card>
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
            <SelectItem value="open">Currently open</SelectItem>
            <SelectItem value="closed">Currently closed</SelectItem>
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
                  <TableHead className="hidden md:table-cell">Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const open = isOpenLagos(p.opening_time, p.closing_time);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.ward}</TableCell>
                      <TableCell className="text-muted-foreground">{p.facility_type ?? "—"}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {p.opening_time && p.closing_time ? `${formatTime(p.opening_time)} – ${formatTime(p.closing_time)}` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={open ? "default" : "secondary"}>{open ? "Currently open" : "Currently closed"}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {new Date(p.updated_at ?? p.last_updated).toLocaleDateString()}
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
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              {viewing.image_url && <PhcImage phc={viewing} aspect="aspect-[16/9]" />}
              <p><b>Ward:</b> {viewing.ward}</p>
              <p><b>Type:</b> {viewing.facility_type ?? "—"}</p>
              <p><b>Address:</b> {viewing.address}</p>
              <p><b>Phone:</b> {viewing.contact_phone ?? "—"}</p>
              <p><b>Hours:</b> {viewing.opening_time && viewing.closing_time ? `${formatTime(viewing.opening_time)} – ${formatTime(viewing.closing_time)}` : "—"}</p>
              <p><b>Coords:</b> {viewing.latitude ?? "—"}, {viewing.longitude ?? "—"}</p>
              {viewing.google_maps_url && <p><b>Maps:</b> <a className="text-primary underline" href={viewing.google_maps_url} target="_blank" rel="noreferrer">Open</a></p>}
              <div>
                <b>Weekly schedule:</b>
                <ul className="mt-1 space-y-1">
                  {DAY_KEYS.map((d) => {
                    const list = dayServices(viewing, d);
                    return (
                      <li key={d}><span className="font-medium">{DAY_LABELS[d]}:</span> {list.length ? list.join(", ") : <span className="text-muted-foreground">No scheduled clinic</span>}</li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type PhcFormState = {
  name: string;
  address: string;
  ward: string;
  facility_type: string;
  contact_phone: string;
  latitude: string;
  longitude: string;
  google_maps_url: string;
  opening_time: string;
  closing_time: string;
  services: string[];
  image_url: string;
  daySvc: Record<DayKey, string[]>;
};

function emptyDaySvc(phc: PHC | null): Record<DayKey, string[]> {
  return {
    monday: phc?.monday_services ?? [],
    tuesday: phc?.tuesday_services ?? [],
    wednesday: phc?.wednesday_services ?? [],
    thursday: phc?.thursday_services ?? [],
    friday: phc?.friday_services ?? [],
    saturday: phc?.saturday_services ?? [],
    sunday: phc?.sunday_services ?? [],
  };
}

function toTimeInput(t: string | null | undefined): string {
  if (!t) return "";
  const m = /^(\d{2}):(\d{2})/.exec(t);
  return m ? `${m[1]}:${m[2]}` : "";
}

function PhcForm({ phc, onClose, onSaved }: {
  phc: PHC | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = !!phc;
  const [form, setForm] = useState<PhcFormState>({
    name: phc?.name ?? "",
    address: phc?.address ?? "",
    ward: phc?.ward ?? "",
    facility_type: phc?.facility_type ?? "Primary Health Centre",
    contact_phone: phc?.contact_phone ?? "",
    latitude: phc?.latitude?.toString() ?? "",
    longitude: phc?.longitude?.toString() ?? "",
    google_maps_url: phc?.google_maps_url ?? "",
    opening_time: toTimeInput(phc?.opening_time) || "08:00",
    closing_time: toTimeInput(phc?.closing_time) || "16:00",
    services: phc?.services ?? [],
    image_url: phc?.image_url ?? "",
    daySvc: emptyDaySvc(phc),
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function setServices(next: string[]) {
    setForm((f) => ({ ...f, services: next }));
  }

  function setDayServices(day: DayKey, next: string[]) {
    setForm((f) => ({ ...f, daySvc: { ...f.daySvc, [day]: next } }));
  }

  async function handleImage(file: File) {
    const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Only JPG, PNG or WebP images are allowed"); return;
    }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setUploading(true);
    // Remove any previous storage object so we don't accumulate orphans.
    if (form.image_url) {
      const prev = extractPhcImagePath(form.image_url);
      if (prev) { await supabase.storage.from("phc-images").remove([prev]); }
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("phc-images")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error(error.message); setUploading(false); return; }
    // Store the storage path — the app resolves it to a signed URL on render.
    setForm((f) => ({ ...f, image_url: path }));
    setUploading(false);
    toast.success("Image uploaded");
  }


  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.ward.trim()) {
      toast.error("Name, address and ward are required"); return;
    }
    if (form.opening_time >= form.closing_time) {
      toast.error("Closing time must be after opening time"); return;
    }
    const lat = form.latitude ? Number(form.latitude) : null;
    const lng = form.longitude ? Number(form.longitude) : null;
    if (lat != null && (isNaN(lat) || lat < -90 || lat > 90)) { toast.error("Invalid latitude"); return; }
    if (lng != null && (isNaN(lng) || lng < -180 || lng > 180)) { toast.error("Invalid longitude"); return; }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      ward: form.ward.trim(),
      facility_type: form.facility_type || null,
      contact_phone: form.contact_phone.trim() || null,
      latitude: lat,
      longitude: lng,
      google_maps_url: form.google_maps_url.trim() || null,
      opening_time: form.opening_time,
      closing_time: form.closing_time,
      services: form.services,
      image_url: form.image_url || null,
      monday_services: form.daySvc.monday,
      tuesday_services: form.daySvc.tuesday,
      wednesday_services: form.daySvc.wednesday,
      thursday_services: form.daySvc.thursday,
      friday_services: form.daySvc.friday,
      saturday_services: form.daySvc.saturday,
      sunday_services: form.daySvc.sunday,
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
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
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
            <Field label="Phone"><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} placeholder="+234 800 000 0000" /></Field>
          </div>
          <Field label="Address *"><Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Opening time *"><Input type="time" value={form.opening_time} onChange={(e) => setForm({ ...form, opening_time: e.target.value })} required /></Field>
            <Field label="Closing time *"><Input type="time" value={form.closing_time} onChange={(e) => setForm({ ...form, closing_time: e.target.value })} required /></Field>
          </div>
          <p className="text-xs text-muted-foreground">Open/Closed status is calculated live in Africa/Lagos time.</p>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Latitude"><Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="6.3811" /></Field>
            <Field label="Longitude"><Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="5.5702" /></Field>
            <Field label="Google Maps URL"><Input value={form.google_maps_url} onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })} placeholder="https://maps.app.goo.gl/…" /></Field>
          </div>

          <div className="space-y-2">
            <Label>General services offered</Label>
            <p className="text-xs text-muted-foreground">
              Select from the catalogue or type a new service name and choose "Create" to save it for re-use.
            </p>
            <ServiceMultiSelect
              value={form.services}
              onChange={setServices}
              placeholder="Add general services…"
              ariaLabel="General services"
            />
          </div>

          <div className="space-y-2 rounded-lg border border-border p-3">
            <Label className="text-sm font-semibold">Weekly clinic schedule</Label>
            <p className="text-xs text-muted-foreground">
              For each day, pick or create the clinics scheduled. Days left empty display as "No scheduled clinic".
            </p>
            <div className="space-y-3">
              {DAY_KEYS.map((d) => (
                <div key={d} className="rounded border border-border/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">{DAY_LABELS[d]}</div>
                    <span className="text-xs text-muted-foreground">
                      {form.daySvc[d].length === 0
                        ? "No scheduled clinic"
                        : `${form.daySvc[d].length} clinic${form.daySvc[d].length === 1 ? "" : "s"}`}
                    </span>
                  </div>
                  <ServiceMultiSelect
                    value={form.daySvc[d]}
                    onChange={(next) => setDayServices(d, next)}
                    placeholder={`Add clinics for ${DAY_LABELS[d]}…`}
                    ariaLabel={`${DAY_LABELS[d]} clinics`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>PHC image</Label>
            {form.image_url && (
              <PhcImage phc={{ image_url: form.image_url, name: form.name || "PHC" }} aspect="aspect-[16/9]" />
            )}
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0]; if (f) handleImage(f);
                }}
              />
              {form.image_url && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    const prev = extractPhcImagePath(form.image_url);
                    if (prev) await supabase.storage.from("phc-images").remove([prev]);
                    setForm({ ...form, image_url: "" });
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted formats: JPG, PNG, WebP · Max size: 5 MB.
              {uploading && <> <ImageIcon className="ml-1 inline h-3 w-3" /> Uploading…</>}
            </p>
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
  const [categories, setCategories] = useState<string[]>([]);
  const [f, setF] = useState({
    title: article?.title ?? "",
    category: article?.category ?? "",
    summary: article?.summary ?? "",
    content: article?.content ?? "",
    tags: (article?.tags ?? []).join(", "),
    published: article?.published ?? true,
  });
  const [newCategory, setNewCategory] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    const { data } = await supabase.from("article_categories").select("name").order("name");
    const names = (data ?? []).map((r) => r.name as string);
    setCategories(names);
    if (!f.category && names.length > 0) setF((s) => ({ ...s, category: names[0] }));
  }
  useEffect(() => { loadCategories(); /* eslint-disable-next-line */ }, []);

  async function addCategoryInline() {
    const name = newCategory.trim();
    if (!name) return;
    setCreatingCat(true);
    const { error } = await supabase.from("article_categories").insert({ name });
    setCreatingCat(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Category "${name}" added`);
    setNewCategory("");
    await loadCategories();
    setF((s) => ({ ...s, category: name }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title.trim() || !f.summary.trim() || !f.content.trim()) {
      toast.error("Title, summary and content are required"); return;
    }
    if (!f.category.trim()) { toast.error("Please choose a category"); return; }
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
          <Field label="Category *">
            <div className="space-y-2">
              <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
                <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Or create a new category (e.g. Health Insurance)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={addCategoryInline} disabled={creatingCat || !newCategory.trim()}>
                  Add
                </Button>
              </div>
            </div>
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

// =================== CATEGORY MANAGER ===================
type CategoryRow = { id: string; name: string };

function CategoryManager() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);
  const [reassignTo, setReassignTo] = useState<string>("");

  async function load() {
    setLoading(true);
    const [cats, arts] = await Promise.all([
      supabase.from("article_categories").select("id,name").order("name"),
      supabase.from("health_articles").select("category"),
    ]);
    if (cats.error) toast.error(cats.error.message);
    const list = (cats.data ?? []) as CategoryRow[];
    setRows(list);
    const map: Record<string, number> = {};
    for (const a of (arts.data ?? []) as { category: string }[]) {
      map[a.category] = (map[a.category] ?? 0) + 1;
    }
    setCounts(map);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function addCategory() {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    const { error } = await supabase.from("article_categories").insert({ name });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Category added");
    setNewName("");
    load();
  }

  async function saveEdit() {
    if (!editing) return;
    const name = editName.trim();
    if (!name) return toast.error("Name is required");
    if (name === editing.name) { setEditing(null); return; }
    const oldName = editing.name;
    const { error } = await supabase.from("article_categories").update({ name }).eq("id", editing.id);
    if (error) return toast.error(error.message);
    // Cascade rename onto articles that used the old label.
    const { error: updErr } = await supabase.from("health_articles").update({ category: name }).eq("category", oldName);
    if (updErr) toast.error(`Category renamed, but article update failed: ${updErr.message}`);
    else toast.success("Category renamed");
    setEditing(null);
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    const count = counts[deleting.name] ?? 0;
    if (count > 0) {
      if (!reassignTo) { toast.error("Choose a category to reassign articles to"); return; }
      if (reassignTo === deleting.name) { toast.error("Choose a different category"); return; }
      const { error: reErr } = await supabase.from("health_articles")
        .update({ category: reassignTo }).eq("category", deleting.name);
      if (reErr) return toast.error(reErr.message);
    }
    const { error } = await supabase.from("article_categories").delete().eq("id", deleting.id);
    if (error) return toast.error(error.message);
    toast.success("Category deleted");
    setDeleting(null);
    setReassignTo("");
    load();
  }

  const otherCategories = deleting ? rows.filter((r) => r.id !== deleting.id) : [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Article categories</h2>
        <p className="text-sm text-muted-foreground">
          Manage the topic tags used across the Health Information page. Renames update every article automatically.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Add new category</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="e.g. Health Insurance"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button onClick={addCategory} disabled={creating || !newName.trim()}>
            <Plus className="mr-1 h-4 w-4" />Add
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? <div className="p-4"><Skeleton className="h-24 w-full" /></div>
            : rows.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground">No categories yet.</div>
            : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {rows.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{counts[c.name] ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setEditName(c.name); }} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { setDeleting(c); setReassignTo(""); }} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename category</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              All articles currently in "{editing?.name}" will be moved to the new name automatically.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete "{deleting?.name}"?</DialogTitle></DialogHeader>
          {deleting && (
            <div className="space-y-3 text-sm">
              {(counts[deleting.name] ?? 0) > 0 ? (
                <>
                  <p className="text-foreground">
                    <b>{counts[deleting.name]}</b> article{counts[deleting.name] === 1 ? "" : "s"} currently use this category.
                    Choose a category to reassign them to before deletion.
                  </p>
                  <div className="space-y-1">
                    <Label>Reassign articles to</Label>
                    <Select value={reassignTo} onValueChange={setReassignTo}>
                      <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                      <SelectContent>
                        {otherCategories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No articles use this category. It can be safely removed.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

