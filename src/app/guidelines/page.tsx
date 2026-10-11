import React from "react";
import Link from "next/link";
import { BrandHeader } from "@/components/brand/BrandHeader";
import { Button } from "@/ui/button";
import { ShieldCheck, AlertOctagon, CheckCircle2, Lock, ArrowLeft } from "lucide-react";

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col text-slate-100">
      <BrandHeader />

      <main className="max-w-4xl w-full mx-auto px-4 py-12 flex-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Community Guidelines</h1>
            <p className="text-xs text-slate-400">Last updated: October 2026</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-8">
          InFind is committed to providing a friendly, spontaneous, and safe space for people to meet strangers
          around the world. To maintain this environment, all participants must abide by these rules without exception.
        </p>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-400" />
              <span>1. Strict Zero-Tolerance Violations</span>
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-disc list-inside leading-relaxed">
              <li><strong>No Nudity or Sexual Conduct:</strong> Exposing genitals, sexual acts, or soliciting explicit content is strictly forbidden and results in an immediate permanent ban.</li>
              <li><strong>No Underage Users:</strong> InFind is strictly for users aged 18 and older. Minors are prohibited from registering or using the service.</li>
              <li><strong>No Harassment or Bullying:</strong> Derogatory remarks, stalking, doxxing, hate speech, or targeted intimidation will not be tolerated.</li>
              <li><strong>No Threats or Violence:</strong> Displaying weapons, self-harm, or threatening harm to any individual is grounds for immediate termination.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>2. Positive Interaction Standards</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Treat everyone with respect. Understand that cultural norms differ across the world.
              If a conversation is uncomfortable or not to your liking, simply click <strong>Next</strong> or <strong>End Call</strong> at any time.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-400" />
              <span>3. Privacy and Personal Safety</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Never share sensitive personal information (such as your home address, financial details, passwords, or government IDs) with strangers online.
              Use the built-in <strong>Block</strong> and <strong>Report</strong> buttons whenever an interaction violates our policies.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/chat">
            <Button size="lg" className="shadow-glow">
              Start Video Chatting
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
