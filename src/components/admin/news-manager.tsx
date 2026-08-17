import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Eye, Upload, X, ArrowUp, ArrowDown, Megaphone, Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadCmsImage, removeCmsImage } from "@/lib/cms-upload";
import { CmsImage } from "@/components/cms-image";
import { RichText } from "@/components/rich-text";
import { EventTimingBadge } from "@/components/news-card";
import {
  fetchAllNews, fetchNewsCategories, fetchNewsImages, formatEventDate, formatPublishedAt,
  slugify, uniqueSlug,
  type NewsCategory, type NewsImage, type NewsPostWithCategory, type NewsStatus,
} from "@/lib/news";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const IMAGE_FOLDER = "news";

const STATUS_STYLES: Record<NewsStatus, string> = {
  published: "border-success/30 bg-success/10 text-success",
  draft: "border-muted-foreground/20 bg-muted text-muted-foreground",
  unpublished: "border-destructive/30 bg-destructive/10 text-destructive",
};
const STATUS_LABEL: Record<NewsStatus, string> = {
  published: "Published",
  draft: "Draft",
  unpublished: "Unpublished",
};

interface Draft {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category_id: string | null;
  featured_image: string | null;
  featured_image_alt: string;
  status: NewsStatus;
  featured: boolean;
  published_at: string | null;
  event_date: string;
  event_time: string;
  location: string;
  contact_information: string;
  call_to_action_text: string;
  call_to_action_url: string;
}

const EMPTY: Draft = {
  title: "", slug: "", summary: "", content: "", category_id: null,
  featured_image: null, featured_image_alt: "", status: "draft", featured: false,
  published_at: null, event_date: "", event_time: "", location: "",
  contact_information: "", call_to_action_text: "", call_to_action_url: "",
};

function toDraft(p: NewsPostWithCategory): Draft {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    summary: p.summary ?? "",
    content: p.content ?? "",
    category_id: p.category_id,
    featured_image: p.featured_image,
    featured_image_alt: p.featured_image_alt ?? "",
    status: p.status,
    featured: p.featured,
    published_at: p.published_at,
    event_date: p.event_date ?? "",
    event_time: p.event_time ?? "",
    location: p.location ?? "",
    contact_information: p.contact_information ?? "",
    call_to_action_text: p.call_to_action_text ?? "",
    call_to_action_url: p.call_to_action_url ?? "",
  };
}

