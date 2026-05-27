import { v } from "convex/values";

const CONTENT_RATINGS_C = ["SAFE", "SUGGESTIVE", "EXPLICIT", "NSFW"] as const;

export const CONTENT_RATINGS = v.union(
  ...CONTENT_RATINGS_C.map(v.literal)
)

export const CONTENT_RATINGS_ORDER = CONTENT_RATINGS_C.reduce((acc, rating, index) => {
  acc[rating] = index;
  return acc;
}, {} as Record<typeof CONTENT_RATINGS_C[number], number>)

export const ITEM_STYLES = [
  "CASUAL",
  "FORMAL",
  "SPORTY",
  "VINTAGE",
  "BOHO",
  "EDGY",
  "CHIC",
  "PREPPY",
  "GOTHIC",
  "MINIMALIST",
  "ECLECTIC",
  "Y2K",
  "STREETWEAR",
  "UTILITARIAN",
  "ROMANTIC",
  "TECHWEAR",
  "MAXIMALIST",
] as const;

export const OUTFIT_PALETTES = [
  { name: 'Deep Autumn', colors: ['#984058', '#F9F9F9', '#222222'] },
  { name: 'Olive Core', colors: ['#7C965A', '#E8D0B3'] },
  { name: 'Brown & Black', colors: ['#8B6244', '#222222'] },
  { name: 'Brown & Yellow', colors: ['#8B6244', '#F4C95D'] },
  { name: 'Brown & Olive', colors: ['#8B6244', '#7C965A'] },
  { name: 'Navy & Brown', colors: ['#214365', '#8B6244'] },
  { name: 'Navy & Beige', colors: ['#214365', '#E8D0B3'] },
  { name: 'Navy & Red', colors: ['#214365', '#D15E5E'] },
  { name: 'Gray & Blue', colors: ['#939CA5', '#5F8EBE'] },
  { name: 'Charcoal Mono', colors: ['#465359', '#F9F9F9', '#222222'] },
  { name: 'Black & Beige', colors: ['#222222', '#E8D0B3'] },
  { name: 'Black & White', colors: ['#222222', '#F9F9F9'] },
  { name: 'Blush & White', colors: ['#F3C5C5', '#F9F9F9'] },
  { name: 'Blush & Gray', colors: ['#F3C5C5', '#939CA5'] },
  { name: 'Navy & Forest', colors: ['#214365', '#4A7C59'] },
  { name: 'Navy & Rust', colors: ['#214365', '#D97746'] },
  { name: 'Beige & White', colors: ['#E8D0B3', '#F9F9F9'] },
  { name: 'Forest & Black', colors: ['#4A7C59', '#222222'] },
  { name: 'Lavender & Gray', colors: ['#8A7B9B', '#939CA5'] },
  { name: 'Lavender & Black', colors: ['#8A7B9B', '#222222'] },
  { name: 'Rust & Brown', colors: ['#D97746', '#8B6244'] },
  { name: 'Burgundy & Beige', colors: ['#984058', '#E8D0B3'] },
];