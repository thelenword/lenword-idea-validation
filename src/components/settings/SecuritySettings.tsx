import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function SecuritySettings() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOutAll = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    await signOut(); // update local state
    navigate({ to: "/" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const memberSince = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "Recently";

  const authProvider = user?.app_metadata?.provider || 'email';
  const displayProvider = authProvider === 'email' ? 'Email / Password' : (authProvider.charAt(0).toUpperCase() + authProvider.slice(1));
  const lastSignIn = user?.last_sign_in_at 
    ? new Date(user.last_sign_in_at).toLocaleString() 
    : "Unknown";

  return (
    <div className="space-y-6">
      {/* Password Section */}
      <Card className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm border-white/20 dark:border-white/5 shadow-sm">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm border-destructive/20 dark:border-destructive/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-destructive/5 blur-[100px] rounded-full -mr-16 -mt-16 pointer-events-none" />
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
          <CardDescription>
            Manage your active sessions or permanently delete your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div>
              <p className="text-sm font-medium">Last Login</p>
              <p className="text-sm text-muted-foreground">{lastSignIn}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Authentication</p>
              <p className="text-sm text-muted-foreground">{displayProvider}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Member since</p>
              <p className="text-sm text-muted-foreground">{memberSince}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-muted-foreground">Active (Current Session)</span>
              </div>
            </div>
          </div>
          
          <Separator className="bg-border/50" />
          
          <div className="flex flex-col sm:flex-row gap-4 py-2">
            <Button variant="secondary" onClick={handleSignOut} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
            <Button variant="outline" onClick={handleSignOutAll} className="w-full sm:w-auto">
              Sign out of all devices
            </Button>
          </div>
          
          <Separator className="bg-border/50" />
          
          <div className="pt-2">
            <h4 className="text-sm font-medium text-destructive mb-2">Danger Zone</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently remove your account and all of your data from our servers. 
              This action cannot be undone.
            </p>
            <DeleteAccountDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
