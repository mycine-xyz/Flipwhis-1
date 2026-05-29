import { useState } from "react";
import { useLocation } from "wouter";

const ADMIN_PASSWORD = "ayush0269";
const STORAGE_KEY = "flipwhis_admin_auth";

export function setAdminAuth() {
  localStorage.setItem(STORAGE_KEY, "1");
}

export function clearAdminAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isAdminAuthed() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setAdminAuth();
        navigate("/admin");
      } else {
        setError("Galat password hai. Dobara try karo.");
        setPassword("");
      }
      setLoading(false);
    }, 600);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-[#FF3F6C] rounded-2xl items-center justify-center font-black text-white text-2xl mb-4 shadow-lg shadow-[#FF3F6C]/30">
            M
          </div>
          <h1 className="text-white text-xl font-bold">Flipwhis Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Password daalo aage jaane ke liye</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wide mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#FF3F6C] transition-colors placeholder-gray-600"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!password || loading}
              className="w-full bg-[#FF3F6C] hover:bg-[#e0365f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              {loading ? "Checking..." : "Login"}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            ← Store pe wapas jao
          </button>
        </div>
      </div>
    </div>
  );
}
