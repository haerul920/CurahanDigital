"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabaseClient";
import { User as UserIcon, Shield, ShieldOff, Loader2, Upload } from "lucide-react";
import { updateUserProfile } from "@/actions/profile";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

const AVATAR_OPTIONS = [
  "seed-1", "seed-2", "seed-3", "seed-4", "seed-5", 
  "seed-6", "seed-7", "seed-8", "seed-9", "seed-10"
];

export function DashboardSettings() {
  const { user: clerkUser, isLoaded } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("seed-1");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customPreview, setCustomPreview] = useState<string | null>(null);
  const [hideEmail, setHideEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      if (!clerkUser) return;
      try {
        const { data: profileData } = await supabase
          .from("curhatwall_profiles")
          .select("*")
          .eq("id", clerkUser.id)
          .single();
          
        if (profileData) {
          setProfile(profileData);
          setUsername(profileData.username || "");
          setFullName(profileData.full_name || "");
          setAvatarSeed(profileData.avatar_seed || "seed-1");
          setHideEmail(profileData.hide_email || false);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      loadProfile();
    }
  }, [isLoaded, clerkUser, supabase]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
        <p>Profile not found or could not be created. Please refresh the page.</p>
      </div>
    );
  }

  const hasChanges = 
    username !== profile.username ||
    fullName !== (profile.full_name || "") ||
    avatarSeed !== (profile.avatar_seed || "seed-1") ||
    hideEmail !== (profile.hide_email || false) ||
    customFile !== null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCustomFile(file);
      setCustomPreview(URL.createObjectURL(file));
      setAvatarSeed(""); // clear seed when using custom image
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsSubmitting(true);
    
    // Upload to clerk if there's a custom file
    if (customFile) {
      try {
        await clerkUser.setProfileImage({ file: customFile });
      } catch (err) {
        console.error("Error uploading image to clerk:", err);
      }
    } else if (avatarSeed && !profile.avatar_seed) {
      // If they switched from custom image back to seed, we could remove clerk image
      // but clerk doesn't have a simple "removeProfileImage" without API.
      // So we just rely on avatarSeed precedence in ProfileDropdown.
    }

    const result = await updateUserProfile(username, avatarSeed, fullName, hideEmail);

    if (result.error) {
      alert(result.error);
    } else {
      // Update local baseline to reset hasChanges
      setProfile((prev: any) => ({
        ...prev,
        username,
        full_name: fullName,
        avatar_seed: avatarSeed,
        hide_email: hideEmail
      }));
      setCustomFile(null);
      setCustomPreview(null);
      window.dispatchEvent(new Event("profileUpdated"));
      router.refresh();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900">Profile Settings</h2>
          <p className="text-zinc-500">Manage your public profile and avatar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Avatar Selection */}
          <div className="space-y-4">
            <Label className="text-zinc-700 font-semibold text-base flex justify-between items-center">
              Choose Avatar
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-sm rounded-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Upload Image
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageSelect} 
              />
            </Label>
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm shrink-0 relative group">
                {customPreview ? (
                  <img
                    src={customPreview}
                    alt="Custom Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : avatarSeed ? (
                  <img
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${avatarSeed}`}
                    alt="Selected Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : clerkUser?.imageUrl ? (
                  <img
                    src={clerkUser.imageUrl}
                    alt="Clerk Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-zinc-400 m-6" />
                )}
              </div>
              <div className="flex-1 grid grid-cols-5 sm:grid-cols-10 gap-2">
                {AVATAR_OPTIONS.map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => {
                      setAvatarSeed(seed);
                      setCustomFile(null);
                      setCustomPreview(null);
                    }}
                    className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      avatarSeed === seed && !customFile
                        ? "border-zinc-900 shadow-md scale-110 relative z-10"
                        : "border-transparent hover:border-zinc-300 bg-zinc-50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={`https://api.dicebear.com/9.x/notionists/svg?seed=${seed}`}
                      alt={`Avatar ${seed}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-700 font-semibold">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-white border-zinc-200 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400 rounded-lg h-11"
                placeholder="Your full name"
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-700 font-semibold">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white border-zinc-200 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400 rounded-lg h-11"
                placeholder="Your username"
                required
                minLength={3}
                maxLength={20}
              />
            </div>
          </div>
          
          <div className="flex flex-row items-center justify-between rounded-xl border border-zinc-200 p-5 bg-zinc-50 shadow-sm">
            <div className="space-y-1">
              <Label htmlFor="hideEmail" className="text-base font-semibold text-zinc-900 flex items-center gap-2 cursor-pointer">
                {hideEmail ? <Shield className="w-4 h-4 text-amber-600" /> : <ShieldOff className="w-4 h-4 text-emerald-600" />}
                Anonymous Mode
              </Label>
              <p className="text-sm text-zinc-500">
                Hide your email address from public view on the platform.
              </p>
            </div>
            <Switch
              id="hideEmail"
              checked={hideEmail}
              onCheckedChange={setHideEmail}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className={`px-8 h-11 rounded-xl font-semibold transition-all ${
                hasChanges
                  ? "bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
                  : "bg-zinc-200 text-zinc-400 shadow-none"
              }`}
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
