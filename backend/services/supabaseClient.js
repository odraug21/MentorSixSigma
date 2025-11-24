// backend/services/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ← CORRECTO

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ ERROR: Supabase URL o Service Key no están configurados.");
  console.error("SUPABASE_URL:", supabaseUrl);
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey);
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
