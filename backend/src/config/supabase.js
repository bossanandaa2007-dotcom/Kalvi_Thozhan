import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

let supabase;

export function getSupabase() {
  if (!env.supabaseUrl) {
    throw new Error("SUPABASE_URL is required for backend database access.");
  }

  if (!env.supabaseServiceRoleKey || env.supabaseServiceRoleKey.includes("replace-with")) {
    throw new Error("A real SUPABASE_SERVICE_ROLE_KEY is required for backend database access.");
  }

  if (!supabase) {
    supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabase;
}
