import { ChatRoom } from "@/hooks/use-chats";

const getDisplayName = (conv: ChatRoom, currentUserId: string) => {
  const other = conv.participants.find((p) => p.user?.id !== currentUserId);
  return other?.user?.full_name || other?.user?.username || "Unknown";
};

const getAvatarUrl = (conv: ChatRoom, currentUserId: string): string | null => {
  const other = conv.participants.find((p) => p.user?.id !== currentUserId);
  return other?.user?.avatar_url ?? null;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export { formatTime, getAvatarUrl, getDisplayName, getInitials };

