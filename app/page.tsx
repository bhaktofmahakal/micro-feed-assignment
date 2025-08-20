import Composer from "@/components/composer";
import SearchBar from "@/components/search-bar";
import Toolbar from "@/components/toolbar";
import PostCard from "@/components/post-card";
import { getPosts } from "@/hooks/use-posts";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic"; // ensure fresh data

export default async function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const query = typeof searchParams.query === "string" ? searchParams.query : undefined;
  const mine = typeof searchParams.mine === "string" ? searchParams.mine : undefined;
  const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : undefined;

  const { items, nextCursor } = await getPosts({ query, mine, cursor });

  // Get current user id to control owner-only UI (edit/delete)
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  const nextHref = (() => {
    if (!nextCursor) return null;
    const s = new URLSearchParams();
    if (query) s.set("query", query);
    if (mine) s.set("mine", mine);
    s.set("cursor", nextCursor);
    return `/?${s.toString()}`;
  })();

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Composer />
      <Toolbar />
      <SearchBar />
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((p) => (
          <PostCard key={p.id} post={p} currentUserId={currentUserId} />
        ))}
      </div>
      {nextHref && (
        <div style={{ textAlign: 'center', padding: 8 }}>
          <Link href={nextHref}>Load more</Link>
        </div>
      )}
    </div>
  );
}