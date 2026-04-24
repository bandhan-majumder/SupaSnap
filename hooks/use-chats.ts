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
  fetchMessageById,
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

export function useMessages(roomId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

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

    const channel = supabase
      .channel(`messages:${roomId}:${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = await fetchMessageById(payload.new.id);
          if (!newMsg) return;

          setMessages((prev) => {
            const withoutOptimistic = prev.filter(
              (m) =>
                !m.id.startsWith("optimistic-") ||
                m.content !== newMsg.content,
            );
            if (withoutOptimistic.some((m) => m.id === newMsg.id))
              return withoutOptimistic;
            return [...withoutOptimistic, newMsg];
          });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomId]);

  const sendMessage = useCallback(
    async (
      content: string,
      type: "text" | "media" = "text",
      mediaType?: "video" | "image",
    ): Promise<boolean> => {
      if (!roomId || !content.trim() || !user) return false;

      const optimisticMsg: Message = {
        id: `optimistic-${Date.now()}`,
        room_id: roomId,
        sender_id: user.id,
        type,
        media_type: mediaType,
        content: content.trim(),
        seen_at: null,
        expires_at: null,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        await insertMessage({
          room_id: roomId,
          sender_id: user.id,
          type,
          content: content.trim(),
          media_type: mediaType,
        });
        await touchRoom(roomId);
        return true;
      } catch (e) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
        setError(e as Error);
        return false;
      }
    },
    [roomId, user],
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: loadMessages,
  };
}