import { api, Id } from "@/lib/convex/api";
import { useQuery } from "@/lib/convex/client";

export const usePreset = (id: Id<'presets'>) => {
  const { data: preset, isPending } = useQuery(api.router.presets.getOne.anon, { presetId: id });

  return {
    preset,
    isPending
  };
}