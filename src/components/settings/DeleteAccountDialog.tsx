import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";

export function DeleteAccountDialog() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const isGoogleUser = user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google');

  const handleDelete = async () => {
    if (!user) return;
    if (isGoogleUser && confirmText !== "DELETE") return;
    if (!isGoogleUser && !password) return;

    try {
      setIsDeleting(true);

      if (!isGoogleUser) {
        const { error } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: password,
        });
        if (error) throw new Error("Incorrect password. Account deletion failed.");
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const response = await apiFetch("/api/auth/delete-account", {
        method: "DELETE",
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to delete account");
      }

      await signOut();
      toast.success("Account deleted successfully");
      navigate({ to: "/" });
    } catch (error: any) {
      toast.error(error.message || "An error occurred while deleting your account");
      setOpen(false);
      setConfirmText("");
      setPassword("");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account,
            startups, validation reports, and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4 space-y-4">
          <div className="space-y-2">
            {isGoogleUser ? (
              <>
                <Label htmlFor="confirm">
                  Please type <strong>DELETE</strong> to confirm.
                </Label>
                <Input 
                  id="confirm" 
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="border-destructive/50 focus-visible:ring-destructive/30"
                />
              </>
            ) : (
              <>
                <Label htmlFor="password">
                  Please enter your password to confirm.
                </Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="border-destructive/50 focus-visible:ring-destructive/30"
                />
              </>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={() => { setConfirmText(""); setPassword(""); }}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={(isGoogleUser ? confirmText !== "DELETE" : !password) || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
