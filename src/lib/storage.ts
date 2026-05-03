import { supabase } from "@/integrations/supabase/client";

/** Upload a file to the public portal-files bucket and return its public URL. */
export async function uploadPortalFile(file: File, prefix = "uploads"): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("portal-files").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("portal-files").getPublicUrl(path);
  return data.publicUrl;
}
