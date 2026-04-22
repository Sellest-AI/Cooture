import { useRoute } from "@/hooks";
import { api, useMutation } from "@/lib/convex/client";
import PickOutfitScreen from "@/modules/outfits/pick-outfit";
import { ModalHeader } from "@ui/modal";

export default function Screen() {
  const { canSkip, itemIds, redirectTo } = useRoute("/pick-outfit");
  const { mutate: update } = useMutation(api.router.outfits.editOne.authed);

  return <PickOutfitScreen
    currentPath="/pick-outfit"
    header={<ModalHeader title="Pick an outfit" />}
    canSkipText={canSkip ? 'Skip' : undefined}
    preSelectedItemIds={itemIds}
    redirectTo={redirectTo}
    onSelectOutfit={(outfit) => {
      if (itemIds && itemIds?.length > 0) {
        const items = Array.from(new Set([...outfit.itemIds, ...itemIds]));
        update({ outfitId: outfit._id, items });
      }
    }}
  />
}