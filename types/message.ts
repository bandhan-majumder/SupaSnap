export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  type: string | null;
  content: string;
  media_type?: "video" | "image" | null;
  seen_at: string | null;
  expires_at: string | null;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}