export function NewsManager() {
  const [rows, setRows] = useState<NewsPostWithCategory[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | NewsStatus>("all");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [previewing, setPreviewing] = useState<{ draft: Draft; images: NewsImage[] } | null>(null);
  const [deleting, setDeleting] = useState<NewsPostWithCategory | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const [posts, cats] = await Promise.all([fetchAllNews(), fetchNewsCategories()]);
      setRows(posts);
      setCategories(cats);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load announcements");
    }
    setLoading(false);
  }

  useEffect(() => { void reload(); }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!needle) return true;
      return r.title.toLowerCase().includes(needle) || r.summary.toLowerCase().includes(needle);
    });
  }, [rows, q, statusFilter]);

  async function setStatus(post: NewsPostWithCategory, status: NewsStatus) {
    const patch: { status: NewsStatus; published_at?: string } = { status };
    if (status === "published" && !post.published_at) patch.published_at = new Date().toISOString();
    const { error } = await supabase.from("news_posts").update(patch).eq("id", post.id);
    if (error) { toast.error(error.message); return; }
    toast.success(
      status === "published" ? "Announcement published" :
      status === "unpublished" ? "Announcement unpublished" : "Moved back to draft",
    );
    void reload();
  }

  async function toggleFeatured(post: NewsPostWithCategory) {
    const { error } = await supabase.from("news_posts").update({ featured: !post.featured }).eq("id", post.id);
    if (error) { toast.error(error.message); return; }
    toast.success(post.featured ? "Removed from featured" : "Marked as featured");
    void reload();
  }

  async function confirmDelete() {
    if (!deleting) return;
    const post = deleting;
    const imgs = await fetchNewsImages(post.id);
    const { error } = await supabase.from("news_posts").delete().eq("id", post.id);
    if (error) { toast.error(error.message); return; }
    await Promise.all([
      removeCmsImage(post.featured_image),
      ...imgs.map((i) => removeCmsImage(i.image_url)),
    ]);
    setDeleting(null);
    toast.success("Announcement deleted");
    void reload();
  }

  async function openPreview(post: NewsPostWithCategory) {
    const imgs = await fetchNewsImages(post.id);
    setPreviewing({ draft: toDraft(post), images: imgs });
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" aria-hidden /> News &amp; Announcements
          </CardTitle>
          <CardDescription>
            Outreaches, campaigns, clinic updates and public health notices. Only published
            announcements appear on the website.
          </CardDescription>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="mr-2 h-4 w-4" aria-hidden /> Add announcement
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search announcements"
              aria-label="Search announcements"
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-full sm:w-48" aria-label="Filter by status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="unpublished">Unpublished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No announcements yet. Use “Add announcement” to create the first one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Featured</TableHead>
                  <TableHead className="hidden lg:table-cell">Event date</TableHead>
                  <TableHead className="hidden xl:table-cell">Published</TableHead>
                  <TableHead className="hidden xl:table-cell">Last updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[16rem]">
                      <p className="truncate font-medium text-foreground">{r.title}</p>
                      <p className="truncate text-xs text-muted-foreground">/news/{r.slug}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{r.category?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_STYLES[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Switch
                        checked={r.featured}
                        onCheckedChange={() => void toggleFeatured(r)}
                        aria-label={`Feature ${r.title}`}
                      />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {formatEventDate(r.event_date) ?? "—"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      {formatPublishedAt(r.published_at) ?? "—"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      {formatPublishedAt(r.updated_at) ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(toDraft(r))} aria-label={`Edit ${r.title}`}>
                          <Pencil className="h-4 w-4" aria-hidden />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void openPreview(r)} aria-label={`Preview ${r.title}`}>
                          <Eye className="h-4 w-4" aria-hidden />
                        </Button>
                        {r.status === "published" ? (
                          <Button size="sm" variant="outline" onClick={() => void setStatus(r, "unpublished")}>
                            Unpublish
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => void setStatus(r, "published")}>
                            Publish
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleting(r)}
                          aria-label={`Delete ${r.title}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <NewsCategoryManager categories={categories} posts={rows} onChange={reload} />
      </CardContent>

      {editing && (
        <NewsEditor
          draft={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); void reload(); }}
          onPreview={(d, imgs) => setPreviewing({ draft: d, images: imgs })}
        />
      )}

      {previewing && (
        <NewsPreview
          draft={previewing.draft}
          images={previewing.images}
          categories={categories}
          onClose={() => setPreviewing(null)}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” and its photographs will be permanently removed. This cannot be undone.
              If you only want to hide it from the public website, use Unpublish instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Delete permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

/* ============================ EDITOR ============================ */

function NewsEditor({
  draft: initial, categories, onClose, onSaved, onPreview,
}: {
  draft: Draft;
  categories: NewsCategory[];
  onClose: () => void;
  onSaved: () => void;
  onPreview: (d: Draft, imgs: NewsImage[]) => void;
}) {
  const [d, setD] = useState<Draft>(initial);
  const [images, setImages] = useState<NewsImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));

  useEffect(() => {
    if (initial.id) void fetchNewsImages(initial.id).then(setImages);
  }, [initial.id]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  async function persist(status: NewsStatus): Promise<string | null> {
    if (!d.title.trim()) { toast.error("A title is required"); return null; }
    if (status === "published" && !d.summary.trim()) {
      toast.error("Add a short summary before publishing"); return null;
    }
    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id ?? null;
    const slug = (slugTouched && d.slug.trim())
      ? await uniqueSlug(d.slug, d.id)
      : await uniqueSlug(d.title, d.id);

    const payload = {
      title: d.title.trim(),
      slug,
      summary: d.summary.trim(),
      content: d.content,
      category_id: d.category_id,
      featured_image: d.featured_image,
      featured_image_alt: d.featured_image_alt.trim() || null,
      status,
      featured: d.featured,
      published_at:
        status === "published" ? (d.published_at ?? new Date().toISOString()) : d.published_at,
      event_date: d.event_date || null,
      event_time: d.event_time.trim() || null,
      location: d.location.trim() || null,
      contact_information: d.contact_information.trim() || null,
      call_to_action_text: d.call_to_action_text.trim() || null,
      call_to_action_url: d.call_to_action_url.trim() || null,
      updated_by: uid,
    };

    let id = d.id ?? null;
    if (id) {
      const { error } = await supabase.from("news_posts").update(payload).eq("id", id);
      if (error) { setSaving(false); toast.error(error.message); return null; }
    } else {
      const { data, error } = await supabase
        .from("news_posts").insert({ ...payload, created_by: uid }).select("id").single();
      if (error || !data) { setSaving(false); toast.error(error?.message ?? "Could not save"); return null; }
      id = data.id;
    }
    setSaving(false);
    setD((p) => ({ ...p, id: id!, slug, status, published_at: payload.published_at }));
    return id;
  }

  async function save(status: NewsStatus) {
    const id = await persist(status);
    if (!id) return;
    toast.success(
      status === "published" ? "Announcement published" :
      status === "unpublished" ? "Announcement unpublished" : "Draft saved",
    );
    onSaved();
  }

  async function onFeaturedFile(file: File) {
    setUploading(true);
    const res = await uploadCmsImage(file, d.featured_image, IMAGE_FOLDER);
    setUploading(false);
    if ("error" in res) { toast.error(res.error); return; }
    set("featured_image", res.path);
    toast.success("Featured image uploaded");
  }

  async function onSupportingFiles(files: FileList) {
    const id = d.id ?? (await persist(d.status));
    if (!id) { toast.error("Save the announcement first, then add photographs"); return; }
    setUploading(true);
    let order = images.length;
    for (const file of Array.from(files)) {
      const res = await uploadCmsImage(file, null, IMAGE_FOLDER);
      if ("error" in res) { toast.error(`${file.name}: ${res.error}`); continue; }
      const { data, error } = await supabase
        .from("news_images")
        .insert({ post_id: id, image_url: res.path, image_alt: "", display_order: order++ })
        .select("id,post_id,image_url,image_alt,display_order")
        .single();
      if (error || !data) { toast.error(error?.message ?? "Could not attach image"); continue; }
      setImages((prev) => [...prev, data as NewsImage]);
    }
    setUploading(false);
  }

  async function updateImageAlt(img: NewsImage, alt: string) {
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, image_alt: alt } : i)));
    await supabase.from("news_images").update({ image_alt: alt }).eq("id", img.id);
  }

  async function removeImage(img: NewsImage) {
    const { error } = await supabase.from("news_images").delete().eq("id", img.id);
    if (error) { toast.error(error.message); return; }
    await removeCmsImage(img.image_url);
    setImages((prev) => prev.filter((i) => i.id !== img.id));
    toast.success("Photograph removed");
  }

  async function moveImage(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((i, idx) => ({ ...i, display_order: idx }));
    setImages(reordered);
    await Promise.all(
      reordered.map((i) => supabase.from("news_images").update({ display_order: i.display_order }).eq("id", i.id)),
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{d.id ? "Edit announcement" : "New announcement"}</DialogTitle>
          <DialogDescription>
            Fill in the details below. Nothing appears on the website until you press Publish.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="news-title">Title</Label>
            <Input
              id="news-title"
              value={d.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              placeholder="Free Health Screening Outreach at Ogida PHC"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="news-slug">Web address</Label>
            <Input
              id="news-slug"
              value={d.slug}
              onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }}
              placeholder="free-health-screening-outreach-ogida-phc"
            />
            <p className="text-xs text-muted-foreground">
              The page will be at /news/{slugify(d.slug || d.title) || "…"}. A number is added
              automatically if this address is already used.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="news-category">Category</Label>
              <Select
                value={d.category_id ?? "none"}
                onValueChange={(v) => set("category_id", v === "none" ? null : v)}
              >
                <SelectTrigger id="news-category"><SelectValue placeholder="Choose a category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-3 pb-1">
              <Switch id="news-featured" checked={d.featured} onCheckedChange={(v) => set("featured", v)} />
              <Label htmlFor="news-featured" className="mb-1.5">Feature on the homepage</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="news-summary">Summary</Label>
            <Textarea
              id="news-summary"
              rows={3}
              value={d.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="Residents of Egor LGA are invited to a free community health screening exercise."
            />
            <p className="text-xs text-muted-foreground">Shown on cards, previews and social media shares.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="news-content">Full content</Label>
            <FormattingToolbar targetId="news-content" onInsert={(text) => set("content", text)} value={d.content} />
            <Textarea
              id="news-content"
              rows={12}
              value={d.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder={"## Heading\n\nParagraph text with **bold** and *italic*.\n\n- Bulleted point\n1. Numbered point\n\n[Link text](https://example.com)"}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use ## for headings, ** ** for bold, * * for italics, - for bullets, 1. for numbers and
              [text](link) for links. The website controls all typography and spacing.
            </p>
          </div>

          {/* EVENT DETAILS */}
          <fieldset className="space-y-4 rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">
              Event / outreach details <span className="font-normal text-muted-foreground">(optional)</span>
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="news-date">Event date</Label>
                <Input id="news-date" type="date" value={d.event_date} onChange={(e) => set("event_date", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-time">Event time</Label>
                <Input id="news-time" value={d.event_time} onChange={(e) => set("event_time", e.target.value)} placeholder="9:00 AM – 2:00 PM" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-location">Location</Label>
                <Input id="news-location" value={d.location} onChange={(e) => set("location", e.target.value)} placeholder="Ogida PHC" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-contact">Contact information</Label>
                <Input id="news-contact" value={d.contact_information} onChange={(e) => set("contact_information", e.target.value)} placeholder="0800 000 0000" />
              </div>
            </div>
          </fieldset>

          {/* CALL TO ACTION */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="news-cta-text">Call-to-action button text</Label>
              <Input id="news-cta-text" value={d.call_to_action_text} onChange={(e) => set("call_to_action_text", e.target.value)} placeholder="Find your nearest PHC" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-cta-url">Call-to-action link</Label>
              <Input id="news-cta-url" value={d.call_to_action_url} onChange={(e) => set("call_to_action_url", e.target.value)} placeholder="/directory" />
            </div>
          </div>

          {/* FEATURED IMAGE */}
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Featured image</p>
                <p className="text-xs text-muted-foreground">Used on news cards, the homepage and social shares. JPG, PNG or WebP, up to 5 MB.</p>
              </div>
              <label className="shrink-0">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFeaturedFile(f); e.target.value = ""; }}
                />
                <span className="inline-flex cursor-pointer items-center rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent">
                  <Upload className="mr-2 h-4 w-4" aria-hidden /> {d.featured_image ? "Replace" : "Upload"}
                </span>
              </label>
            </div>
            {d.featured_image ? (
              <div className="space-y-2">
                <div className="overflow-hidden rounded-lg border border-border bg-primary-soft">
                  <CmsImage value={d.featured_image} alt={d.featured_image_alt || "Featured image preview"} className="h-40 w-full object-cover" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="news-alt">Image description (alt text)</Label>
                  <Input
                    id="news-alt"
                    value={d.featured_image_alt}
                    onChange={(e) => set("featured_image_alt", e.target.value)}
                    placeholder="Health workers conducting blood pressure screening during an Egor LGA outreach."
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={async () => { await removeCmsImage(d.featured_image); set("featured_image", null); }}
                >
                  <X className="mr-1 h-4 w-4" aria-hidden /> Remove featured image
                </Button>
              </div>
            ) : null}
          </div>

          {/* SUPPORTING IMAGES */}
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Supporting photographs</p>
                <p className="text-xs text-muted-foreground">Shown as a gallery on the announcement page.</p>
              </div>
              <label className="shrink-0">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files; if (f?.length) void onSupportingFiles(f); e.target.value = ""; }}
                />
                <span className="inline-flex cursor-pointer items-center rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent">
                  <Upload className="mr-2 h-4 w-4" aria-hidden /> Add photographs
                </span>
              </label>
            </div>
            {images.length === 0 ? (
              <p className="text-xs text-muted-foreground">No supporting photographs yet.</p>
            ) : (
              <ul className="space-y-3">
                {images.map((img, idx) => (
                  <li key={img.id} className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row">
                    <div className="h-24 w-full shrink-0 overflow-hidden rounded-md bg-primary-soft sm:w-36">
                      <CmsImage value={img.image_url} alt={img.image_alt || "Supporting photograph"} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`alt-${img.id}`} className="text-xs">Image description (alt text)</Label>
                      <Input
                        id={`alt-${img.id}`}
                        value={img.image_alt}
                        onChange={(e) => void updateImageAlt(img, e.target.value)}
                        placeholder="Community members waiting to be screened."
                      />
                      <div className="flex flex-wrap gap-1">
                        <Button type="button" size="sm" variant="ghost" onClick={() => void moveImage(idx, -1)} disabled={idx === 0} aria-label="Move image up">
                          <ArrowUp className="h-4 w-4" aria-hidden />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => void moveImage(idx, 1)} disabled={idx === images.length - 1} aria-label="Move image down">
                          <ArrowDown className="h-4 w-4" aria-hidden />
                        </Button>
                        <Button
                          type="button" size="sm" variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => void removeImage(img)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" aria-hidden /> Remove photograph
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => onPreview(d, images)}>
              <Eye className="mr-2 h-4 w-4" aria-hidden /> Preview
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={saving || uploading} onClick={() => void save("draft")}>
              Save draft
            </Button>
            {d.status === "published" ? (
              <Button type="button" variant="outline" disabled={saving || uploading} onClick={() => void save("unpublished")}>
                Unpublish
              </Button>
            ) : null}
            <Button type="button" disabled={saving || uploading} onClick={() => void save("published")}>
              {saving ? "Saving…" : "Publish"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Small markdown insert toolbar for the content field. */
function FormattingToolbar({
  targetId, value, onInsert,
}: { targetId: string; value: string; onInsert: (next: string) => void }) {
  function wrap(before: string, after = before, placeholder = "text") {
    const el = document.getElementById(targetId) as HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    onInsert(`${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }
  function line(prefix: string, placeholder: string) {
    const el = document.getElementById(targetId) as HTMLTextAreaElement | null;
    const start = el?.selectionStart ?? value.length;
    const head = value.slice(0, start);
    const sep = head.length === 0 || head.endsWith("\n") ? "" : "\n";
    onInsert(`${head}${sep}${prefix}${placeholder}\n${value.slice(start)}`);
  }
  const btn = "rounded-md border border-input px-2 py-1 text-xs font-medium hover:bg-accent";
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Text formatting">
      <button type="button" className={btn} onClick={() => line("## ", "Heading")}>Heading</button>
      <button type="button" className={btn} onClick={() => wrap("**", "**", "bold text")}><strong>B</strong></button>
      <button type="button" className={btn} onClick={() => wrap("*", "*", "italic text")}><em>I</em></button>
      <button type="button" className={btn} onClick={() => line("- ", "List item")}>Bullets</button>
      <button type="button" className={btn} onClick={() => line("1. ", "List item")}>Numbers</button>
      <button type="button" className={btn} onClick={() => wrap("[", "](https://)", "link text")}>Link</button>
    </div>
  );
}

/* ============================ PREVIEW ============================ */

function NewsPreview({
  draft, images, categories, onClose,
}: { draft: Draft; images: NewsImage[]; categories: NewsCategory[]; onClose: () => void }) {
  const category = categories.find((c) => c.id === draft.category_id);
  const eventDate = formatEventDate(draft.event_date || null);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>
            Approximately how this announcement will look publicly. Close to return to editing.
          </DialogDescription>
        </DialogHeader>
        <article className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {category ? <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">{category.name}</Badge> : null}
            <EventTimingBadge date={draft.event_date || null} />
          </div>
          <h2 className="text-2xl font-bold leading-tight text-foreground">{draft.title || "Untitled announcement"}</h2>
          {draft.summary ? <p className="text-base text-foreground/90">{draft.summary}</p> : null}
          {draft.featured_image ? (
            <div className="overflow-hidden rounded-xl border border-border bg-primary-soft">
              <CmsImage value={draft.featured_image} alt={draft.featured_image_alt || draft.title} className="h-auto w-full object-cover" />
            </div>
          ) : null}
          {(eventDate || draft.event_time || draft.location || draft.contact_information) && (
            <div className="rounded-xl border border-primary/20 bg-primary-soft/40 p-4 text-sm">
              {eventDate ? <p><span className="font-medium">Date:</span> {eventDate}</p> : null}
              {draft.event_time ? <p><span className="font-medium">Time:</span> {draft.event_time}</p> : null}
              {draft.location ? <p><span className="font-medium">Location:</span> {draft.location}</p> : null}
              {draft.contact_information ? <p><span className="font-medium">Contact:</span> {draft.contact_information}</p> : null}
            </div>
          )}
          {draft.content ? <RichText text={draft.content} /> : null}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {images.map((i) => (
                <div key={i.id} className="overflow-hidden rounded-lg border border-border bg-primary-soft">
                  <CmsImage value={i.image_url} alt={i.image_alt || draft.title} className="h-32 w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </article>
        <DialogFooter>
          <Button onClick={onClose}>Back to editing</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ======================= CATEGORY MANAGEMENT ======================= */

function NewsCategoryManager({
  categories, posts, onChange,
}: { categories: NewsCategory[]; posts: NewsPostWithCategory[]; onChange: () => void }) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<NewsCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState<NewsCategory | null>(null);
  const [reassignTo, setReassignTo] = useState("none");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of posts) if (p.category_id) m.set(p.category_id, (m.get(p.category_id) ?? 0) + 1);
    return m;
  }, [posts]);

  async function add() {
    const n = name.trim();
    if (!n) return;
    const { error } = await supabase.from("news_categories").insert({
      name: n, slug: slugify(n), display_order: categories.length + 1,
    });
    if (error) { toast.error(error.message.includes("duplicate") ? "That category already exists" : error.message); return; }
    setName("");
    toast.success("Category added");
    onChange();
  }

  async function saveEdit() {
    if (!editing || !editName.trim()) return;
    const { error } = await supabase
      .from("news_categories")
      .update({ name: editName.trim(), slug: slugify(editName) })
      .eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    setEditing(null);
    toast.success("Category updated");
    onChange();
  }

  async function confirmDelete() {
    if (!deleting) return;
    const used = counts.get(deleting.id) ?? 0;
    if (used > 0) {
      const target = reassignTo === "none" ? null : reassignTo;
      const { error } = await supabase
        .from("news_posts").update({ category_id: target }).eq("category_id", deleting.id);
      if (error) { toast.error(error.message); return; }
    }
    const { error } = await supabase.from("news_categories").delete().eq("id", deleting.id);
    if (error) { toast.error(error.message); return; }
    setDeleting(null);
    setReassignTo("none");
    toast.success("Category deleted");
    onChange();
  }

  return (
    <section className="rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground">Announcement categories</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Add your own categories at any time, for example “Maternal and Child Health”.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          aria-label="New category name"
        />
        <Button type="button" onClick={() => void add()} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" aria-hidden /> Add category
        </Button>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {categories.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <div>
              <p className="text-sm font-medium text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {counts.get(c.id) ?? 0} announcement{(counts.get(c.id) ?? 0) === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(c); setEditName(c.name); }} aria-label={`Rename ${c.name}`}>
                <Pencil className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                size="sm" variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => { setDeleting(c); setReassignTo("none"); }}
                aria-label={`Delete ${c.name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename category</DialogTitle>
            <DialogDescription>Announcements in this category keep their assignment.</DialogDescription>
          </DialogHeader>
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} aria-label="Category name" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => void saveEdit()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {(counts.get(deleting?.id ?? "") ?? 0) > 0
                ? `${counts.get(deleting?.id ?? "")} announcement(s) use this category. Choose where to move them before deleting.`
                : "No announcements use this category, so it is safe to delete."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(counts.get(deleting?.id ?? "") ?? 0) > 0 && (
            <div className="space-y-2">
              <Label htmlFor="reassign">Move announcements to</Label>
              <Select value={reassignTo} onValueChange={setReassignTo}>
                <SelectTrigger id="reassign"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.filter((c) => c.id !== deleting?.id).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Delete category</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
