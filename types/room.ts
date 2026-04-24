import { Message } from "./message";

export interface ChatRoom {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;

  participants: {
    user: {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  }[];

  last_message?: Message | null;
}