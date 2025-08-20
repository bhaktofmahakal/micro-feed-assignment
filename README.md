# Micro Feed

A tiny micro feed built with Next.js App Router, TypeScript, and Supabase.

## Tech choices
- **Routing**: Route Handlers for clear REST endpoints, plus Server Actions for UI mutations where convenient. Route handlers make the API easy to test. Server actions enable simple optimistic flows.
- **Validation**: Zod on both server (route handlers & server actions) and client (composer) for consistent rules.
- **Data**: Supabase (auth + db). RLS policies protect write operations to own resources.
- **Optimistic UI**: Like/unlike and create post apply local state updates, revert on failures.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` from `.env.example` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Supabase database:
   - Run `supabase_schema.sql` in the SQL editor to create tables and RLS policies.
4. OAuth (GitHub):
   - GitHub → Developer settings → OAuth Apps
     - Authorization callback URL: `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
   - Supabase → Authentication → URL Configuration
     - Site URL: `http://localhost:3000`
     - Redirect URLs: add `http://localhost:3000`
   - Supabase → Authentication → Providers → GitHub: paste Client ID/Secret from GitHub app.
5. Start dev server:
   ```bash
   npm run dev
   ```

## Project structure
```
app/
  layout.tsx
  page.tsx
  api/
    posts/route.ts          # GET, POST
    posts/[id]/route.ts     # PATCH, DELETE
    posts/[id]/like/route.ts# POST, DELETE
components/
  post-card.tsx
  composer.tsx
  search-bar.tsx
  toolbar.tsx
hooks/
  use-posts.ts              # list/search/pagination
  use-mutate-post.ts        # create/edit/delete (server actions)
  use-like.ts               # like/unlike (server actions)
lib/
  db.ts                     # supabase client
  validators.ts             # zod schemas
types/
  post.ts
```

## Seed
- Sign in once via GitHub (creates your user).
- First write to profiles happens automatically via upsert when creating a post/like.
- Create a couple of posts via the UI to populate the feed.

## Design notes
- **Why route handlers + server actions**: Route handlers give clean REST endpoints and are easy to test; server actions keep UI mutations (create/edit/delete/like) straightforward with revalidation.
- **Security**: RLS guards ownership. UI shows Edit/Delete only for owner. OAuth redirect flows are restricted by Supabase allow-list.
- **Pagination**: keyset via created_at. `nextCursor` is the last post id; server maps to created_at for the next page.

## Tradeoffs / timeboxing
- Kept UI minimal; no advanced loading states beyond optimistic basics.
- No complex error banners; errors are inline or console-level.
- `updated_at` maintained in app code (could be a DB trigger in production).