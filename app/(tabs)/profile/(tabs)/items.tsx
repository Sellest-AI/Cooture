import { api, useQueryCached } from "@/lib/convex/client";
import { CardItem } from "@ui/cards/card-item";
import { LoadingBlock } from "@ui/loadingBlock";
import { MasonryList } from "@ui/masonry-list";
import { router } from "expo-router";
import { View } from "react-native";
import { ROUTES } from "routes";

export default function ItemsScreen() {
  const { data } = useQueryCached(api.router.items.getAll.authed);

  if (!data) {
    return (<LoadingBlock />)
  }

  return (
    <MasonryList
      data={data}
      style={{ columnGap: 48, paddingHorizontal: 12 }}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={{ marginBottom: 24, paddingTop: 3 }}>
          <CardItem
            source={item.image.sizes.small.url}
            title={item.name}
            subtitle={item.category.toLowerCase()}
            onPress={() => router.push(ROUTES.ITEM.ID(item._id))}
          />
        </View>
      )}
      numColumns={2}
    />
  );
}
