import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PrivacySettings() {
  const { profile, updateProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const privacy = (profile?.preferences as any)?.privacy || {
    visibility: "public",
    dataSharing: "essential",
  };

  const handleSelect = async (key: string, value: string) => {
    setIsUpdating(true);
    try {
      const preferences = (profile?.preferences as any) || {};
      const updatedPrivacy = {
        ...privacy,
        [key]: value,
      };
      await updateProfile({
        preferences: {
          ...preferences,
          privacy: updatedPrivacy,
        },
      });
      toast.success("Privacy preferences updated");
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownload = () => {
    toast.info("Preparing your data for download...");
    setTimeout(() => toast.success("Data downloaded successfully"), 1500);
  };

  return (
    <Card className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm border-white/20 dark:border-white/5 shadow-sm">
      <CardHeader>
        <CardTitle>Privacy</CardTitle>
        <CardDescription>
          Manage your privacy settings and data sharing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select
              disabled={isUpdating}
              value={privacy.visibility}
              onValueChange={(v) => handleSelect("visibility", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="connections">Connections Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data Sharing</Label>
            <Select
              disabled={isUpdating}
              value={privacy.dataSharing}
              onValueChange={(v) => handleSelect("dataSharing", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select data sharing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="essential">Essential Only</SelectItem>
                <SelectItem value="analytics">Analytics & Performance</SelectItem>
                <SelectItem value="all">All Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Personal Data</h4>
          <p className="text-sm text-muted-foreground mb-4">
            You can request a copy of your personal data at any time.
          </p>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Personal Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
