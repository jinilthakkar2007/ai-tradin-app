
import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT SETUP ---
// This app uses Supabase for authentication. You need to provide your own project credentials.
// In a typical development environment, these would be stored in environment variables (e.g., from a .env file).
// For this environment, please replace the placeholder values below.
// You can find these in your Supabase project dashboard under Settings > API.

const SUPABASE_URL = 'https://mfkmbxenvndibuvyqzus.supabase.co'; // REPLACE with your Supabase project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ma21ieGVudm5kaWJ1dnlxenVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0ODM0MjksImV4cCI6MjA3NDA1OTQyOX0.h-AQoGXojMvRwhhFDMgxXs_QfKBtcKWjGFWGy4HmgdU'; // REPLACE with your Supabase anon key

if (SUPABASE_URL.includes('your-project-url') || SUPABASE_ANON_KEY.includes('your-anon-key')) {
  // Log a more visible warning to the developer to ensure they see it.
  const warningStyle = 'background: #ffc107; color: #333; font-size: 16px; padding: 10px; border-radius: 5px; font-weight: bold;';
  console.warn('%cWARNING: Supabase credentials are not set!', warningStyle);
  console.warn("Please replace the placeholder values in 'services/supabase.ts' with your project's URL and anon key for authentication to function correctly.");
}

// Create and export the Supabase client.
// The app will now load without crashing. Authentication and other Supabase features
// will not work until you provide your valid credentials above.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
