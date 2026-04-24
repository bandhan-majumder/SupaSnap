import { useAuth } from "./use-auth";
import { uploadMedia } from "@/services/upload.service";

export function useUpload() {
  const { user } = useAuth();

  const uploadMediaAndReturnSignedUrl = async ({
    fileUri,
    isVideo = false,
  }: {
    fileUri: string;
    isVideo?: boolean;
  }): Promise<string | false> => {
    if (!user) {
      console.error("Upload error: No user logged in");
      return false;
    }

    return uploadMedia({ userId: user.id, fileUri, isVideo });
  };

  return {
    uploadMediaAndReturnSignedUrl,
  };
}