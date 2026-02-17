import { api, Doc, useMutation, useQueryCached } from "@/lib/convex/client";
import { atom, useAtom } from "jotai";

export const useAppearance = () => {
  const { data: appearance, isPending } = useQueryCached(api.router.users.getAppearance.authed);
  const { mutate } = useMutation(api.router.users.upsertAppearance.authed);

  const updateHeight = async (height: number) => {
    await mutate({ heightCm: height })
  }

  const updateSize = async (size: NonNullable<Doc<'usersAppearance'>['size']>) => {
    await mutate({ size })
  }

  return {
    isPending,
    frontImage: appearance?.frontImage,
    sideImage: appearance?.sideImage,
    smileImage: appearance?.smileImage,
    heightCm: appearance?.heightCm,
    size: appearance?.size,
    updateHeight,
    updateSize
  }
}

const frontImageAtom = atom<string | null>(null);
const sideImageAtom = atom<string | null>(null);
const smileImageAtom = atom<string | null>(null);

export const usePortraitsLocal = () => {
  const [frontImage, setFrontImage] = useAtom(frontImageAtom);
  const [sideImage, setSideImage] = useAtom(sideImageAtom);
  const [smileImage, setSmileImage] = useAtom(smileImageAtom);

  const { mutate: pushImagesToServer } = useMutation(api.router.users.upsertAppearance.authed);

  return {
    frontImage,
    setFrontImage,
    sideImage,
    setSideImage,
    smileImage,
    setSmileImage,
    pushImagesToServer
  }
}

useAppearance.LocalPortraits = usePortraitsLocal;