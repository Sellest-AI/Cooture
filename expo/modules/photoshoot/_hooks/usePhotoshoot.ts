import { api, Id } from "@/lib/convex/api";
import { useMutation, useQuery } from "@/lib/convex/client";
import { atom, useAtom } from "jotai";

export const usePhotoshoot = (id: Id<'generations'> | null) => {
  const { data: photoshoot } = useQuery(api.router.generations.getOne.authed, id ? { generationId: id } : 'skip');
  const { data: preset } = useQuery(api.router.presets.getOne.anon, photoshoot?.metadata?.presetId ? { presetId: photoshoot.metadata.presetId } : 'skip');

  const { mutate } = useMutation(api.router.generations.updatePrediction.authed);
  const acceptPrediction = (predictionId: string) => {
    return mutate({ predictionId, status: 'ACCEPTED' });
  }
  const rejectPrediction = (predictionId: string) => {
    return mutate({ predictionId, status: 'REJECTED' });
  }

  return {
    photoshoot,
    preset,
    acceptPrediction,
    rejectPrediction,
  }
}

const outfitAtom = atom<Id<"outfits"> | null>(null);
const presetAtom = atom<Id<"presets"> | null>(null);

const useNew = () => {
  const [outfitId, setOutfitId] = useAtom(outfitAtom);
  const [presetId, setPresetId] = useAtom(presetAtom);

  const { data: outfit } = useQuery(api.router.outfits.getOne.anon, outfitId ? { outfitId } : 'skip');
  const { data: preset } = useQuery(api.router.presets.getOne.anon, presetId ? { presetId } : 'skip');

  const reset = () => {
    setOutfitId(null);
    setPresetId(null);
  }

  return {
    outfit,
    outfitId,
    setOutfitId,
    preset,
    presetId,
    setPresetId,
    reset,
  }
}

usePhotoshoot.New = useNew;