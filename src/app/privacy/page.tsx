import React from "react";
import Link from "next/link";
import { BrandHeader } from "@/components/brand/BrandHeader";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col text-slate-100">
      <BrandHeader />

      <main className="max-w-4xl w-full mx-auto px-4 py-12 flex-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Privacy Policy</h1>
            <p className="text-xs text-slate-400">Effective Date: October 2026</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-8">
          At InFind, your privacy is paramount. This policy outlines how we collect, handle, and protect your information.
        </p>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-2">
            <h2 className="text-base font-semibold text-white">1. Information We Collect</h2>
            <p>
              We collect only the minimal information required to operate the service securely:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Account credentials (unique username and cryptographically hashed password via Argon2id).</li>
              <li>Matching preferences (selected country codes, language preferences, and interest tags).</li>
              <li>Operational logs and safety reports submitted by users.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-2">
            <h2 className="text-base font-semibold text-white">2. Video and Audio Stream Privacy</h2>
            <p>
              Live audio and video calls are transmitted directly between participants via encrypted WebRTC peer connections.
              <strong> InFind does not record, intercept, or store live video or audio streams.</strong>
            </p>
            <p className="text-slate-400">
              Note on WebRTC IP exposure: In default peer-to-peer WebRTC connections, IP addresses may be discovered by the peer to establish the direct connection.
              When TURN relay is activated, traffic is relayed through our servers, keeping IP addresses shielded.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-2">
            <h2 className="text-base font-semibold text-white">3. Cookies and Session Security</h2>
            <p>
              We use secure, HTTP-only session cookies to maintain your login state. We do not use third-party tracking cookies or sell your personal data to advertisers.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-2">
            <h2 className="text-base font-semibold text-white">4. Your Rights & Account Deletion</h2>
            <p>
              You maintain full control of your account. You may view or change your preferences, manage blocked contacts, or permanently delete your account and associated records directly from your Account Settings page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
