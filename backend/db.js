/**
 * Supabase client — uses the service-role key so it bypasses RLS.
 * Only use this on the backend. Never expose the service-role key to the frontend.
 */
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (url && key && !url.includes("your-project") && !key.includes("your-key")) {
    try {
        supabase = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    } catch (err) {
        console.warn("Could not initialize Supabase client:", err.message);
    }
} else {
    console.log("[db.js] Supabase credentials not set or using placeholder; using in-memory mock store with seed data.");
}

module.exports = supabase;
