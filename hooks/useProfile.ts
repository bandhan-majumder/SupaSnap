import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { useEffect, useState, useCallback } from "react";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
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

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // console.log("Fetching profile for user:", user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        // console.error("Fetch profile error:", error);
        setError(error.message);
      } else {
        // console.log("Profile fetched:", data);
        setProfile(data);
      }
    } catch (e) {
      // console.error("Fetch profile exception:", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateAvatar = async (fileUri: string): Promise<boolean> => {
    if (!user) {
      setError("No user logged in");
      return false;
    }

    setUploading(true);
    setError(null);

    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "base64",
      });
      const filePath = `${user!.id}/${new Date().getTime()}.${"png"}`;
      // img.type === 'image' ? 'png' : 'mp4'
      // const contentType = img.type === 'image' ? 'image/png' : 'video/mp4';
      const contentType = "image/png";
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user_images")
        .upload(filePath, decode(base64), { contentType });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError(uploadError.message);
        return false;
      }

      const { data: signedData, error } = await supabase.storage
          .from("user_images")
          .createSignedUrl(uploadData.path, 31536000);

      if (error){
        return false;
      };

      if (signedData?.signedUrl) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            avatar_url: signedData.signedUrl,
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
          display_name:
            profile?.display_name || user.email?.split("@")[0] || null,
          avatar_url: signedData.signedUrl,
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setProfile(updatedProfile as Profile);
        return true;
      }

      return false;
    } catch (e) {
      console.error("Update avatar exception:", e);
      setError((e as Error).message || "Unknown error");
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    profile,
    loading,
    uploading,
    error,
    updateAvatar,
    refetch: fetchProfile,
  };
}
