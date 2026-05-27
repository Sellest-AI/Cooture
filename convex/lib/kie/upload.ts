import { env } from "../../env";
import { nanoid } from "../nanoid";

export const getExtensionFromBase64 = (base64: string): string | null => {
  const mimeMatch = /^data:(image\/[a-zA-Z]+);base64,/.exec(base64);
  return mimeMatch?.[1]?.split('/')[1] ?? null;
};

export const uploadImage = async (imageBase64: string) => {
  if (!env.KIE_API_KEY) throw new Error("KIE_API_KEY is not set");

  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${env.KIE_API_KEY}`);
  myHeaders.append("Content-Type", "application/json");

  const extension = getExtensionFromBase64(imageBase64);

  const raw = JSON.stringify({
    "base64Data": imageBase64,
    "uploadPath": "images/base64",
    "fileName": `${nanoid()}.${extension ?? 'png'}`
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow" as const
  };

  type Response = { data?: { downloadUrl?: string; } }
  const response = await fetch("https://kieai.redpandaai.co/api/file-base64-upload", requestOptions)
    .then((response) => response.json() as Response);

  if (!response.data?.downloadUrl) throw new Error("Failed to upload image");

  return response.data.downloadUrl;
}