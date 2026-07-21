// ================================================================
// Supabase project URL/anon key + client init (window `sb`). Loaded once, before everything else that talks to Supabase.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

  const SUPABASE_URL = 'https://msyonpqsivhodtdhcubr.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeW9ucHFzaXZob2R0ZGhjdWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODk5ODYsImV4cCI6MjA5OTQ2NTk4Nn0.8yBQHrm63fRcgFdpX-JxCrrumQ03S-Xyn8RsTI3Tu9Q';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
