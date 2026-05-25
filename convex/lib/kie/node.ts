'use node'
import { env } from "../../env";
import { sanitizeImageForReplicate } from "../replicate/node";
import { uploadImage } from "./upload";

type ImageModel = "bytedance/seedream-4" | "bytedance/seedream-4.5"

type PredictImageParams = {
  images: { url: string, hasAlpha: boolean }[];
  prompt: string;
  aspectRatio?: '3:4',
  model: ImageModel
}

export const predictImage = async (params: PredictImageParams) => {
  const { aspectRatio } = params;

  if (!env.KIE_API_KEY) throw new Error("KIE_API_KEY is not set");

  const imageUrls = await Promise.all(params.images.map(async (img) => {
    if (!img.hasAlpha) return img.url;
    const base64 = (await sanitizeImageForReplicate(img.url)).url;
    const url = await uploadImage(base64);
    return url;
  }));

  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${env.KIE_API_KEY}`);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    model: "seedream/4.5-edit",
    callBackUrl: `${env.CONVEX_SITE_URL}/api/kie/webhook`,
    input: {
      prompt: params.prompt.slice(0, 3000),
      image_urls: imageUrls,
      aspect_ratio: aspectRatio ?? '3:4',
      quality: "high",
      nsfw_checker: false
    }
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow" as const
  };

  type Response = { data: { taskId: string } }
  const response = await fetch("https://api.kie.ai/api/v1/jobs/createTask", requestOptions)
    .then((response) => response.json() as unknown as Response)

  if (!response.data?.taskId) throw new Error("Failed to create task");

  return { id: response.data.taskId };
}