import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useUpload } from "./useUpload";

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { uploadMediaAndReturnSignedUrl } = useUpload();

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Fetch profile error:", error);
        setError(error.message);
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error("Fetch profile exception:", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const [updating, setUpdating] = useState(false);

  const checkUsernameAvailable = useCallback(
    async (username: string, excludeUserId?: string): Promise<boolean> => {
      if (!username) return false;

      let query = supabase
        .from("profiles")
        .select("id")
        .ilike("username", username);

      if (excludeUserId) {
        query = query.neq("id", excludeUserId);
      }

      const { data, error } = await query;
      if (error) return false;
      return !data || data.length === 0;
    },
    [],
  );

  const updateProfile = useCallback(
    async (updates: {
      username?: string;
      full_name?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: "No user logged in" };
      }

      setUpdating(true);
      setError(null);

      try {
        if (updates.username) {
          const available = await checkUsernameAvailable(
            updates.username,
            user.id,
          );
          if (!available) {
            setUpdating(false);
            return { success: false, error: "Username already taken" };
          }
        }

        const updateData: Partial<Profile> = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id);

        if (updateError) {
          setUpdating(false);
          return { success: false, error: updateError.message };
        }

        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        setUpdating(false);
        return { success: true };
      } catch (e) {
        setUpdating(false);
        return { success: false, error: (e as Error).message };
      }
    },
    [user, checkUsernameAvailable],
  );

  const updateAvatar = async (fileUri: string): Promise<boolean> => {
    if (!user) {
      setError("No user logged in");
      return false;
    }

    setUploading(true);
    setError(null);

    try {
      const signedUrl = await uploadMediaAndReturnSignedUrl({ fileUri });

      if (!signedUrl) {
        setError("Upload error");
        return false;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: signedUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Update profile error:", updateError);
        setError(updateError.message);
        return false;
      }

      const updatedProfile: Profile = {
        ...profile,
        id: user.id,
        email: user.email || null,
        username: profile?.username || null,
        full_name: profile?.full_name || null,
        avatar_url: signedUrl,
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setProfile(updatedProfile as Profile);
      return true;
    } catch (e) {
      console.error("Update avatar exception:", e);
      setError((e as Error).message || "Unknown error");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const getProfile = useCallback(async (): Promise<{
    data: Profile | null;
    error: string | null;
  }> => {
    if (!user) return { data: null, error: "No user logged in" };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      setProfile(data);
      return { data, error: null };
    } catch (e) {
      return { data: null, error: (e as Error).message };
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    uploading,
    updating,
    error,
    getProfile,
    updateProfile,
    updateAvatar,
    refetch: fetchProfile,
  };
}
