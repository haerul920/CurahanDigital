"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { syncUserProfile } from "@/actions/profile";

export function AuthSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      syncUserProfile().catch((err) =>
        console.error("Failed to sync profile:", err)
      );
    }
  }, [isLoaded, user]);

  return null;
}
