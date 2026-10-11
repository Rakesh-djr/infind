"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/ui/button";
import {
  Video,
  Shield,
  Settings,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

export const BrandHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isChatPage = pathname === "/chat";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#07090e]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo size="md" showTagline={false} />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/chat"
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isChatPage
                ? "text-brand-400 font-semibold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Video className="w-4 h-4" />
            Video Chat
          </Link>
          <Link
            href="/guidelines"
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === "/guidelines"
                ? "text-brand-400 font-semibold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" />
            Safety
          </Link>
        </nav>

        {/* Right Action Area */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Admin badge link */}
              {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-brand-500/40 text-brand-300">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}

              {/* User settings menu */}
              <Link href="/settings">
                <Button variant="glass" size="sm" className="gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-medium text-slate-200">@{user.username}</span>
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-400 hover:text-red-400"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0c101c] px-4 pt-3 pb-6 flex flex-col gap-3">
          <Link
            href="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-xl text-slate-200 hover:bg-white/5 flex items-center gap-2.5 font-medium"
          >
            <Video className="w-4 h-4 text-brand-400" />
            Video Chat
          </Link>
          <Link
            href="/guidelines"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-xl text-slate-200 hover:bg-white/5 flex items-center gap-2.5 font-medium"
          >
            <Shield className="w-4 h-4 text-brand-400" />
            Safety & Guidelines
          </Link>

          {isAuthenticated && user ? (
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-slate-200 hover:bg-white/5 flex items-center gap-2.5 font-medium"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings (@{user.username})
              </Link>
              {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-brand-300 hover:bg-brand-500/10 flex items-center gap-2.5 font-medium"
                >
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  Admin Moderation
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 font-medium text-left"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
