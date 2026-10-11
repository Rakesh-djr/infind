// InFind - Centralized Brand Configuration & Theme Tokens

export const BRAND = {
  name: "InFind",
  legalName: "InFind Technologies",
  tagline: "Meet strangers. Find connections.",
  description:
    "Connect with random people worldwide through secure, instant, peer-to-peer live video and audio. Safe, private, and spontaneous.",
  version: "1.0.0",
  urls: {
    home: "/",
    chat: "/chat",
    login: "/login",
    register: "/register",
    settings: "/settings",
    admin: "/admin",
    terms: "/terms",
    privacy: "/privacy",
    guidelines: "/guidelines",
  },
  meta: {
    author: "InFind Team",
    keywords: [
      "random video chat",
      "stranger chat",
      "live video calling",
      "webrtc video chat",
      "meet new people",
      "instant video match",
      "private video talk",
    ],
  },
  theme: {
    colors: {
      background: "#07090e",
      card: "#0d111a",
      elevated: "#182030",
      primary: "#6366f1", // Indigo
      primaryGradientStart: "#6366f1",
      primaryGradientMid: "#8b5cf6", // Violet
      primaryGradientEnd: "#06b6d4", // Cyan
      border: "rgba(255, 255, 255, 0.08)",
      textMuted: "#94a3b8",
      textLight: "#f8fafc",
    },
  },
  safety: {
    minimumAge: 18,
    emergencyNotice: "If you feel in immediate danger, exit the call and contact local authorities.",
  },
} as const;

export type BrandConfig = typeof BRAND;
