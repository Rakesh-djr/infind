"use client";

import React, { useEffect } from "react";
import { Button } from "@/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[APPLICATION_ERROR]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        An unexpected error occurred while loading this view. You can safely attempt to recover.
      </p>

      <Button onClick={() => reset()} className="gap-2 shadow-glow">
        <RotateCcw className="w-4 h-4" />
        <span>Try Again</span>
      </Button>
    </div>
  );
}
