// Debug: Log all Vite environment variables at startup
console.log("=== ENV CHECK START ===");
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL || "[NOT SET]");
console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? `[SET - ${import.meta.env.VITE_SUPABASE_ANON_KEY.length} chars]` : "[NOT SET]");
console.log("MODE:", import.meta.env.MODE);
console.log("DEV:", import.meta.env.DEV);
console.log("=== ENV CHECK END ===");

