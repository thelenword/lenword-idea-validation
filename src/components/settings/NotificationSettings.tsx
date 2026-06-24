import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NotificationSettings() {
  const { profile, updateProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const notifications = (profile?.preferences as any)?.notifications || {
    email: true,
    security: true,
    product: false,
    marketing: false,
  };

  const handleToggle = async (key: string, checked: boolean) => {
    setIsUpdating(true);
    try {
      const preferences = (profile?.preferences as any) || {};
      const updatedNotifications = {
        ...notifications,
        [key]: checked,
      };
      await updateProfile({
        preferences: {
          ...preferences,
          notifications: updatedNotifications,
        },
      });
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm border-white/20 dark:border-white/5 shadow-sm">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose what you want to be notified about.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
            <span>Email Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">Receive emails about your account activity.</span>
          </Label>
          <Switch
            id="email-notifications"
            checked={notifications.email}
            onCheckedChange={(c) => handleToggle("email", c)}
            disabled={isUpdating}
          />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="security-alerts" className="flex flex-col space-y-1">
            <span>Security Alerts</span>
            <span className="font-normal text-sm text-muted-foreground">Get notified when a login is detected from a new device.</span>
          </Label>
          <Switch
            id="security-alerts"
            checked={notifications.security}
            onCheckedChange={(c) => handleToggle("security", c)}
            disabled={isUpdating}
          />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="product-updates" className="flex flex-col space-y-1">
            <span>Product Updates</span>
            <span className="font-normal text-sm text-muted-foreground">Receive emails about new features and improvements.</span>
          </Label>
          <Switch
            id="product-updates"
            checked={notifications.product}
            onCheckedChange={(c) => handleToggle("product", c)}
            disabled={isUpdating}
          />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="marketing" className="flex flex-col space-y-1">
            <span>Marketing</span>
            <span className="font-normal text-sm text-muted-foreground">Receive promotional emails and offers.</span>
          </Label>
          <Switch
            id="marketing"
            checked={notifications.marketing}
            onCheckedChange={(c) => handleToggle("marketing", c)}
            disabled={isUpdating}
          />
        </div>
      </CardContent>
    </Card>
  );
}
