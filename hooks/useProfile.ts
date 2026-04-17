import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { useEffect, useState, useCallback } from "react";

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
      console.log("Fetching profile for user:", user.id);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Profile not found, creating one...");
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              display_name: user.email?.split("@")[0] || "User",
            })
            .select()
            .single();
          
          if (createError) {
            console.error("Create profile error:", createError);
            setError(createError.message);
          } else {
            console.log("Profile created:", newProfile);
            setProfile(newProfile);
          }
        } else {
          console.error("Fetch profile error:", error);
          setError(error.message);
        }
      } else {
        console.log("Profile fetched:", data);
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

  const updateAvatar = async (fileUri: string): Promise<boolean> => {
    if (!user) {
      setError("No user logged in");
      return false;
    }

    setUploading(true);
    setError(null);
    
    try {
      console.log("Starting avatar update with file:", fileUri);
      
      const fileExt = fileUri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/avatar.${fileExt}`;
      console.log("File name:", fileName);

      const fileResponse = await fetch(fileUri);
      const fileBlob = await fileResponse.blob();
      console.log("File blob size:", fileBlob.size);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(fileName, fileBlob, {
          upsert: true,
          contentType: `image/${fileExt}`,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError(uploadError.message);
        return false;
      }
      
      console.log("Upload success:", uploadData);

      const { data: urlData } = supabase.storage
        .from("profile_images")
        .getPublicUrl(fileName);

      console.log("Public URL:", urlData.publicUrl);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          avatar_url: urlData.publicUrl, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Update profile error:", updateError);
        setError(updateError.message);
        return false;
      }

      console.log("Profile updated successfully");
      
      const updatedProfile: Profile = { 
        ...profile, 
        id: user.id, 
        email: user.email || null, 
        display_name: profile?.display_name || user.email?.split("@")[0] || null, 
        avatar_url: urlData.publicUrl, 
        created_at: profile?.created_at || new Date().toISOString(), 
        updated_at: new Date().toISOString() 
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

  return {
    profile,
    loading,
    uploading,
    error,
    updateAvatar,
    refetch: fetchProfile,
  };
}