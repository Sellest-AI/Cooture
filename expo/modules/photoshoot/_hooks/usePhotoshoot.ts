import { api, Id } from "@/lib/convex/api";
import { useMutation, useQuery, useQueryCached } from "@/lib/convex/client";
import { notEmpty } from "@utils/convex-allowed";
import { atom, useAtom } from "jotai";

export const usePhotoshoot = (id: Id<'generations'> | null) => {
  const { data: photoshoot } = useQuery(api.router.generations.getOne.authed, id ? { generationId: id } : 'skip');
  const { data: preset } = useQueryCached(api.router.presets.getOne.anon, photoshoot?.metadata?.presetId ? { presetId: photoshoot.metadata.presetId } : 'skip');

  const imageIds = photoshoot?.predictions.map((p) => p.imageId).filter(notEmpty);
  const { data: results } = useQueryCached(api.router.storage.images.getMany.anon, imageIds ? { imageIds } : 'skip');

  const { mutate } = useMutation(api.router.generations.updatePrediction.authed);
  const acceptPrediction = (predictionId: string) => {
    return mutate({ predictionId, status: 'ACCEPTED' });
  }
  const rejectPrediction = (predictionId: string) => {
    return mutate({ predictionId, status: 'REJECTED' });
  }

  return {
    results,
    photoshoot,
    preset,
    acceptPrediction,
    rejectPrediction,
  }
}

const outfitSizes = ['TIGHT', 'DEFAULT', 'LOOSE', 'EXTRA_LOOSE'] as const;
type Sizes = typeof outfitSizes[number];

const outfitSizeAtom = atom<Sizes>("DEFAULT");
const outfitAtom = atom<Id<"outfits"> | null>(null);
const presetAtom = atom<Id<"presets"> | null>(null);

const useNew = () => {
  const [outfitSize, setOutfitSize] = useAtom(outfitSizeAtom);
  const [outfitId, setOutfitId] = useAtom(outfitAtom);
  const [presetId, setPresetId] = useAtom(presetAtom);

  const { data: outfit } = useQuery(api.router.outfits.getOne.anon, outfitId ? { outfitId } : 'skip');
  const { data: preset } = useQueryCached(api.router.presets.getOne.anon, presetId ? { presetId } : 'skip');

  const reset = () => {
    setOutfitSize('DEFAULT');
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
    outfitSize,
    outfitSizes,
    setOutfitSize,
    reset,
  }
}

usePhotoshoot.New = useNew;