import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { useAuth } from "./useAuth";

export function useUpload() {
  const { user } = useAuth();

  const uploadMediaAndReturnSignedUrl = async ({
    isVideo = false,
    fileUri,
  }: {
    isVideo?: boolean;
    fileUri: string;
  }) => {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: "base64",
    });
    const filePath = `${user!.id}/${new Date().getTime()}.${isVideo ? "png" : "mp4"}`;
    // img.type === 'image' ? 'png' : 'mp4'
    const contentType = isVideo ? "video/mp4" : "image/png";
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user_media")
      .upload(filePath, decode(base64), { contentType });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return false;
    }

    const { data: signedData, error } = await supabase.storage
      .from("user_media")
      .createSignedUrl(uploadData.path, 31536000); // 1 year. FIXME: Need to add crons to create another after it expires

    if (error) {
      console.log("Sign url generation error: ", error);
      return false;
    }

    return signedData.signedUrl;
  };

  return {
    uploadMediaAndReturnSignedUrl,
  };
}
