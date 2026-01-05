import { useState, ReactNode, useEffect } from "react";

interface PasswordGateProps {
  children: ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

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
    setError("");

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
        setError(data.error || "Incorrect password");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setLoading(false);
        return;
      }

      localStorage.setItem("site_token", data.token);
      setAuthed(true);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setError("Something went wrong. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    setLoading(false);
  };

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-taupe-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md motion-safe:animate-enter-scale ${shake ? 'animate-shake' : ''}`}>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-taupe to-taupe-700 px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-lock-line text-3xl text-white"></i>
            </div>
            <h1 className="text-2xl font-serif text-white mb-1">Protected Site</h1>
            <p className="text-taupe-100 text-sm">Enter password to continue</p>
          </div>
          
          {/* Form */}
          <div className="p-8">
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-taupe-500 focus:border-transparent ${
                      error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-taupe-300'
                    }`}
                    autoComplete="current-password"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="ri-key-2-line text-xl"></i>
                  </div>
                </div>
                
                {/* Error Message */}
                {error && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1 motion-safe:animate-enter-up">
                    <i className="ri-error-warning-line"></i>
                    {error}
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-full px-6 py-3 bg-taupe text-white rounded-xl font-medium transition-all duration-200 hover:bg-taupe-700 focus:outline-none focus:ring-2 focus:ring-taupe-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-taupe flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="ri-login-box-line"></i>
                    Enter Site
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Footer text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          <i className="ri-shield-check-line mr-1"></i>
          Secure access for authorized users
        </p>
      </div>
    </div>
  );
}