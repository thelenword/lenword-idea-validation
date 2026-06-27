import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AvatarUploader } from "@/components/settings/AvatarUploader";
import { ProfileForm } from "@/components/settings/ProfileForm";

export const Route = createFileRoute("/app/settings/account")({
  component: AccountSettingsPage,
});

function AccountSettingsPage() {
  return (
    <div className="w-full max-w-5xl pb-2 space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-muted-foreground text-sm">
          Update your personal details and public profile photo.
        </p>
      </div>
      <div className="space-y-4">
        <AvatarUploader />
        <Separator className="bg-border/50" />
        <ProfileForm />
      </div>
    </div>
  );
}
