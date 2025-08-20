"use client";
import { useState, useTransition } from "react";
import { createPost } from "@/hooks/use-mutate-post";
import { PostCreateSchema } from "@/lib/validators";

export default function Composer() {
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side Zod validation to meet assignment requirement
    const parsed = PostCreateSchema.safeParse({ content });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Invalid content";
      setError(msg);
      return;
    }

    const fd = new FormData();
    fd.set("content", parsed.data.content);
    // optimistic: clear input immediately
    const prev = content;
    setContent("");
    startTransition(async () => {
      const res = await createPost(fd);
      if ((res as any)?.error) {
        const err = (res as any).error as Record<string, string[]>;
        const firstKey = Object.keys(err)[0];
        const serverMsg = firstKey === "auth" ? "Please sign in to post." : err[firstKey]?.[0];
        setError(serverMsg || "Something went wrong. Please try again.");
        setContent(prev);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
      <textarea
        value={content}
        maxLength={280}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        style={{ padding: 8, resize: 'vertical', minHeight: 60 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <small>{content.length}/280</small>
        <button disabled={pending || content.trim().length === 0} type="submit">Post</button>
      </div>
      {error && <small style={{ color: 'crimson' }}>{error}</small>}
    </form>
  );
}