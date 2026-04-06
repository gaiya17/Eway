/**
 * Supabase Client Configuration
 * Initializes and exports Supabase clients for both general and administrative use.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validation of environment variables
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('CRITICAL: Supabase credentials are missing from .env');
}

/**
 * Standard Supabase client for general application use.
 * Honors Row Level Security (RLS) policies.
 */
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Administrative Supabase client for backend-only tasks.
 * Bypasses Row Level Security (RLS). 
 * Use with extreme caution.
 */
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = { supabase, supabaseAdmin };
