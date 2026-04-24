import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/profile";

export const fetchProfileById = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .returns<Profile[]>()
    .single();

  if (error) throw error;
  return data ?? null;
};

export const fetchAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, updated_at")
    .order("full_name", { ascending: true })
    .returns<Profile[]>();

  if (error) throw error;
  return data ?? [];
};

export const fetchProfileByUsername = async (
  username: string,
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, updated_at")
    .eq("username", username.toLowerCase())
    .returns<Profile[]>()
    .single();

  if (error) return null;
  return data ?? null;
};

export const checkUsernameAvailable = async (
  username: string,
  excludeUserId?: string,
): Promise<boolean> => {
  if (!username) return false;

  let query = supabase.from("profiles").select("id").ilike("username", username);
  if (excludeUserId) query = query.neq("id", excludeUserId);

  const { data, error } = await query;
  if (error) return false;
  return !data || data.length === 0;
};

export const updateProfileById = async (
  userId: string,
  updates: Partial<Pick<Profile, "username" | "full_name">>,
): Promise<void> => {
  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
};

export const updateAvatarById = async (
  userId: string,
  avatarUrl: string,
): Promise<void> => {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
};