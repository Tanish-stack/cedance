/**
 * Supabase client — uses the service-role key so it bypasses RLS.
 * Only use this on the backend. Never expose the service-role key to the frontend.
 */
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env",
    );
}

const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
});

module.exports = supabase;
