"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Live availability states
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available?: boolean;
    validFormat?: boolean;
    error?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounced live username availability check
  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      setUsernameStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setUsernameStatus(data);
      } catch {
        setUsernameStatus(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      setErrorMessage("You must accept the Community Guidelines and Terms of Service to register");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          confirmPassword,
          acceptTerms,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please check your inputs.");
      }

      await refreshUser();
      router.push("/chat");
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-violet/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo size="lg" showTagline={true} className="mb-4" />
        <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
          Create your InFind Account
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Choose a unique username to start meeting strangers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0c101c]/90 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-glass backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-medium animate-fade-in">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username with live availability feedback */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Unique Username
                </label>
                {isCheckingUsername && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                )}
                {!isCheckingUsername && usernameStatus && (
                  <span
                    className={`text-[11px] flex items-center gap-1 font-medium ${
                      usernameStatus.available ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {usernameStatus.available ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Available
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> {usernameStatus.error || "Taken"}
                      </>
                    )}
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                minLength={3}
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Neo_Connect"
                className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                3–20 characters. Letters, numbers, and underscores only.
              </span>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>

            {/* Terms & Guidelines Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded accent-brand-500"
                />
                <span className="leading-relaxed">
                  I confirm that I am at least 18 years old and agree to InFind&apos;s{" "}
                  <Link href="/terms" className="text-brand-400 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/guidelines" className="text-brand-400 hover:underline">
                    Community Guidelines
                  </Link>
                  .
                </span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-3 text-sm shadow-glow"
              isLoading={isLoading}
            >
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Already registered?{" "}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold underline">
                Log in to InFind
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
