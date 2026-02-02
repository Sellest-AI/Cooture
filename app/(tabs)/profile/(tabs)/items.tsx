import { api, useQueryCached } from "@/lib/convex/client";
import { EmptyBlock } from "@ui/block.empty";
import { LoadingBlock } from "@ui/block.loading";
import { CardItem } from "@ui/cards/card-item";
import { TShirtIcon } from "@ui/icons";
import { MasonryList } from "@ui/masonry-list";
import { router } from "expo-router";
import { View } from "react-native";
import { ROUTES } from "routes";

export default function ItemsScreen() {
  const { data } = useQueryCached(api.router.items.getAll.authed);

  if (!data) { return (<LoadingBlock />) }

  if (data.length === 0) {
    return (
      <EmptyBlock
        variant="secondary"
        style={{ paddingVertical: 72 }}
        icon={TShirtIcon}
        title="No Items Yet"
        description="You haven't added any items yet. Start scanning to see your items here."
        cta={{
          label: "Scan an item",
          onPress: () => router.push(ROUTES.TABS.NEW)
        }}
      />
    )
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
