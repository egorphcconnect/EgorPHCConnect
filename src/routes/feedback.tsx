import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { listPhcs, submitFeedback } from "@/lib/phcs.functions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVICE_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ phcId: z.string().uuid().optional() });

export const Route = createFileRoute("/feedback")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Leave Feedback — Egor PHC Connect" },
      {
        name: "description",
        content: "Share anonymous feedback about your visit to a Primary Healthcare Centre in Egor LGA.",
      },
      { property: "og:title", content: "Anonymous PHC Feedback" },
      { property: "og:description", content: "Help improve healthcare in Egor LGA — takes under a minute." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({ queryKey: ["phcs"], queryFn: () => listPhcs() });
  },
  component: FeedbackPage,
});

function FeedbackPage() {
  const search = Route.useSearch();
  const router = useRouter();
  const { data: phcs = [] } = useQuery({ queryKey: ["phcs"], queryFn: () => listPhcs() });

  const [phcId, setPhcId] = useState<string>(search.phcId ?? "");
  const [serviceUsed, setServiceUsed] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [staff, setStaff] = useState(0);
  const [waiting, setWaiting] = useState(0);
  const [clean, setClean] = useState(0);
  const [comments, setComments] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [done, setDone] = useState(false);

  const submit = useServerFn(submitFeedback);
  const mutation = useMutation({
    mutationFn: submit,
    onSuccess: () => setDone(true),
    onError: (e: Error) => toast.error(e.message || "Could not submit. Try again."),
  });

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary-soft text-secondary">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Thank you</h1>
        <p className="mt-2 text-muted-foreground">
          Your feedback helps Egor LGA improve healthcare for everyone. It is anonymous and confidential.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link to="/directory">Find another PHC</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDone(false);
              setPhcId("");
              setServiceUsed("");
              setRating(0);
              setStaff(0);
              setWaiting(0);
              setClean(0);
              setComments("");
              router.invalidate();
            }}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phcId) return toast.error("Please choose the PHC you visited.");
    if (rating < 1) return toast.error("Please give an overall rating.");
    mutation.mutate({
      data: {
        phc_id: phcId,
        service_used: serviceUsed,
        rating,
        staff_professionalism: staff || undefined,
        waiting_time: waiting || undefined,
        cleanliness: clean || undefined,
        comments,
        anonymous,
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Share your feedback</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Anonymous and takes under a minute. Your input helps improve care in Egor LGA.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-5 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
      >
        <div className="space-y-2">
          <Label htmlFor="phc">PHC visited *</Label>
          <Select value={phcId} onValueChange={setPhcId}>
            <SelectTrigger id="phc" className="h-11"><SelectValue placeholder="Choose a PHC" /></SelectTrigger>
            <SelectContent>
              {phcs.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} · {p.ward}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="svc">Service used</Label>
          <Input
            id="svc"
            list="svc-options"
            value={serviceUsed}
            onChange={(e) => setServiceUsed(e.target.value)}
            placeholder="Choose from the list or type your own"
            className="h-11"
            maxLength={120}
          />
          <datalist id="svc-options">
            {SERVICE_CATEGORIES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <StarRow label="Overall rating *" value={rating} onChange={setRating} />
        <StarRow label="Staff professionalism" value={staff} onChange={setStaff} />
        <StarRow label="Waiting time" value={waiting} onChange={setWaiting} hint="5 = very short, 1 = very long" />
        <StarRow label="Facility cleanliness" value={clean} onChange={setClean} />

        <div className="space-y-2">
          <Label htmlFor="comments">Comments</Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Anything else you'd like to share?"
          />
          <p className="text-xs text-muted-foreground">{comments.length}/1000</p>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="anon"
            checked={anonymous}
            onCheckedChange={(v) => setAnonymous(Boolean(v))}
          />
          <Label htmlFor="anon" className="text-sm font-normal">Submit anonymously</Label>
        </div>

        <Button type="submit" className="h-12 w-full text-base" disabled={mutation.isPending}>
          {mutation.isPending ? "Submitting…" : "Submit feedback"}
        </Button>
      </form>
    </div>
  );
}

function StarRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="block">{label}</Label>
      <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(n)}
            className={cn(
              "grid h-11 w-11 place-items-center rounded-md border transition-colors",
              value >= n
                ? "border-warning bg-warning/10 text-warning"
                : "border-input bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            <Star className={cn("h-5 w-5", value >= n && "fill-current")} />
          </button>
        ))}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
