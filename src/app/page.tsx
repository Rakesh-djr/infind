import React from "react";
import Link from "next/link";
import { BrandHeader } from "@/components/brand/BrandHeader";
import { Button } from "@/ui/button";
import { BRAND } from "@/lib/brand";
import {
  Video,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  Lock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Zap,
  Users,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <BrandHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-brand-violet/20 to-brand-accent/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            <span>Next-Generation Random Video Chat</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
            Meet strangers. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-violet to-brand-accent">
              Find connections.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8">
            {BRAND.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
            <Link href="/chat" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto min-w-[220px] text-base gap-2 shadow-glow">
                <Video className="w-5 h-5" />
                <span>Start Video Chat</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto min-w-[180px] text-base">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Hero Video Preview Mockup Graphic */}
          <div className="w-full max-w-4xl rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-white/15 to-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#0c101c] border border-white/10 flex items-center justify-center">
              {/* Decorative Stranger Preview Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

              <div className="relative z-10 flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 shadow-glow">
                  <Sparkles className="w-8 h-8 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Peer-to-Peer Live Experience</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                  Real WebRTC video, honest matchmaking queue, and instant skip controls.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-medium border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Real WebRTC Audio & Video
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 text-xs font-medium border border-brand-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> No Bots or Fake Identities
                  </span>
                </div>
              </div>

              {/* Local Mirror Overlay Mockup */}
              <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden border border-white/20 bg-black/80 backdrop-blur-md flex items-center justify-center">
                <span className="text-[10px] text-slate-400 font-medium">Your Camera Preview</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-t border-white/[0.08] bg-[#0c101c]/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
              How InFind Works
            </h2>
            <p className="text-sm text-slate-400">
              Three simple steps to spontaneous, high-definition random video conversations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-brand-500/30 transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Create a Secure Profile</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Register with a unique username. Your passwords are protected using industry-standard Argon2id hashing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-brand-500/30 transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Set Your Preferences</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by language, country, or shared interests. InFind’s matching engine respects your preferences.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-brand-500/30 transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 text-cyan-300 flex items-center justify-center mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Connect Instantly</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hit Start Matching. When paired, talk via live video, exchange text messages, or click Next at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
              Built for Modern Stranger Discovery
            </h2>
            <p className="text-sm text-slate-400">
              Unlike legacy platforms filled with bots and insecurity, InFind delivers a polished, trustworthy experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
              <Lock className="w-6 h-6 text-brand-400 mb-3" />
              <h4 className="text-sm font-semibold text-white mb-1">Encrypted WebRTC</h4>
              <p className="text-xs text-slate-400">
                Direct peer-to-peer audio and video transmission with modern DTLS-SRTP encryption.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
              <SlidersHorizontal className="w-6 h-6 text-brand-violet mb-3" />
              <h4 className="text-sm font-semibold text-white mb-1">Smart Filters</h4>
              <p className="text-xs text-slate-400">
                Match by language, country, or tags like gaming, coding, travel, and music.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
              <h4 className="text-sm font-semibold text-white mb-1">Instant Block & Report</h4>
              <p className="text-xs text-slate-400">
                One-click blocking prevents rematches forever, backed by an active moderation review team.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
              <Zap className="w-6 h-6 text-cyan-400 mb-3" />
              <h4 className="text-sm font-semibold text-white mb-1">Zero Fake Online Users</h4>
              <p className="text-xs text-slate-400">
                Honest waiting states. We never fabricate fake users or bot video streams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice & Community Guidelines Preview */}
      <section className="py-16 border-t border-white/[0.08] bg-[#0c101c]/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs font-semibold mb-4 border border-red-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> 18+ Community Only
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Community Safety is Priority #1</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            InFind strictly enforces zero tolerance for nudity, harassment, hate speech, violence, or spam.
            Violators are permanently banned, and all reports are reviewed by our moderation staff.
          </p>
          <Link href="/guidelines">
            <Button variant="outline" size="sm">
              Read Community Guidelines
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#07090e] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">InFind</span>
            <span>&copy; {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/guidelines" className="hover:text-white transition-colors">
              Community Guidelines
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
