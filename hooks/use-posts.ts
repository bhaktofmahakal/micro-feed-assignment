"use server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { PostsQuerySchema } from "@/lib/validators";
import { Post } from "@/types/post";

// Server function usable as a "server action" for listing posts
export async function getPosts(params: { query?: string; cursor?: string; mine?: string }) {
  const input = PostsQuerySchema.parse(params);
  const supabase = createSupabaseServer();

  // Get current user (for mine filter and liked_by_me marking)
  const { data: { user } } = await supabase.auth.getUser();

  let q = supabase
    .from("posts")
    .select(
      `id, author_id, content, created_at, updated_at,
       author:profiles!posts_author_id_fkey(id, username, created_at),
       likes:likes(count)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (input.query) {
    q = q.ilike("content", `%${input.query}%`);
  }

  if (input.mine === "true" && user) {
    q = q.eq("author_id", user.id);
  }

  if (input.cursor) {
    // naive cursor: fetch posts created before cursor id's timestamp
    const { data: cursorPost } = await supabase
      .from("posts")
      .select("created_at")
      .eq("id", input.cursor)
      .single();
    if (cursorPost?.created_at) {
      q = q.lt("created_at", cursorPost.created_at);
    }
  }

  const { data, error } = await q;
  if (error) throw error;

  // Base mapping with likes count
  let items: Post[] = (data ?? []).map((row: any) => ({
    id: row.id,
    author_id: row.author_id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: row.author,
    likes_count: Array.isArray(row.likes) && row.likes.length > 0 ? row.likes[0].count : 0,
    liked_by_me: false,
  }));

  // Mark liked_by_me via a separate query for the current page
  if (user && items.length > 0) {
    const ids = items.map((p) => p.id);
    const { data: likedRows } = await supabase
      .from("likes")
      .select("post_id")
      .in("post_id", ids)
      .eq("user_id", user.id);
    const likedSet = new Set((likedRows ?? []).map((r: any) => r.post_id));
    items = items.map((p) => ({ ...p, liked_by_me: likedSet.has(p.id) }));
  }

  const nextCursor = items.length ? items[items.length - 1].id : undefined;

  return { items, nextCursor };
}