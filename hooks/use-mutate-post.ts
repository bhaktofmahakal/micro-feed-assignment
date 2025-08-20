"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase-server";
import { PostCreateSchema, PostUpdateSchema } from "@/lib/validators";

export async function createPost(formData: FormData) {
  const parsed = PostCreateSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = createSupabaseServer();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return { error: { auth: ["Not authenticated"] } };

  // Ensure a profile row exists for FK integrity and username displays
  await supabase.from("profiles").upsert({ id: user.id, username: user.email?.split("@")[0] ?? user.id.slice(0, 8) }).select();

  const { error } = await supabase.from("posts").insert({ content: parsed.data.content, author_id: user.id });
  if (error) return { error: { content: [error.message] } };

  revalidatePath("/");
  return { ok: true };
}

export async function updatePost(input: { id: string; content: string }) {
  const parsed = PostUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = createSupabaseServer();
  const { error } = await supabase
    .from("posts")
    .update({ content: parsed.data.content, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.id);

  if (error) return { error: { content: [error.message] } };
  revalidatePath("/");
  return { ok: true };
}

export async function deletePost(id: string) {
  const supabase = createSupabaseServer();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { error: { id: [error.message] } };
  revalidatePath("/");
  return { ok: true };
}