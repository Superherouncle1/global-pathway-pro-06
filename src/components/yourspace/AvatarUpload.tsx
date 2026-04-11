import { useEffect, useRef, useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { User, Loader2, ImagePlus, Images, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { isNativeApp } from "@/hooks/use-native";
import { supabase } from "@/integrations/supabase/client";

const allowedAvatarTypes = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif",
];

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
}

const AvatarUpload = ({ userId, avatarUrl, onAvatarChange }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [pickerOpen]);

  const uploadFile = async (file: File) => {
    if (!allowedAvatarTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a JPEG, PNG, WebP, GIF, HEIC, or HEIF image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 5MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = (file.name.split(".").pop() || file.type.split("/").pop() || "jpg").toLowerCase();
      const normalizedExt = fileExt === "jpeg" ? "jpg" : fileExt;
      const filePath = `${userId}/avatar.${normalizedExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", userId);
      onAvatarChange(newUrl);
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast({ title: "Something went wrong", description: "Could not upload photo. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const openFilePicker = () => {
    setPickerOpen(false);
    fileInputRef.current?.click();
  };

  const openPhotoLibrary = async () => {
    if (uploading) return;

    setPickerOpen(false);

    if (!isNativeApp()) {
      fileInputRef.current?.click();
      return;
    }

    try {
      const photo = await Camera.getPhoto({
        source: CameraSource.Photos,
        resultType: CameraResultType.Uri,
        quality: 90,
        allowEditing: false,
      });

      if (!photo.webPath) {
        toast({ title: "Photo unavailable", description: "Please choose a different image.", variant: "destructive" });
        return;
      }

      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      const format = (photo.format || "jpeg").toLowerCase();
      const normalizedExt = format === "jpeg" ? "jpg" : format;
      const mimeType = blob.type || `image/${format === "jpg" ? "jpeg" : format}`;
      const file = new File([blob], `avatar.${normalizedExt}`, { type: mimeType });
      await uploadFile(file);
    } catch (err: any) {
      const message = String(err?.message || err || "").toLowerCase();
      if (message.includes("cancel")) return;
      console.error("Avatar picker error:", err);
      toast({ title: "Could not open photos", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleClick = () => {
    if (uploading) return;
    setPickerOpen((current) => !current);
  };

  return (
    <div className="flex justify-center mb-8">
      <div ref={containerRef} className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-border bg-muted flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          aria-label="Change profile photo"
          aria-expanded={pickerOpen}
          aria-haspopup="menu"
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground shadow-soft hover:shadow-hover transition-all hover:scale-110 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
        </button>
        {pickerOpen && (
          <div className="absolute right-0 top-full z-20 mt-3 w-56 rounded-2xl border border-border bg-card p-2 shadow-hover" role="menu" aria-label="Profile photo options">
            <button
              type="button"
              onClick={openPhotoLibrary}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Images className="w-4 h-4 text-muted-foreground" />
              Photo library
            </button>
            <button
              type="button"
              onClick={openFilePicker}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Upload className="w-4 h-4 text-muted-foreground" />
              Upload file
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.heic,.heif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AvatarUpload;
