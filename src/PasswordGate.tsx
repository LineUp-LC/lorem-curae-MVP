import { useState, ReactNode, useEffect } from "react";

interface PasswordGateProps {
  children: ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Restore session
  useEffect(() => {
    const stored = localStorage.getItem("site_token");
    if (stored) {
      setAuthed(true);
    }
  }, []);

  // ✅ Submit handler
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
  console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);


try {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/password-check`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ password: input }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Incorrect password");
    setLoading(false);
    return;
  }

  localStorage.setItem("site_token", data.token);
  setAuthed(true);
} catch (err) {
  console.error("FETCH ERROR:", err);
  alert("Something went wrong. Check console.");
}


    setLoading(false);
  };

  if (authed) return <>{children}</>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Protected Site</h1>
      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="Enter password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}