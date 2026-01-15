import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.supabaseUrl;
const supabaseAnonKey = import.meta.env.supabaseAnonKey;

export const supabase = createClient(
    'https://afgdmuelzwcwrogpljpp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZ2RtdWVsendjd3JvZ3BsanBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjEzMzIsImV4cCI6MjA4Mzc5NzMzMn0.dzK02zBuRx4x2pvVjmAEY5vqXFzoMQ0buFkicZXl_mo'
);
