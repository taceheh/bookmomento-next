export type CommentItemType = {
  id: string;
  parent_id: string | null;
  body: string;
  user_id: string | null;
  created_at: string;
  deleted_at: string | null;
};
