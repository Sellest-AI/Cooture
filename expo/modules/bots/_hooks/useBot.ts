import { api, useAction, useMutation } from "@/lib/convex/client";
import { atom, useAtom } from "jotai";

export const useBot = () => { }

const identityAtom = atom<{
  name: string;
  email: string;
  displayName: string;
  username: string;
  firstName: string;
  lastName: string;
} | null>();

const appearanceAtom = atom<{
  gender: 'male' | 'female',
  size: "lean" | "average" | "athletic" | "muscular" | "heavy" | "heavyset",
  skinTone: "light" | "medium" | "dark",
  heightCm: number;
  age: number;
} | null>();

const imagesAtom = atom<{
  front?: { url?: string, base64?: string };
  smiling?: { url?: string, base64?: string };
  side?: { url?: string, base64?: string };
  profilePicture?: { url?: string, base64?: string };
} | null>();

const useNew = () => {
  const [identity, setIdentity] = useAtom(identityAtom);
  const [appearance, setAppearance] = useAtom(appearanceAtom);
  const [images, setImages] = useAtom(imagesAtom);

  const { mutate: createIdentity } = useMutation(api.router.admin.bots.createIdentity.admin);
  const { action: createBot } = useAction(api.router.admin.bots.createOne.admin);
  const { action: createFace } = useAction(api.llm.triggers.generateFace.admin);

  const generateIdentity = async () => {
    const result = await createIdentity();

    // Closest age bucket from CONFIG
    const age = CONFIG.ages.reduce((prev, curr) =>
      Math.abs(curr - result.age) < Math.abs(prev - result.age) ? curr : prev, CONFIG.ages[0]);

    // Closest height bucket from CONFIG
    const heightCm = CONFIG.heights.reduce((prev, curr) =>
      Math.abs(curr - result.heightCm) < Math.abs(prev - result.heightCm) ? curr : prev, CONFIG.heights[0]);

    setIdentity({
      email: result.email,
      name: result.name,
      username: result.username,
      displayName: result.displayName,
      firstName: result.firstName,
      lastName: result.lastName,
    })
    setAppearance((a) => ({
      age: age,
      gender: result.sex,
      size: result.size ?? a?.size ?? "average",
      skinTone: result.skinTone ?? a?.skinTone ?? "light",
      heightCm: heightCm,
    }))
  }

  const generateFace = async () => {
    if (!appearance) return;
    if (!identity) return;

    const result = await createFace({
      firstName: identity.firstName,
      lastName: identity.lastName,
      gender: appearance.gender,
      size: appearance.size,
      skinTone: appearance.skinTone,
      heightCm: appearance.heightCm,
      age: appearance.age,
    });

    setImages({
      front: result.images.find((i) => i.side === 'front'),
      smiling: result.images.find((i) => i.side === 'smiling'),
      side: result.images.find((i) => i.side === 'side'),
      profilePicture: result.images.find((i) => i.side === 'profile'),
    });
  }

  const reset = () => {
    setIdentity(null);
    setAppearance(null);
    setImages(null);
  }

  const createOne = async () => {
    if (!identity || !appearance || !images) return;

    const { skinTone, ...restAppearance } = appearance;

    await createBot({
      ...identity,
      ...restAppearance,
      images: {
        frontUrl: images.front?.url ?? images.front?.base64 ?? "",
        sideUrl: images.side?.url ?? images.side?.base64 ?? "",
        smileUrl: images.smiling?.url ?? images.smiling?.base64 ?? "",
        profileUrl: images.profilePicture?.url ?? images.profilePicture?.base64 ?? "",
      }
    });
  }

  return {
    images,
    identity,
    setIdentity,
    appearance,
    setAppearance,
    generateIdentity,
    generateFace,
    setImages,
    createOne,
    reset,
  }
}

const CONFIG = {
  sexes: ['male', 'female'] as const,
  ages: [18, 20, 22, 24, 27] as const,
  sizes: ['lean', 'average', 'athletic', 'muscular', 'heavy', 'heavyset'] as const,
  heights: [155, 160, 165, 170, 175, 180, 185, 195] as const,
  skinTones: ['light', 'medium', 'dark'] as const,
}

useBot.Config = CONFIG;
useBot.New = useNew;