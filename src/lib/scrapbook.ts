/**
 * Scrapbook design system utilities
 * Shared helpers for the hand-drawn/journal aesthetic
 */

export const modeConfig = {
  dream: {
    label: "dream",
    bg: "bg-dream-light",
    text: "text-dream-text",
    border: "border-dream",
    accent: "bg-dream",
  },
  execution: {
    label: "execution",
    bg: "bg-execution-light",
    text: "text-execution-text",
    border: "border-execution",
    accent: "bg-execution",
  },
  travel: {
    label: "live",
    bg: "bg-travel-light",
    text: "text-travel-text",
    border: "border-travel",
    accent: "bg-travel",
  },
  momento: {
    label: "momento",
    bg: "bg-momento-light",
    text: "text-momento-text",
    border: "border-momento",
    accent: "bg-momento",
  },
} as const;

export type Mode = keyof typeof modeConfig;

export const tapeColors = [
  "bg-tape-peach",
  "bg-tape-pink",
  "bg-tape-mint",
  "bg-tape-yellow",
] as const;

export const organicRotations = [
  "-2.5deg",
  "1.8deg",
  "-1.2deg",
  "2.2deg",
  "-0.8deg",
  "1.5deg",
] as const;

export const organicRotationClasses = [
  "rotate-organic-1",
  "rotate-organic-2",
  "rotate-organic-3",
  "rotate-organic-4",
  "rotate-organic-5",
  "rotate-organic-6",
] as const;

/** Get a tape color based on an index (cycles through) */
export function getTapeColor(index: number) {
  return tapeColors[index % tapeColors.length];
}

/** Get an organic rotation style for a card */
export function getOrganicRotation(index: number) {
  return { transform: `rotate(${organicRotations[index % organicRotations.length]})` };
}

/** Get an organic rotation class for a card */
export function getOrganicRotationClass(index: number) {
  return organicRotationClasses[index % organicRotationClasses.length];
}

/** Category display config */
export const categoryConfig: Record<string, { emoji: string; label: string }> = {
  food: { emoji: "\uD83C\uDF7D", label: "Food & Drinks" },
  nature: { emoji: "\uD83C\uDF3F", label: "Nature" },
  culture: { emoji: "\uD83C\uDFDB", label: "Culture" },
  nightlife: { emoji: "\uD83C\uDF19", label: "Nightlife" },
  shopping: { emoji: "\uD83D\uDECD", label: "Shopping" },
  accommodation: { emoji: "\uD83C\uDFE8", label: "Stay" },
  activity: { emoji: "\uD83C\uDFAF", label: "Activities" },
  transport: { emoji: "\uD83D\uDE97", label: "Transport" },
  other: { emoji: "\uD83D\uDCCD", label: "Other" },
};

/** Role display config */
export const roleConfig: Record<string, { icon: string; bg: string; text: string }> = {
  host: { icon: "\uD83D\uDC51", bg: "bg-tape-yellow", text: "text-ink" },
  editor: { icon: "\u270F\uFE0F", bg: "bg-tape-mint", text: "text-ink" },
  viewer: { icon: "\uD83D\uDC41", bg: "bg-paper-aged", text: "text-ink-medium" },
};
