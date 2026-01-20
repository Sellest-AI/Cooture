export const addBase64Header = (base64: string, format: 'webp' | 'png') => {
  // check if base64 already includes the header
  if (base64.startsWith('data:image/')) { return base64; }
  if (base64.startsWith('http')) { return base64; }
  return `data:image/${format};base64,${base64}`;
}