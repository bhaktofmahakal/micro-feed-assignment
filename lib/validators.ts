import { z } from "zod";

export const PostCreateSchema = z.object({
  content: z.string().trim().min(1, "Required").max(280, "Max length is 280"),
});
export type PostCreateInput = z.infer<typeof PostCreateSchema>;

export const PostUpdateSchema = z.object({
  id: z.string().uuid(),
  content: z.string().trim().min(1).max(280),
});
export type PostUpdateInput = z.infer<typeof PostUpdateSchema>;

export const PostsQuerySchema = z.object({
  query: z.string().optional(),
  cursor: z.string().uuid().optional(),
  mine: z
    .enum(["true", "false"]) // query params are strings
    .optional(),
});
export type PostsQueryInput = z.infer<typeof PostsQuerySchema>;