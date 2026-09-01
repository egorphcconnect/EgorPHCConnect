import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { RefreshCw, ShieldPlus, ShieldMinus } from "lucide-react";

import { listAdmins, grantAdmin, revokeAdmin, type AdminUser } from "@/lib/admins.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AdminUsersManager() {
  const load = useServerFn(listAdmins);
  const grant = useServerFn(grantAdmin);
  const revoke = useServerFn(revokeAdmin);

  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<AdminUser | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await load());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load administrators");
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => { void reload(); }, [reload]);

  async function onGrant(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await grant({ data: { email } });
      toast.success(`${r.email} is now an administrator`);
      setEmail("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not grant access");
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke(row: AdminUser) {
    try {
      await revoke({ data: { userId: row.userId } });
      toast.success(`Admin access removed for ${row.email}`);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove access");
    } finally {
      setPendingRemove(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Administrators</CardTitle>
            <CardDescription>
              Grant or remove admin access. The person must sign in once at the staff sign-in page first,
              then you can add their email here.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={onGrant} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <Label htmlFor="admin-email">Email address</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={busy}>
            <ShieldPlus className="mr-2 h-4 w-4" />{busy ? "Adding…" : "Make administrator"}
          </Button>
        </form>

        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="w-[160px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.userId}>
                  <TableCell className="break-all">
                    {r.email} {r.isSelf && <Badge variant="secondary" className="ml-2">You</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={r.isSelf}
                      onClick={() => setPendingRemove(r)}
                    >
                      <ShieldMinus className="mr-2 h-4 w-4" />Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground">No administrators found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog open={!!pendingRemove} onOpenChange={(o) => !o && setPendingRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove admin access?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemove?.email} will no longer be able to manage the website. Their account stays active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingRemove && void onRevoke(pendingRemove)}>
              Remove access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
