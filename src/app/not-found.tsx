import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/ui/button";
import { Home, Video } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/10 blur-[100px] pointer-events-none rounded-full" />

      <Logo size="lg" className="mb-6 relative z-10" />

      <div className="relative z-10 max-w-md">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-accent mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-400 mb-8 leading-relaxed">
          The page or video room you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button variant="secondary" size="md" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Link href="/chat">
            <Button size="md" className="gap-2 w-full sm:w-auto shadow-glow">
              <Video className="w-4 h-4" />
              <span>Start Video Chat</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
