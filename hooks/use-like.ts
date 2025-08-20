"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function likePost(postId: string) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { auth: ["Not authenticated"] } };

  // Ensure profile exists to satisfy likes.user_id -> profiles.id FK
  await supabase
    .from("profiles")
    .upsert({ id: user.id, username: user.email?.split("@")[0] ?? user.id.slice(0, 8) })
    .select();

  const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  if (error) return { error: { like: [error.message] } };
  revalidatePath("/");
  return { ok: true };
}

export async function unlikePost(postId: string) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { auth: ["Not authenticated"] } };

  const { error } = await supabase.from("likes").delete().match({ post_id: postId, user_id: user.id });
  if (error) return { error: { unlike: [error.message] } };
  revalidatePath("/");
  return { ok: true };
}