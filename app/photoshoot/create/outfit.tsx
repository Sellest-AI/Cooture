import PickOutfitScreen from "@/modules/outfits/pick-outfit";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { ROUTES } from "routes";

export default function Screen() {
  const { outfitId, outfit } = usePhotoshoot.New();

  return <PickOutfitScreen
    currentPath={ROUTES.PHOTOSHOOT.OUTFIT}
    preSelectedOutfitId={outfitId ?? undefined}
    redirectTo={ROUTES.PHOTOSHOOT.RECAP}
    canSkipText="Use preset look"
    preSelectedItemIds={outfit?.items.map((item) => item._id)}
  />
}