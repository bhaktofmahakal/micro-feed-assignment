"use client";
import { useState, useTransition } from "react";
import { Post } from "@/types/post";
import { likePost, unlikePost } from "@/hooks/use-like";
import { deletePost, updatePost } from "@/hooks/use-mutate-post";

export default function PostCard({ post, currentUserId }: { post: Post; currentUserId: string | null }) {
  const [likes, setLikes] = useState(post.likes_count ?? 0);
  const [liked, setLiked] = useState(!!post.liked_by_me);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [pending, startTransition] = useTransition();

  const isOwner = currentUserId === post.author_id;

  const onToggleLike = () => {
    const prevLiked = liked;
    const prevLikes = likes;
    setLiked(!prevLiked);
    setLikes(prevLiked ? prevLikes - 1 : prevLikes + 1);
    startTransition(async () => {
      const res = prevLiked ? await unlikePost(post.id) : await likePost(post.id);
      if ((res as any)?.error) {
        // revert on error
        setLiked(prevLiked);
        setLikes(prevLikes);
      }
    });
  };

  const onSave = () => {
    const prev = post.content;
    setEditing(false);
    startTransition(async () => {
      const res = await updatePost({ id: post.id, content });
      if ((res as any)?.error) {
        setContent(prev);
      }
    });
  };

  const onDelete = () => {
    startTransition(async () => { await deletePost(post.id); });
  };

  return (
    <article style={{ border: '1px solid #e6e6e6', borderRadius: 8, padding: 12, background: 'white' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>@{post.author?.username ?? post.author_id.slice(0, 6)}</strong>
        <small>{new Date(post.created_at).toLocaleString()}</small>
      </header>

      {editing ? (
        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={280} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onSave} disabled={pending}>Save</button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{content}</p>
      )}

      <footer style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={onToggleLike} disabled={pending}>{liked ? 'Unlike' : 'Like'}</button>
        <small>{likes} {likes === 1 ? 'like' : 'likes'}</small>
        <span style={{ flex: 1 }} />
        {isOwner && (
          <>
            <button onClick={() => setEditing(true)} disabled={editing}>Edit</button>
            <button onClick={onDelete}>Delete</button>
          </>
        )}
      </footer>
    </article>
  );
}