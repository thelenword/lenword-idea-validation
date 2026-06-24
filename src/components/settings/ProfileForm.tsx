import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ProfileForm() {
  const { user, profile, updateProfile, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (profile && !initialized.current) {
      initialized.current = true;
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const isDirty = fullName !== (profile?.full_name || "") || 
                  username !== (profile?.username || "") || 
                  bio !== (profile?.bio || "");

  const handleSave = async () => {
    if (!isDirty) return;
    
    try {
      setIsSaving(true);
      await updateProfile({ full_name: fullName, username: username || null, bio: bio || null });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Input 
            id="email" 
            value={user?.email || ""} 
            disabled 
            className="bg-muted/50 cursor-not-allowed"
          />
          {user?.email_confirmed_at && (
            <Badge variant="secondary" className="absolute right-3 top-1/2 -translate-y-1/2 gap-1 bg-green-500/10 text-green-600 hover:bg-green-500/10 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Your email address cannot be changed from this page.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input 
          id="fullName" 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)} 
          placeholder="e.g. Jane Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input 
          id="username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="e.g. janedoe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea 
          id="bio" 
          value={bio} 
          onChange={(e) => setBio(e.target.value)} 
          placeholder="Tell us a little bit about yourself..."
          className="min-h-[100px] resize-y"
        />
      </div>

      <Button 
        onClick={handleSave} 
        disabled={!isDirty || isSaving}
        className="w-full sm:w-auto"
      >
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save changes
      </Button>
    </div>
  );
}
