import { api, useQueryCachedData } from "@/lib/convex/client";
import { shuffleWithSeed } from "@utils/convex-allowed";
import { useState } from "react";
import { useSafety } from "../safety";
import { SharedScreen } from "./sharedScreen";

export const SearchDefaultScreen = () => {
  const { data: outfits } = useQueryCachedData(api.router.outfits.getLatest.anon, { key: 'latestOutfits' });
  const { data: items } = useQueryCachedData(api.router.items.getAll.authed, { key: "getAllItems" });

  const [date] = useState(new Date().getMinutes());
  const { isHidden } = useSafety();
  const outfitsData = shuffleWithSeed(outfits?.filter((o) => !isHidden({ outfit: o, itemIds: o.items.map((i) => i.itemId) })) ?? [], date);
  const itemsData = shuffleWithSeed(items?.filter((i) => !isHidden({ item: i })) ?? [], date);

  return (
    <SharedScreen
      outfits={outfitsData}
      items={itemsData}
    />
  )
}