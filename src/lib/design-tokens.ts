/**
 * Cedance Design Tokens
 * Extracted directly from DESIGN-notion.md
 */

export const COLORS = {
  // Brand & Structural
  primary: "#0075de",
  primaryActive: "#005bab",
  secondary: "#213183",
  onPrimary: "#ffffff",

  // Surfaces & Hairlines
  canvas: "#ffffff",
  canvasSoft: "#f6f5f4",
  surface: "#ffffff",
  hairline: "#e6e6e6",

  // Typography / Ink
  ink: "#000000",
  inkSecondary: "#31302e",
  inkMuted: "#615d59",
  inkFaint: "#a39e98",

  // Decorative Sticker Palette (Never used for CTAs or structural fills)
  sticker: {
    sky: "#62aef0",
    purple: "#d6b6f6",
    purpleDeep: "#391c57",
    pink: "#ff64c8",
    orange: "#dd5b00",
    orangeDeep: "#793400",
    teal: "#2a9d99",
    green: "#1aae39",
    brown: "#523410",
  },
} as const;

export type TaskStatus =
  | "Assigned"
  | "In Progress"
  | "Blocked"
  | "Pending Verification"
  | "Needs Rework"
  | "Complete";

export interface StatusConfig {
  label: TaskStatus;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  Assigned: {
    label: "Assigned",
    color: "#a39e98",
    badgeBg: "bg-[#a39e98]/10",
    badgeText: "text-[#31302e]",
    badgeBorder: "border-[#a39e98]/30",
  },
  "In Progress": {
    label: "In Progress",
    color: "#0075de",
    badgeBg: "bg-[#0075de]/10",
    badgeText: "text-[#0075de]",
    badgeBorder: "border-[#0075de]/30",
  },
  Blocked: {
    label: "Blocked",
    color: "#dd5b00",
    badgeBg: "bg-[#dd5b00]/10",
    badgeText: "text-[#dd5b00]",
    badgeBorder: "border-[#dd5b00]/30",
  },
  "Pending Verification": {
    label: "Pending Verification",
    color: "#d6b6f6",
    badgeBg: "bg-[#d6b6f6]/25",
    badgeText: "text-[#391c57]",
    badgeBorder: "border-[#d6b6f6]/50",
  },
  "Needs Rework": {
    label: "Needs Rework",
    color: "#ff64c8",
    badgeBg: "bg-[#ff64c8]/15",
    badgeText: "text-[#ff64c8]",
    badgeBorder: "border-[#ff64c8]/30",
  },
  Complete: {
    label: "Complete",
    color: "#1aae39",
    badgeBg: "bg-[#1aae39]/10",
    badgeText: "text-[#1aae39]",
    badgeBorder: "border-[#1aae39]/30",
  },
};

export const AT_RISK_CONFIG = {
  label: "At Risk",
  color: "#793400",
  badgeBg: "bg-[#793400]/10",
  badgeText: "text-[#793400]",
  badgeBorder: "border-[#793400]/30",
};
