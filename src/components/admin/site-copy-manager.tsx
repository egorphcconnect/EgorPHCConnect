import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, History, RotateCcw, Save, Upload, Eye, FileEdit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CONTENT_PAGES, LEGAL_WARNING, type BlockDef, type PageDef } from "@/lib/content-defaults";
import { uploadCmsImage } from "@/lib/cms-upload";
import { CmsImage } from "@/components/cms-image";
import { RichText } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Row {
  id: string;
  page: string;
  block_key: string;
  value: string;
  draft_value: string | null;
  updated_at: string;
}

interface Revision {
  id: string;
  entity: string;
  entity_id: string;
  snapshot: { value?: string; label?: string } | null;
  updated_by_email: string | null;
  created_at: string;
}

export function SiteCopyManager() {
  const [page, setPage] = useState<string>(CONTENT_PAGES[0].page);
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState<BlockDef | null>(null);
  const [historyFor, setHistoryFor] = useState<BlockDef | null>(null);
  const [preview, setPreview] = useState<BlockDef | null>(null);

  const def = useMemo(() => CONTENT_PAGES.find((p) => p.page === page) as PageDef, [page]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("site_content").select("*");
    if (error) toast.error(error.message);
    const map: Record<string, Row> = {};
    for (const r of (data ?? []) as Row[]) map[`${r.page}.${r.block_key}`] = r;
    setRows(map);
    setDrafts({});
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const rowFor = (b: BlockDef) => rows[`${page}.${b.key}`];
  const publishedValue = (b: BlockDef) => rowFor(b)?.value ?? b.default;
  const currentDraft = (b: BlockDef) => {
    const local = drafts[`${page}.${b.key}`];
    if (local !== undefined) return local;
    const r = rowFor(b);
    return r?.draft_value ?? r?.value ?? b.default;
  };
  const isDirty = (b: BlockDef) => drafts[`${page}.${b.key}`] !== undefined;
  const hasPendingDraft = (b: BlockDef) => {
    const r = rowFor(b);
    return !!r?.draft_value && r.draft_value !== r.value;
  };

  function setDraft(b: BlockDef, value: string) {
    setDrafts((d) => ({ ...d, [`${page}.${b.key}`]: value }));
  }

  async function upsert(b: BlockDef, patch: { value?: string; draft_value?: string | null }) {
    const { data: u } = await supabase.auth.getUser();
    const existing = rowFor(b);
    const payload = {
      page,
      block_key: b.key,
      value: patch.value ?? existing?.value ?? b.default,
      draft_value: patch.draft_value === undefined ? (existing?.draft_value ?? null) : patch.draft_value,
      updated_by: u.user?.id ?? null,
    };
    const res = existing
      ? await supabase.from("site_content").update(payload).eq("id", existing.id).select("*").single()
      : await supabase.from("site_content").insert(payload).select("*").single();
    if (res.error) { toast.error(res.error.message); return null; }
    const row = res.data as Row;
    setRows((r) => ({ ...r, [`${page}.${b.key}`]: row }));
    setDrafts((d) => { const n = { ...d }; delete n[`${page}.${b.key}`]; return n; });
    return row;
  }

  async function saveDraft(b: BlockDef) {
    setBusy(b.key);
    const ok = await upsert(b, { draft_value: currentDraft(b) });
    setBusy(null);
    if (ok) toast.success("Draft saved — not yet visible to the public.");
  }

  async function publish(b: BlockDef) {
    setBusy(b.key);
    const value = currentDraft(b);
    const previous = publishedValue(b);
    const row = await upsert(b, { value, draft_value: null });
    if (row) {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("content_revisions").insert({
        entity: "site_content",
        entity_id: `${page}.${b.key}`,
        snapshot: { value: previous, label: b.label },
        updated_by: u.user?.id ?? null,
        updated_by_email: u.user?.email ?? null,
      });
      toast.success("Published — now live on the website.");
    }
    setBusy(null);
    setConfirmPublish(null);
  }

  async function restoreDefault(b: BlockDef) {
    setDraft(b, b.default);
    toast.info("Default text restored in the editor. Save or publish to apply.");
  }

  async function handleUpload(b: BlockDef, file: File) {
    setBusy(b.key);
    const res = await uploadCmsImage(file, currentDraft(b) || null);
    setBusy(null);
    if ("error" in res) return toast.error(res.error);
    setDraft(b, res.path);
    toast.success("Image uploaded — publish to make it live.");
  }

  if (loading) return <div className="space-y-3 py-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-72 w-full" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Website copy</h2>
          <p className="text-sm text-muted-foreground">
            Edit the text shown on the public website. Save a draft while you work, then publish when it's ready.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Label className="text-xs text-muted-foreground">Page</Label>
          <Select value={page} onValueChange={(v) => setPage(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTENT_PAGES.map((p) => (
                <SelectItem key={p.page} value={p.page}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{def.description}</p>

      {def.legal && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{LEGAL_WARNING}</span>
        </div>
      )}

      <div className="space-y-4">
        {def.blocks.map((b) => {
          const draft = currentDraft(b);
          const pending = hasPendingDraft(b) || isDirty(b);
          return (
            <Card key={b.key} className={pending ? "border-secondary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{b.label}</CardTitle>
                    {b.help && <CardDescription>{b.help}</CardDescription>}
                  </div>
                  <div className="flex items-center gap-2">
                    {pending ? (
                      <Badge variant="secondary" className="gap-1"><FileEdit className="h-3 w-3" />Draft</Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-primary"><Eye className="h-3 w-3" />Published</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {b.kind === "text" && (
                  <Input value={draft} onChange={(e) => setDraft(b, e.target.value)} />
                )}
                {b.kind === "textarea" && (
                  <Textarea rows={3} value={draft} onChange={(e) => setDraft(b, e.target.value)} />
                )}
                {b.kind === "richtext" && (
                  <>
                    <Textarea rows={10} className="font-mono text-xs" value={draft} onChange={(e) => setDraft(b, e.target.value)} />
                    <p className="text-xs text-muted-foreground">
                      Formatting: <code>## Heading</code>, <code>- bullet</code>, <code>**bold**</code>, <code>[link](/contact)</code>. Leave a blank line between paragraphs.
                    </p>
                  </>
                )}
                {b.kind === "image" && (
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="h-24 w-40 overflow-hidden rounded-md border border-border bg-muted">
                      <CmsImage value={draft} alt={b.label} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                        <Upload className="h-4 w-4" /> Upload image
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(b, f); }}
                        />
                      </Label>
                      {draft && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setDraft(b, "")}>
                          Use built-in image
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" onClick={() => setConfirmPublish(b)} disabled={busy === b.key}>
                    <Save className="mr-1.5 h-4 w-4" /> Publish
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => saveDraft(b)} disabled={busy === b.key}>
                    Save draft
                  </Button>
                  {b.kind === "richtext" && (
                    <Button size="sm" variant="ghost" onClick={() => setPreview(b)}>
                      <Eye className="mr-1.5 h-4 w-4" /> Preview
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => restoreDefault(b)}>
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Restore default
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setHistoryFor(b)}>
                    <History className="mr-1.5 h-4 w-4" /> History
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!confirmPublish} onOpenChange={(o) => !o && setConfirmPublish(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish "{confirmPublish?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {def.legal
                ? LEGAL_WARNING + " This text will be visible to everyone immediately."
                : "This text will be visible to everyone on the website immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmPublish && publish(confirmPublish)}>
              Publish now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{preview?.label}</DialogTitle>
            <DialogDescription>Preview of how this text will appear.</DialogDescription>
          </DialogHeader>
          {preview && <RichText text={currentDraft(preview)} />}
        </DialogContent>
      </Dialog>

      <RevisionHistory
        open={!!historyFor}
        onClose={() => setHistoryFor(null)}
        entity="site_content"
        entityId={historyFor ? `${page}.${historyFor.key}` : ""}
        title={historyFor?.label ?? ""}
        onRestore={(value) => {
          if (historyFor) { setDraft(historyFor, value); toast.info("Previous version loaded into the editor."); }
          setHistoryFor(null);
        }}
      />
    </div>
  );
}

export function RevisionHistory({
  open, onClose, entity, entityId, title, onRestore,
}: {
  open: boolean;
  onClose: () => void;
  entity: string;
  entityId: string;
  title: string;
  onRestore?: (value: string) => void;
}) {
  const [rows, setRows] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !entityId) return;
    setLoading(true);
    supabase
      .from("content_revisions")
      .select("*")
      .eq("entity", entity)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setRows((data ?? []) as unknown as Revision[]);
        setLoading(false);
      });
  }, [open, entity, entityId]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version history — {title}</DialogTitle>
          <DialogDescription>The previous versions saved each time this content was published.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No earlier versions yet.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()} {r.updated_by_email ? `· ${r.updated_by_email}` : ""}
                  </span>
                  {onRestore && typeof r.snapshot?.value === "string" && (
                    <Button size="sm" variant="outline" onClick={() => onRestore(r.snapshot?.value ?? "")}>
                      Load this version
                    </Button>
                  )}
                </div>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                  {typeof r.snapshot?.value === "string"
                    ? r.snapshot.value
                    : JSON.stringify(r.snapshot, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
