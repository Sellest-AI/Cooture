import { nanoid, ZodNanoID } from "zod";
import { addBase64Header } from "./add-base64-header";

export function base64ToFile(base64String: string, filename: string | ZodNanoID = nanoid()) {
  const base64Sanitized = addBase64Header(base64String, 'png');
  // Split the base64 string into the metadata (MIME type) and the actual data
  const [header, base64Data] = base64Sanitized.split(',');

  // Extract the MIME type from the header
  const mimeType = header?.split(':')[1]?.split(';')[0] ?? 'image/png';
  const extension = mimeType.split('/')[1];

  if (!base64Data) throw new Error('Invalid base64 string');

  // Decode the base64 data into binary data
  const byteCharacters = atob(base64Data);

  // Create an array to store the byte data
  const byteArrays = [];

  // Convert the byte characters into an array of bytes
  for (let offset = 0; offset < byteCharacters.length; offset++) {
    const byte = byteCharacters.charCodeAt(offset);
    byteArrays.push(byte);
  }

  // Create a Blob from the byte array
  const byteArray = new Uint8Array(byteArrays);
  const blob = new Blob([byteArray], { type: mimeType }); // Use the dynamically extracted MIME type

  // Create a File object from the Blob
  const file = new File([blob], `${filename}.${extension}`, { type: mimeType });

  return file;
}
