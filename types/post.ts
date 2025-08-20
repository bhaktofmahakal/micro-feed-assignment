export type Profile = {
  id: string;
  username: string;
  created_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile; // joined when listing
  likes_count?: number;
  liked_by_me?: boolean;
};