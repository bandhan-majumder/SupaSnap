import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";
import { useUpload } from "./use-upload";
import { Profile } from "@/types/profile";
import {
  checkUsernameAvailable,
  fetchProfileById,
  updateAvatarById,
  updateProfileById,
} from "@/services/profile.service";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { uploadMediaAndReturnSignedUrl } = useUpload();

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchProfileById(user.id);
      setProfile(data);
    } catch (e) {
      console.error("Fetch profile error:", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getProfile = useCallback(async (): Promise<{
    data: Profile | null;
    error: string | null;
  }> => {
    if (!user) return { data: null, error: "No user logged in" };
    try {
      const data = await fetchProfileById(user.id);
      setProfile(data);
      return { data, error: null };
    } catch (e) {
      return { data: null, error: (e as Error).message };
    }
  }, [user]);

  const updateProfile = useCallback(
    async (updates: {
      username?: string;
      full_name?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: "No user logged in" };

      setUpdating(true);
      setError(null);

      try {
        if (updates.username) {
          const available = await checkUsernameAvailable(updates.username, user.id);
          if (!available) {
            return { success: false, error: "Username already taken" };
          }
        }

        await updateProfileById(user.id, updates);
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        return { success: true };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      } finally {
        setUpdating(false);
      }
    },
    [user],
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

      await updateAvatarById(user.id, signedUrl);

      setProfile((prev) => ({
        ...prev,
        id: user.id,
        username: prev?.username ?? null,
        full_name: prev?.full_name ?? null,
        avatar_url: signedUrl,
        updated_at: new Date().toISOString(),
      }));

      return true;
    } catch (e) {
      console.error("Update avatar error:", e);
      setError((e as Error).message ?? "Unknown error");
      return false;
    } finally {
      setUploading(false);
    }
  };

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