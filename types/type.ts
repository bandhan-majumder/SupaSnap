import { ChatRoom } from "./room";

export type ParticipantRow = {
  user: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type RoomRow = Omit<ChatRoom, "last_message"> & {
  participants: ParticipantRow[];
};

export type RoomParticipantJoin = {
  room: RoomRow | null;
};