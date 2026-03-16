import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://piwbunhhahiebevkgdlv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpd2J1bmhoYWhpZWJldmtnZGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODg1OTQsImV4cCI6MjA4NzM2NDU5NH0.WaXwPUBdOAB6rhxGtZqecRrZEWeV_4qHCY2syzskEvg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
