"use client";

import { useState } from "react";
import { Flame, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

type Mode = "signin" | "signup";

type Props = {
  onAuthenticated: () => void;
};

export default function LoginScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async () => {
    clearMessages();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        setSuccessMsg(
          "Account created! Check your email to confirm, then sign in."
        );
        setMode("signin");
        setPassword("");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        onAuthenticated();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#ff6a00] flex items-center justify-center mb-4 shadow-lg shadow-[#ff6a00]/30">
            <Flame className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            MyGoal<span className="text-[#ff6a00]">22</span>
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
            Elite Performance System
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6a00] via-[#ee0979] to-transparent" />

          <div className="p-6">
            {/* Mode toggle */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-6">
              {(["signin", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); clearMessages(); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    mode === m
                      ? "bg-[#ff6a00] text-white shadow-lg shadow-[#ff6a00]/20"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Success message */}
            {successMsg && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-emerald-400">{successMsg}</p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-red-400">{error}</p>
              </div>
            )}

            {/* Email field */}
            <div className="mb-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1.5">
                Email
              </p>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-white outline-none focus:border-[#ff6a00]/50 transition-colors placeholder-neutral-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="mb-6">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1.5">
                Password
              </p>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-sm font-semibold text-white outline-none focus:border-[#ff6a00]/50 transition-colors placeholder-neutral-600 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-[10px] text-neutral-600 mt-1.5 px-1">
                  Minimum 6 characters.
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#ff6a00] hover:bg-[#ff7a1a] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all rounded-xl py-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff6a00]/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </>
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-neutral-700 mt-6 font-semibold">
          Your data is private and secure.
        </p>
      </div>
    </div>
  );
}