import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadCmsImage, removeCmsImage } from "@/lib/cms-upload";
import { CmsImage } from "@/components/cms-image";
import type { Stakeholder } from "@/lib/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const empty = {
  name: "", role_title: "", organization: "", statement: "", description: "",
  image_url: "", image_alt: "", published: true,
};

export function StakeholderManager() {
  const [rows, setRows] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Stakeholder | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Stakeholder | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("stakeholders").select("*").order("display_order");
    if (error) toast.error(error.message);
    setRows((data ?? []) as Stakeholder[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function move(row: Stakeholder, dir: -1 | 1) {
    const idx = rows.findIndex((r) => r.id === row.id);
    const other = rows[idx + dir];
    if (!other) return;
    await Promise.all([
      supabase.from("stakeholders").update({ display_order: other.display_order }).eq("id", row.id),
      supabase.from("stakeholders").update({ display_order: row.display_order }).eq("id", other.id),
    ]);
    load();
  }

  async function togglePublished(row: Stakeholder) {
    const { error } = await supabase.from("stakeholders").update({ published: !row.published }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(!row.published ? "Stakeholder published" : "Moved to draft");
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    await removeCmsImage(deleting.image_url);
    const { error } = await supabase.from("stakeholders").delete().eq("id", deleting.id);
    if (error) return toast.error(error.message);
    toast.success("Stakeholder removed");
    setDeleting(null);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Stakeholders</h2>
          <p className="text-sm text-muted-foreground">
            Profiles shown on the About page. Drafts stay hidden from the public until published.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="mr-1.5 h-4 w-4" /> Add stakeholder</Button>
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stakeholders yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-start gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  <CmsImage value={r.image_url} alt={r.image_alt || r.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{r.name}</h3>
                    <Badge variant={r.published ? "outline" : "secondary"}>
                      {r.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-primary">{r.role_title}</p>
                  <p className="text-xs text-muted-foreground">{r.organization}</p>
                  {r.statement && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.statement}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Button size="icon" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move(r, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(r, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Switch checked={r.published} onCheckedChange={() => togglePublished(r)} aria-label="Published" />
                  <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => setDeleting(r)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <StakeholderForm
          row={editing}
          nextOrder={(rows[rows.length - 1]?.display_order ?? 0) + 10}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the profile and its photo from the About page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StakeholderForm({
  row, nextOrder, onClose, onSaved,
}: { row: Stakeholder | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: row?.name ?? empty.name,
    role_title: row?.role_title ?? "",
    organization: row?.organization ?? "",
    statement: row?.statement ?? "",
    description: row?.description ?? "",
    image_url: row?.image_url ?? "",
    image_alt: row?.image_alt ?? "",
    published: row?.published ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleImage(file: File) {
    setUploading(true);
    const res = await uploadCmsImage(file, form.image_url || null);
    setUploading(false);
    if ("error" in res) return toast.error(res.error);
    setForm((f) => ({ ...f, image_url: res.path }));
    toast.success("Photo uploaded");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const payload = {
      name: form.name.trim(),
      role_title: form.role_title.trim() || null,
      organization: form.organization.trim() || null,
      statement: form.statement.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url || null,
      image_alt: form.image_alt.trim() || null,
      published: form.published,
      updated_by: u.user?.id ?? null,
    };
    const res = row
      ? await supabase.from("stakeholders").update(payload).eq("id", row.id)
      : await supabase.from("stakeholders").insert({ ...payload, display_order: nextOrder });
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    if (row) {
      await supabase.from("content_revisions").insert({
        entity: "stakeholders",
        entity_id: row.id,
        snapshot: JSON.parse(JSON.stringify(row)),
        updated_by: u.user?.id ?? null,
        updated_by_email: u.user?.email ?? null,
      });
    }
    toast.success(row ? "Stakeholder updated" : "Stakeholder added");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row ? "Edit stakeholder" : "Add stakeholder"}</DialogTitle>
          <DialogDescription>Shown in the Stakeholders section of the About page.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Role / title</Label>
              <Input value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Organization</Label>
              <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Statement / quote</Label>
            <Textarea rows={3} value={form.statement} onChange={(e) => setForm({ ...form, statement: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-lg border border-border bg-muted">
              <CmsImage value={form.image_url} alt={form.image_alt || form.name} className="h-full w-full object-cover" />
            </div>
            <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload photo"}
              <input
                type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }}
              />
            </Label>
            <div className="min-w-[200px] flex-1">
              <Label>Photo description (alt text)</Label>
              <Input value={form.image_alt} onChange={(e) => setForm({ ...form, image_alt: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} id="sh-pub" />
            <Label htmlFor="sh-pub">Published (visible on the public website)</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
