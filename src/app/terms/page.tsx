import React from "react";
import Link from "next/link";
import { BrandHeader } from "@/components/brand/BrandHeader";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col text-slate-100">
      <BrandHeader />

      <main className="max-w-4xl w-full mx-auto px-4 py-12 flex-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Terms of Service</h1>
        <p className="text-xs text-slate-400 mb-8">Effective Date: October 2026</p>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-2">
            <h2 className="text-base font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using InFind (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service.
              If you do not agree with any portion of these Terms, you may not register or use the Service.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-2">
            <h2 className="text-base font-semibold text-white">2. Eligibility & Age Restriction</h2>
            <p>
              You must be at least eighteen (18) years of age to register and use InFind.
              Creating an account while under the age of 18 is a material breach of these Terms.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-2">
            <h2 className="text-base font-semibold text-white">3. User Conduct & Content</h2>
            <p>
              You are solely responsible for your interactions and conduct while using the Service.
              You agree not to transmit any unlawful, threatening, abusive, harassing, obscene, vulgar, or infringing material.
              InFind reserves the right to suspend or ban accounts that breach these standards without prior notice.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-2">
            <h2 className="text-base font-semibold text-white">4. No Recording Policy</h2>
            <p>
              InFind does not record or store your live audio or video streams on our servers.
              Unauthorized recording or rebroadcasting of other users without their express consent is strictly prohibited.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0c101c] border border-white/10 space-y-2">
            <h2 className="text-base font-semibold text-white">5. Limitation of Liability</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind.
              InFind shall not be liable for any indirect, incidental, or consequential damages resulting from your use of or inability to use the Service.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
