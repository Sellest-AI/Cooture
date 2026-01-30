import { api, useQueryCached } from "@/lib/convex/client";
import { Collection } from "@ui/cards";
import { LoadingBlock } from "@ui/loadingBlock";
import { MasonryList } from "@ui/masonry-list";
import { router } from "expo-router";
import { View } from "react-native";
import { ROUTES } from "routes";

export default function OutfitsScreen() {
  const { data: outfits } = useQueryCached(api.router.outfits.getAll.authed);

  if (!outfits) {
    return (<LoadingBlock />)
  }

  return (
    <MasonryList
      data={outfits}
      style={{ columnGap: 48, paddingHorizontal: 12 }}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={{ marginBottom: 24, paddingTop: 3 }}>
          <Collection
            source={item.cover.sizes.small.url}
            contentFit="contain"
            title={item.name}
            subtitle={`${item.items.length} items`}
            onPress={() => router.push(ROUTES.OUTFIT.ID(item._id))}
          />
        </View>
      )}
      numColumns={2}
    />
  );
}
