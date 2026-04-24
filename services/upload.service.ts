import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

export const uploadMedia = async ({
  userId,
  fileUri,
  isVideo = false,
}: {
  userId: string;
  fileUri: string;
  isVideo?: boolean;
}): Promise<string | false> => {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: "base64",
  });

  const extension = isVideo ? "mp4" : "png";
  const contentType = isVideo ? "video/mp4" : "image/png";
  const filePath = `${userId}/${Date.now()}.${extension}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("user_media")
    .upload(filePath, decode(base64), { contentType });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return false;
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from("user_media")
    .createSignedUrl(uploadData.path, 31536000); // 1 year — TODO: cron to refresh before expiry

  if (signedError) {
    console.error("Signed URL error:", signedError);
    return false;
  }

  return signedData.signedUrl;
};