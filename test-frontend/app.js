// test-frontend/app.js
// Replace "YOUR_ANON_KEY" with your Supabase anon public key (exact string)
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZza3Z6cm9iY2Zva2V6dW1hZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MTMyNDksImV4cCI6MjA4MDk4OTI0OX0.2n0hUieIaRaWvc91sFqnekPRF_Z9brXaJ-jZiW2BB2k";

document.getElementById("btn").onclick = async () => {
  const pw = document.getElementById("pw").value;
  const out = document.getElementById("out");
  try {
    const res = await fetch("https://fskvzrobcfokezumadbb.supabase.co/functions/v1/password-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON_KEY}`,
        "apikey": ANON_KEY
      },
      body: JSON.stringify({ password: pw })
    });
    const data = await res.json();
    out.textContent = JSON.stringify({ status: res.status, body: data }, null, 2);
    if (res.ok && data.token) {
      localStorage.setItem("site_token", data.token);
      console.log("Logged in, token saved");
    } else {
      console.log("Login failed", data);
    }
  } catch (err) {
    out.textContent = String(err);
    console.error(err);
  }
};