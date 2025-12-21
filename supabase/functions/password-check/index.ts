console.log("🔥 FORCE REDEPLOY VERSION 1");

Deno.serve(async (req) => {
  console.log("METHOD:", req.method);
  console.log("HEADERS:", Object.fromEntries(req.headers));

  const origin = req.headers.get("origin") ?? "";

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Read raw text first to avoid throwing on empty body
    const raw = await req.text();

    if (!raw) {
      return new Response(
        JSON.stringify({ error: "Empty request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const password = (parsed?.password ?? "").toString();

    const correctPassword = Deno.env.get("SITE_PASSWORD") ?? "";
    if (!correctPassword) {
      return new Response(
        JSON.stringify({ error: "SITE_PASSWORD not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mask helper for safe logging
    const mask = (s: string) =>
      s.length <= 2 ? "*".repeat(s.length) : s[0] + "*".repeat(Math.max(0, s.length - 2)) + s[s.length - 1];

    // Normalize both sides before comparing
    if (password.trim() === correctPassword.trim()) {
      const token = crypto.randomUUID();
      return new Response(
        JSON.stringify({ success: true, token }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Debug info included safely in response for troubleshooting.
    // Remove debug object before production.
    // Unauthorized response (no debug info)
    return new Response(
      JSON.stringify({ success: false }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("FUNCTION ERROR:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});