import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { useEffect, useState, useCallback } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants?: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
  }[];
  last_message?: Message;
}

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

const DEMO_MESSAGES: Record<string, Message[]> = {
  "conv1": [
    { id: "m1", conversation_id: "conv1", sender_id: "user2", content: "Hey! Did you see the new snap?", created_at: new Date(Date.now() - 3600000).toISOString(), sender: { id: "user2", email: "alice@demo.com", display_name: "Alice", avatar_url: null } },
    { id: "m2", conversation_id: "conv1", sender_id: "user1", content: "Yeah it was amazing! 🔥", created_at: new Date(Date.now() - 3000000).toISOString(), sender: { id: "user1", email: "me@demo.com", display_name: "Me", avatar_url: null } },
    { id: "m3", conversation_id: "conv1", sender_id: "user2", content: "Let's go take some more pics tomorrow", created_at: new Date(Date.now() - 1800000).toISOString(), sender: { id: "user2", email: "alice@demo.com", display_name: "Alice", avatar_url: null } },
  ],
  "conv2": [
    { id: "m4", conversation_id: "conv2", sender_id: "user3", content: "Check out this video I just recorded!", created_at: new Date(Date.now() - 86400000).toISOString(), sender: { id: "user3", email: "bob@demo.com", display_name: "Bob", avatar_url: null } },
    { id: "m5", conversation_id: "conv2", sender_id: "user1", content: "Wow that's crazy! 😂", created_at: new Date(Date.now() - 82800000).toISOString(), sender: { id: "user1", email: "me@demo.com", display_name: "Me", avatar_url: null } },
  ],
  "conv3": [
    { id: "m6", conversation_id: "conv3", sender_id: "user4", content: "Hey are you free this weekend?", created_at: new Date(Date.now() - 172800000).toISOString(), sender: { id: "user4", email: "carol@demo.com", display_name: "Carol", avatar_url: null } },
  ],
};

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
    participants: [
      { id: "user1", email: "me@demo.com", display_name: "Me", avatar_url: null },
      { id: "user2", email: "alice@demo.com", display_name: "Alice", avatar_url: null },
    ],
    last_message: DEMO_MESSAGES["conv1"][DEMO_MESSAGES["conv1"].length - 1],
  },
  {
    id: "conv2",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 82800000).toISOString(),
    participants: [
      { id: "user1", email: "me@demo.com", display_name: "Me", avatar_url: null },
      { id: "user3", email: "bob@demo.com", display_name: "Bob", avatar_url: null },
    ],
    last_message: DEMO_MESSAGES["conv2"][DEMO_MESSAGES["conv2"].length - 1],
  },
  {
    id: "conv3",
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    participants: [
      { id: "user1", email: "me@demo.com", display_name: "Me", avatar_url: null },
      { id: "user4", email: "carol@demo.com", display_name: "Carol", avatar_url: null },
    ],
    last_message: DEMO_MESSAGES["conv3"][DEMO_MESSAGES["conv3"].length - 1],
  },
];

const DEMO_PROFILES = [
  { id: "user1", email: "me@demo.com", display_name: "Me", avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "user2", email: "alice@demo.com", display_name: "Alice", avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "user3", email: "bob@demo.com", display_name: "Bob", avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "user4", email: "carol@demo.com", display_name: "Carol", avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "user5", email: "david@demo.com", display_name: "David", avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const USE_DEMO = true;
const DEMO_USER_ID = "user1";

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(USE_DEMO ? DEMO_CONVERSATIONS : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (USE_DEMO) {
      setConversations(DEMO_CONVERSATIONS);
      return;
    }
    
    if (!user) return;
    fetchConversations();
  }, [user]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("conversation_participants")
        .select(`
          conversation:conversations(
            id,
            created_at,
            updated_at,
            participants:conversation_participants(
              user:profiles(id, email, display_name, avatar_url)
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      const convs = data?.map((d: any) => d.conversation).filter(Boolean) || [];
      
      for (const conv of convs) {
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("*, sender:profiles(id, email, display_name, avatar_url)")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        conv.last_message = lastMsg;
      }

      setConversations(convs.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ));
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createConversation = async (participantIds: string[]): Promise<string | null> => {
    if (USE_DEMO) {
      const newId = `conv${Date.now()}`;
      const newConv: Conversation = {
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participants: [
          { id: DEMO_USER_ID, email: "me@demo.com", display_name: "Me", avatar_url: null },
          { id: participantIds[0], email: "new@demo.com", display_name: "New User", avatar_url: null },
        ],
      };
      setConversations(prev => [newConv, ...prev]);
      return newId;
    }

    if (!user) return null;

    try {
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (convError || !conv) throw convError;

      const participants = [
        { conversation_id: conv.id, user_id: user.id },
        ...participantIds.map((id) => ({ conversation_id: conv.id, user_id: id })),
      ];

      const { error: partError } = await supabase
        .from("conversation_participants")
        .insert(participants);

      if (partError) throw partError;

      await fetchConversations();
      return conv.id;
    } catch (e) {
      setError(e as Error);
      return null;
    }
  };

  const findExistingConversation = async (otherUserId: string): Promise<string | null> => {
    if (USE_DEMO) return null;

    if (!user) return null;

    const { data } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!data || data.length === 0) return null;

    const conversationIds = data.map((d) => d.conversation_id);

    const { data: existing } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", conversationIds)
      .single();

    return existing?.conversation_id || null;
  };

  const startConversation = async (otherUserId: string): Promise<string | null> => {
    const existing = await findExistingConversation(otherUserId);
    if (existing) return existing;
    return createConversation([otherUserId]);
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
  const [profiles, setProfiles] = useState<typeof DEMO_PROFILES>(USE_DEMO ? DEMO_PROFILES : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (USE_DEMO) {
      setProfiles(DEMO_PROFILES.filter(p => p.id !== DEMO_USER_ID));
      return;
    }
    fetchProfiles();
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByEmail = async (email: string) => {
    if (USE_DEMO) {
      const found = DEMO_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase() && p.id !== DEMO_USER_ID);
      return found || null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) return null;
    return data;
  };

  return {
    profiles: profiles.filter((p) => p.id !== (USE_DEMO ? DEMO_USER_ID : undefined)),
    allProfiles: profiles,
    loading,
    error,
    refetch: fetchProfiles,
    searchByEmail,
    getOtherParticipants: async () => [],
  };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    if (USE_DEMO) {
      setMessages(DEMO_MESSAGES[conversationId] || []);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles(id, email, display_name, avatar_url)")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (USE_DEMO || !conversationId) return;

    const channel: RealtimeChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const { data: newMsg } = await supabase
            .from("messages")
            .select("*, sender:profiles(id, email, display_name, avatar_url)")
            .eq("id", payload.new.id)
            .single();

          if (newMsg) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!conversationId || !content.trim()) return false;

    if (USE_DEMO) {
      const newMsg: Message = {
        id: `msg${Date.now()}`,
        conversation_id: conversationId,
        sender_id: DEMO_USER_ID,
        content: content.trim(),
        created_at: new Date().toISOString(),
        sender: { id: DEMO_USER_ID, email: "me@demo.com", display_name: "Me", avatar_url: null },
      };
      setMessages(prev => [...prev, newMsg]);
      
      if (DEMO_MESSAGES[conversationId]) {
        DEMO_MESSAGES[conversationId].push(newMsg);
      } else {
        DEMO_MESSAGES[conversationId] = [newMsg];
      }
      return true;
    }

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: DEMO_USER_ID,
        content: content.trim(),
      });

      if (error) throw error;

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return true;
    } catch (e) {
      setError(e as Error);
      return false;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
}
