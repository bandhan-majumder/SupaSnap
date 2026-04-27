import { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";
import { ChatRoom } from "@/types/room";
import { Profile } from "@/types/profile";
import { Message } from "@/types/message";
import {
  addParticipants,
  createRoom,
  fetchAllProfiles,
  fetchLastMessageForRoom,
  fetchMessages,
  fetchProfileByUsername,
  fetchRoomsForUser,
  findSharedRoom,
  insertMessage,
  touchRoom,
} from "@/services/chat.service";
import { supabase } from "@/lib/supabase";

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rooms = await fetchRoomsForUser(user.id);

      const roomsWithLastMessage: ChatRoom[] = await Promise.all(
        rooms.map(async (room) => ({
          ...room,
          last_message: await fetchLastMessageForRoom(room.id),
        })),
      );

      setConversations(
        roomsWithLastMessage.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        ),
      );
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createConversation = async (
    participantId: string,
  ): Promise<string | null> => {
    if (!user) return null;
    try {
      const room = await createRoom();
      await addParticipants(room.id, [user.id, participantId]);
      await fetchConversations();
      return room.id;
    } catch (e) {
      setError(e as Error);
      return null;
    }
  };

  const startConversation = async (
    otherUserId: string,
  ): Promise<string | null> => {
    try {
      const existing = await findSharedRoom(user!.id, otherUserId);
      if (existing) return existing;
      return createConversation(otherUserId);
    } catch (e) {
      console.error("startConversation error:", e);
      return null;
    }
  };

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    createConversation,
    startConversation,
  };
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      setProfiles(await fetchAllProfiles());
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profiles,
    allProfiles: profiles,
    loading,
    error,
    refetch: loadProfiles,
    searchByUsername: fetchProfileByUsername,
  };
}

export function useMessages(roomId: string | null, userId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [allConnectedUsers, setAllConnectedUsers] = useState<number>(1); // user itself is always connected. So if the total number is 2, that means the other person is also online

  if(!userId) throw new Error("User Id is required");

  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      setMessages(await fetchMessages(roomId));
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;
    const channelName = `room:${roomId}:messages`;

    const setup = async () => {

      if (cancelled) return;

      // await supabase.realtime.setAuth();

      const newChannel = supabase.channel(channelName, {
        config: {
          private: false, // FIXME: should be private
          presence: {
            key: userId,
          },
          broadcast: {
            ack: false,
            self: false,
          },
        },
      });

      newChannel
        .on("presence", { event: "sync" }, () => {
          setAllConnectedUsers(Object.keys(newChannel.presenceState()).length);
        })
        .on("broadcast", { event: "new_message" }, (payload) => {
          const record = payload.payload;
          setMessages((prev) => [
            ...prev,
            {
              id: record.id,
              content: record.content,
              created_at: record.created_at,
              deleted_at: record.deleted_at,
              expires_at: record.expires_at,
              room_id: record.room_id,
              seen_at: record.seen_at,
              sender_id: record.sender_id,
              type: record.type,
              updated_at: record.updated_at,
              media_type: record.media_type,
            },
          ]);
        })
        .subscribe((status, err) => {
          if (status !== "SUBSCRIBED") return;
          newChannel.track({ userId: userId });
        });

      channelRef.current = newChannel;
    };

    setup();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        channelRef.current.untrack();
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [roomId, userId]);

  const sendMessage = useCallback(
    async (
      content: string,
      type: "text" | "media" = "text",
      mediaType?: "video" | "image",
    ): Promise<boolean> => {
      if (!roomId || !content.trim() || !userId) return false;
      try {
        await insertMessage({
          room_id: roomId,
          sender_id: userId,
          type,
          content: content.trim(),
          media_type: mediaType,
        });
        await touchRoom(roomId);
        return true;
      } catch (e) {
        setError(e as Error);
        return false;
      }
    },
    [roomId, userId],
  );

  return {
    isOtherUserOnline: allConnectedUsers > 1,
    messages,
    loading,
    error,
    sendMessage,
    refetch: loadMessages,
  };
}