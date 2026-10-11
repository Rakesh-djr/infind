import React from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  variant?: "full" | "icon";
  href?: string | null;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showTagline = false,
  variant = "full",
  href = "/",
  className = "",
}) => {
  const iconDimensions = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  }[size];

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }[size];

  const logoGraphic = (
    <div className={`relative flex items-center justify-center shrink-0 ${iconDimensions}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
      >
        <defs>
          <linearGradient id="infind-grad-1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="infind-grad-pulse" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Beacon Container */}
        <rect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="12"
          fill="#0c101c"
          stroke="url(#infind-grad-1)"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Left Pulse Pillar (Representing "In") */}
        <rect x="13" y="14" width="4.5" height="20" rx="2.25" fill="url(#infind-grad-1)" />

        {/* Central Intersecting Optical Lens Rings (Representing "Find" & Peer-to-Peer connection) */}
        <circle
          cx="28"
          cy="24"
          r="8"
          stroke="url(#infind-grad-pulse)"
          strokeWidth="3.5"
          strokeDasharray="42 8"
          strokeLinecap="round"
        />
        {/* Core Connection Point */}
        <circle cx="28" cy="24" r="3" fill="#06b6d4" className="animate-pulse" />
      </svg>
    </div>
  );

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {logoGraphic}
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-white ${textSizes}`}>
            In<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-violet to-brand-accent">Find</span>
          </span>
          {showTagline && (
            <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
              {BRAND.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
};
