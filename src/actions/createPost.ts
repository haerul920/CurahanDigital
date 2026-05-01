"use server";

import { postSchema, PostFormValues } from "@/schemas/post";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { currentUser } from "@clerk/nextjs/server";

import { createClient } from "@supabase/supabase-js";

// Use Service Role Key to bypass RLS since we are authenticating via Clerk
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables!");
  if (!supabaseUrl) console.error("NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!serviceRoleKey) console.error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

const supabaseAdmin = createClient<Database>(supabaseUrl!, serviceRoleKey!);

export async function createPost(data: PostFormValues) {
  const result = postSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid data" };
  }

  const user = await currentUser();

  if (!user) {
    return { error: "You must be logged in to confess." };
  }

  // Use admin client to insert
  const { error } = await supabaseAdmin.from("curhatwall_posts").insert({
    user_id: user.id,
    content: result.data.content,
    is_anonymous: result.data.is_anonymous,
    category: "general", // UI no longer collects category; default satisfies NOT NULL
  });

  if (error) {
    console.error("Supabase Insert Error:", JSON.stringify(error, null, 2));
    return {
      error: `Failed to create confession: ${error.message} (${error.code})`,
    };
  }

  revalidatePath("/");
  return { success: true };
}
