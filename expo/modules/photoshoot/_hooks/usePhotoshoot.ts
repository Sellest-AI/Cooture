import { api, Id } from "@/lib/convex/api";
import { useQuery } from "@/lib/convex/client";
import { atom, useAtom } from "jotai";

export const usePhotoshoot = () => {

}

const outfitAtom = atom<Id<"outfits"> | null>(null);

const useNew = () => {
  const [outfitId, setOutfitId] = useAtom(outfitAtom);

  const { data: outfit } = useQuery(api.router.outfits.getOne.anon, outfitId ? { outfitId } : 'skip');

  return {
    outfit,
    outfitId,
    setOutfitId,
  }
}

usePhotoshoot.New = useNew;