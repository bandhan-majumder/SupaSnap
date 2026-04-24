import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { useEffect, useState, useCallback, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  type: string;
  content: string;
  media_type?: "video" | "image";
  seen_at: string | null;
  expires_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

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

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string;
}

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
        .eq("profile_id", user.id);

      if (error) throw error;

      const rooms = data?.map((d: any) => d.room).filter(Boolean) || [];

      await Promise.all(
        rooms.map(async (room) => {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("*, sender:profiles(id, username, full_name, avatar_url)")
            .eq("room_id", room.id)
            .is("deleted_at", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          room.last_message = lastMsg;
        }),
      );

      setConversations(
        rooms.sort(
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
      const { data: room, error: roomError } = await supabase
        .from("chat_rooms")
        .insert({ status: "active" })
        .select()
        .single();

      if (roomError || !room) throw roomError;

      const participants = [
        { room_id: room.id, profile_id: user.id },
        { room_id: room.id, profile_id: participantId },
      ];

      const { data: chatRoomData, error: partError } = await supabase
        .from("chat_room_participants")
        .insert(participants);

      if (partError) throw partError;

      await fetchConversations();
      return room.id;
    } catch (e) {
      setError(e as Error);
      return null;
    }
  };

  const findExistingConversation = async (
    otherUserId: string,
  ): Promise<string | null> => {
    if (!user) return null;

    const { data: myRooms } = await supabase
      .from("chat_room_participants")
      .select("room_id")
      .eq("profile_id", user.id);

    if (!myRooms?.length) return null;

    const { data } = await supabase
      .from("chat_room_participants")
      .select("room_id")
      .eq("profile_id", otherUserId)
      .in(
        "room_id",
        myRooms.map((r) => r.room_id),
      )
      .limit(1)
      .maybeSingle();

    return data?.room_id ?? null;
  };

  const startConversation = async (
    otherUserId: string,
  ): Promise<string | null> => {
    try {
      const existing = await findExistingConversation(otherUserId);
      if (existing) return existing;
      return createConversation(otherUserId);
    } catch (error) {
      console.log("Error is: ", error);
      return "";
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
    fetchProfiles();
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, updated_at")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByUsername = async (
    username: string,
  ): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, updated_at")
      .eq("username", username.toLowerCase())
      .single();

    if (error || !data) return null;
    return data;
  };

  return {
    profiles,
    allProfiles: profiles,
    loading,
    error,
    refetch: fetchProfiles,
    searchByUsername,
  };
}

export function useMessages(roomId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles(id, username, full_name, avatar_url)")
        .eq("room_id", roomId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!roomId) return;

    // Using a unique channel name to avoid reusing a live channel
    const channelName = `messages:${roomId}:${Date.now()}`;

    const channel = supabase.channel(channelName);

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `room_id=eq.${roomId}`,
      },
      async (payload) => {
        const { data: newMsg } = await supabase
          .from("messages")
          .select("*, sender:profiles(id, username, full_name, avatar_url)")
          .eq("id", payload.new.id)
          .single();

        if (newMsg) {
          setMessages((prev) => {
            // Remove optimistic version if it exists, then add real one
            const withoutOptimistic = prev.filter(
              (m) =>
                !m.id.startsWith("optimistic-") || m.content !== newMsg.content,
            );
            if (withoutOptimistic.some((m) => m.id === newMsg.id))
              return withoutOptimistic;
            return [...withoutOptimistic, newMsg];
          });
        }
      },
    );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      const ch = channelRef.current;
      if (ch) {
        supabase.removeChannel(ch);
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
        sender: {
          id: user.id,
          username: user.user_metadata?.username ?? "",
          full_name: user.user_metadata?.full_name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
        },
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const { error } = await supabase.from("messages").insert({
          room_id: roomId,
          sender_id: user.id,
          type,
          media_type: mediaType,
          content: content.trim(),
        });

        if (error) {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
          throw error;
        }

        await supabase
          .from("chat_rooms")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", roomId);

        return true;
      } catch (e) {
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
    refetch: fetchMessages,
  };
}
