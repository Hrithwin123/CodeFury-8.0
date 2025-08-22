import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bsvvwglagmjqmwojscbz.supabase.co'; // from API settings
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzdnZ3Z2xhZ21qcW13b2pzY2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMjIzMzQsImV4cCI6MjA2NjY5ODMzNH0.CqzynjmKve21vM1gsNs8D7rmGwePmRywVTlp3OQU7yQ'; // from API settings

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
