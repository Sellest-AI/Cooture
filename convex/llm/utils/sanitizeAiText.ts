export const sanitizeAiText = (t: string) => {
  return t.trim()
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold markdown **text**
    .replace(/#{1,6}\s+/g, '')           // Remove heading markers ### 
    .replace(/^[-•]\s+/gm, '')           // Remove bullet points at line start
    .replace(/^\d+\.\s+/gm, '')          // Remove numbered lists
    .replace(/\n{3,}/g, '\n\n')          // Reduce multiple line breaks to max 2
    .replace(/\*\*/g, '')                // Remove any remaining **
    .replace(/\s+\n/g, '\n')             // Clean up spaces before line breaks
    .replace(/\n\s+/g, '\n')             // Clean up spaces after line breaks
    .trim();
}