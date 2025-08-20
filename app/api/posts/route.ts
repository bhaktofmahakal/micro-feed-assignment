import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { PostCreateSchema, PostsQuerySchema } from "@/lib/validators";

// GET /api/posts?query=&cursor=&mine=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const input = PostsQuerySchema.parse({
    query: searchParams.get("query") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    mine: searchParams.get("mine") ?? undefined,
  });

  const supabase = createSupabaseServer();

  let q = supabase
    .from("posts")
    .select(
      `id, author_id, content, created_at, updated_at,
       author:profiles!posts_author_id_fkey(id, username, created_at),
       likes:likes(count)`
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (input.query) q = q.ilike("content", `%${input.query}%`);

  if (input.mine === "true") {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) q = q.eq("author_id", user.id);
  }

  if (input.cursor) {
    const { data: cursorPost } = await supabase
      .from("posts")
      .select("created_at")
      .eq("id", input.cursor)
      .single();
    if (cursorPost?.created_at) q = q.lt("created_at", cursorPost.created_at);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const items = (data ?? []).map((row: any) => ({
    id: row.id,
    author_id: row.author_id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: row.author,
    likes_count: Array.isArray(row.likes) && row.likes.length > 0 ? row.likes[0].count : 0,
  }));
  const nextCursor = items.length ? items[items.length - 1].id : undefined;
  return NextResponse.json({ items, nextCursor });
}

// POST /api/posts
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = PostCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { error } = await supabase
    .from("posts")
    .insert({ content: parsed.data.content, author_id: user.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}