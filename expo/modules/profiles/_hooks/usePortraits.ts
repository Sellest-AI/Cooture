import { api, useMutation, useQueryCached } from "@/lib/convex/client";
import { atom, useAtom } from "jotai";

export const usePortraits = () => {
  const { data: portraits, isPending } = useQueryCached(api.router.users.getPortraits.authed);

  return {
    isPending,
    frontImage: portraits?.frontImage,
    sideImage: portraits?.sideImage,
    smileImage: portraits?.smileImage,
  }
}

const frontImageAtom = atom<string | null>(null);
const sideImageAtom = atom<string | null>(null);
const smileImageAtom = atom<string | null>(null);

const usePortraitsLocal = () => {
  const [frontImage, setFrontImage] = useAtom(frontImageAtom);
  const [sideImage, setSideImage] = useAtom(sideImageAtom);
  const [smileImage, setSmileImage] = useAtom(smileImageAtom);

  const { mutate: pushToServer } = useMutation(api.router.users.updatePortraits.authed);

  return {
    frontImage,
    setFrontImage,
    sideImage,
    setSideImage,
    smileImage,
    setSmileImage,
    pushToServer
  }
}

usePortraits.Local = usePortraitsLocal;