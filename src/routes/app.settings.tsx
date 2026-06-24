import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AvatarUploader } from "@/components/settings/AvatarUploader";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { User, Palette, Bell, Shield, Lock } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="account" className="flex flex-col md:flex-row gap-8">
        <TabsList className="flex flex-row md:flex-col justify-start h-auto bg-transparent gap-2 p-0 w-full md:w-64 overflow-x-auto md:overflow-visible no-scrollbar">
          <TabsTrigger
            value="account"
            className="flex justify-start gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white/80 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-white text-muted-foreground data-[state=active]:text-foreground transition-all hover:bg-white/40 dark:hover:bg-white/5"
          >
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="flex justify-start gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white/80 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-white text-muted-foreground data-[state=active]:text-foreground transition-all hover:bg-white/40 dark:hover:bg-white/5"
          >
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex justify-start gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white/80 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-white text-muted-foreground data-[state=active]:text-foreground transition-all hover:bg-white/40 dark:hover:bg-white/5"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="flex justify-start gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white/80 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-white text-muted-foreground data-[state=active]:text-foreground transition-all hover:bg-white/40 dark:hover:bg-white/5"
          >
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex justify-start gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white/80 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-white text-muted-foreground data-[state=active]:text-foreground transition-all hover:bg-white/40 dark:hover:bg-white/5"
          >
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full max-w-3xl">
          <TabsContent value="account" className="mt-0">
            <Card className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm border-white/20 dark:border-white/5 shadow-sm">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your personal details and public profile photo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AvatarUploader />
                <Separator className="bg-border/50" />
                <ProfileForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <AppearanceSettings />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="privacy" className="mt-0">
            <PrivacySettings />
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <SecuritySettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
