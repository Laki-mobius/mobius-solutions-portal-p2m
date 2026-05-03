import { supabase } from "@/integrations/supabase/client";
import { getSessionId, getStoredEmail } from "@/lib/email-gate";

export type ActivityAction =
  | "view_solution"
  | "view_collateral"
  | "play_video"
  | "download_collateral"
  | "reveal_credentials";

export async function recordSession(email: string) {
  const session_id = getSessionId();
  await supabase.from("user_sessions").insert({ email, session_id });
}

export async function logActivity(
  action: ActivityAction,
  target_id: string,
  target_type: "solution" | "collateral",
) {
  const email = getStoredEmail();
  if (!email) return;
  const session_id = getSessionId();
  await supabase
    .from("activity_logs")
    .insert({ email, session_id, action, target_id, target_type });
}
