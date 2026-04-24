import { supabase } from "@/lib/supabase";
import { Message } from "@/types/message";
import { RoomParticipantJoin, RoomRow } from "@/types/type";
export { fetchAllProfiles, fetchProfileByUsername } from "./profile.service"; 

export const fetchRoomsForUser = async (userId: string): Promise<RoomRow[]> => {
  const { data, error } = await supabase
    .from("chat_room_participants")
    .select(
      `
      room:chat_rooms(
        id,
        status,
        created_at,
        updated_at,
        participants:chat_room_participants(
          user:profiles(id, username, full_name, avatar_url)
        )
      )
    `,
    )
    .eq("profile_id", userId)
    .returns<RoomParticipantJoin[]>();

  if (error) throw error;

  return (data ?? [])
    .map((d) => d.room)
    .filter((room): room is RoomRow => room !== null);
};

export const fetchLastMessageForRoom = async (
  roomId: string,
): Promise<Message | null> => {
  const { data } = await supabase
    .from("messages")
    .select("*, sender:profiles(id, username, full_name, avatar_url)")
    .eq("room_id", roomId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as Message | null) ?? null;
};

export const createRoom = async () => {
  const { data, error } = await supabase
    .from("chat_rooms")
    .insert({ status: "active" })
    .select()
    .single();

  if (error || !data) throw error;
  return data;
};

export const touchRoom = async (roomId: string): Promise<void> => {
  const { error } = await supabase
    .from("chat_rooms")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", roomId);

  if (error) throw error;
};

export const addParticipants = async (
  roomId: string,
  userIds: string[],
): Promise<void> => {
  const rows = userIds.map((id) => ({ room_id: roomId, profile_id: id }));
  const { error } = await supabase.from("chat_room_participants").insert(rows);
  if (error) throw error;
};

export const fetchRoomIdsForUser = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("chat_room_participants")
    .select("room_id")
    .eq("profile_id", userId);

  if (error) throw error;
  return (data ?? []).map((r) => r.room_id);
};

export const findSharedRoom = async (
  userAId: string,
  userBId: string,
): Promise<string | null> => {
  const roomIds = await fetchRoomIdsForUser(userAId);
  if (!roomIds.length) return null;

  const { data, error } = await supabase
    .from("chat_room_participants")
    .select("room_id")
    .eq("profile_id", userBId)
    .in("room_id", roomIds)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.room_id ?? null;
};

export const fetchMessages = async (roomId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles(id, username, full_name, avatar_url)")
    .eq("room_id", roomId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .returns<Message[]>();

  if (error) throw error;
  return data ?? [];
};

export const fetchMessageById = async (id: string): Promise<Message | null> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles(id, username, full_name, avatar_url)")
    .eq("id", id)
    .returns<Message[]>()
    .single();

  if (error) return null;
  return data ?? null;
};

export const insertMessage = async (payload: {
  room_id: string;
  sender_id: string;
  type: 'text' | 'media' | null;
  content: string;
  media_type?: "video" | "image";
}): Promise<void> => {
  const { error } = await supabase.from("messages").insert(payload);
  if (error) throw error;
};