export const sliceText = <T extends string | undefined>(text: T, maxLength: number): T => {
  if (!text) return text;
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + "..." as T;
}