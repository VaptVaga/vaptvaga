// Re-export the single Supabase instance to prevent multiple clients from fighting over auth locks
export { supabase } from '../integrations/supabase/client';
