"use server";

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
    },
  }
);

export async function syncUserProfile() {
  const user = await currentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    // Check if profile exists
    const { data: existing } = await supabaseAdmin
      .from("curhatwall_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existing) {
      const baseName =
        user.username || user.firstName || `User ${user.id.slice(0, 6)}`;
      const fullName = user.fullName || baseName;

      const { error } = await supabaseAdmin.from("curhatwall_profiles").insert({
        id: user.id,
        username: baseName,
        avatar_seed: `seed-${user.id}`,
        full_name: fullName,
        hide_email: false,
      });

      if (error) {
        console.error("Sync profile error:", error);
        return { error: "Failed to create profile", details: error };
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Sync error:", error);
    return { error: "Internal sync error", details: error };
  }
}

export async function updateUserProfile(
  username: string,
  avatarSeed: string,
  fullName: string,
  hideEmail: boolean
) {
  const user = await currentUser();
  if (!user) return { error: "Not authenticated" };

  // Validate inputs
  if (!username || username.trim().length < 3) {
    return { error: "Username must be at least 3 characters" };
  }

  const { error } = await supabaseAdmin
    .from("curhatwall_profiles")
    .update({
      username,
      avatar_seed: avatarSeed,
      full_name: fullName,
      hide_email: hideEmail,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Update profile error:", error);
    return { error: "Failed to update profile" };
  }

  revalidatePath("/profile");
  return { success: true };
}
