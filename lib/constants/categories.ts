export const CHALLENGE_CATEGORIES = [
  { value: "editing", labelKey: "categories.editing" },
  { value: "coding", labelKey: "categories.coding" },
  { value: "automation", labelKey: "categories.automation" },
  { value: "design", labelKey: "categories.design" },
  { value: "other", labelKey: "categories.other" },
] as const;

export type ChallengeCategory = (typeof CHALLENGE_CATEGORIES)[number]["value"];