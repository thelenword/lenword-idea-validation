import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function AvatarUploader() {
  const { profile, uploadAvatar } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Create local preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload via hook
      await uploadAvatar(file);
      toast.success("Profile photo updated successfully");
      
      // Cleanup object URL
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const displayUrl = previewUrl || profile?.avatar_url;

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-24 w-24">
        <Avatar className="h-24 w-24 border-2 border-border/50">
          <AvatarImage src={displayUrl || undefined} alt={profile?.full_name || "Avatar"} className="object-cover" />
          <AvatarFallback className="text-2xl font-medium bg-primary/5 text-primary">
            {getInitials(profile?.full_name)}
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-fit"
        >
          <Upload className="h-4 w-4 mr-2" />
          Change photo
        </Button>
        <p className="text-xs text-muted-foreground">
          Recommended: Square image, at least 400x400px. Max 5MB (JPG, PNG, WebP).
        </p>
      </div>
    </div>
  );
}
