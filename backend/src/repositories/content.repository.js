import { getSupabase } from "../config/supabase.js";

const PUBLIC_TABLES = new Set(["schools", "materials", "videos", "events", "notifications"]);

function applyCommonFilters(query, filters) {
  if (filters.class) query = query.eq("class", filters.class);
  if (filters.subject) query = query.eq("subject", filters.subject);
  if (filters.district) query = query.eq("district", filters.district);
  if (filters.target_type) query = query.eq("target_type", filters.target_type);
  return query;
}

export async function listRows(table, filters = {}) {
  if (!PUBLIC_TABLES.has(table)) {
    throw new Error(`Unsupported table: ${table}`);
  }

  let query = getSupabase().from(table).select("*");
  query = applyCommonFilters(query, filters);

  if (table === "events") {
    query = query.order("event_date", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createFeedback(row) {
  const { data, error } = await getSupabase().from("feedback").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function databasePing() {
  const { error } = await getSupabase().from("schools").select("id", { head: true, count: "exact" });
  if (error) throw error;
  return { status: "ok" };
}
