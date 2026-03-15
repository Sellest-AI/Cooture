import { useAccount } from "@/lib/convex/auth";
import { api, useQueryCached } from "@/lib/convex/client";
import { EmptyBlock } from "@ui/block.empty";
import { LoadingBlock } from "@ui/block.loading";
import { CardItem } from "@ui/cards/card-item";
import { FlashList } from "@ui/flat-list";
import { TShirt } from "@ui/icons";
import { router } from "expo-router";
import { View } from "react-native";
import { ROUTES } from "routes";
import { useProfileContext } from "./page";

export function Screen() {
  const { user } = useAccount();
  const { userId } = useProfileContext();
  const { data } = useQueryCached(api.router.items.getFromUser.anon, { userId });

  const isOwnProfile = user?._id === userId;

  if (!data) { return (<LoadingBlock />) }

  if (data.length === 0) {
    return (
      <EmptyBlock
        variant="secondary"
        style={{ paddingVertical: 72 }}
        icon={TShirt}
        title="No Items Yet"
        description="You haven't added any items yet. Start scanning to see your items here."
        cta={isOwnProfile && {
          label: "Scan an item",
          onPress: () => router.push(ROUTES.TABS.NEW)
        }}
      />
    )
  }

  return (
    <FlashList
      data={data}
      scrollEnabled={false}
      renderItem={({ item }) => {
        return (
          <View style={{
            marginBottom: 36,
            marginLeft: 20,
            marginRight: 20,
            paddingTop: 3
          }}
          >
            <CardItem
              image={item.image}
              source={item.image.sizes.small.url}
              title={item.name}
              subtitle={item.category.toLowerCase()}
              onPress={() => router.push(ROUTES.ITEM.ID(item._id))}
            />
          </View>
        )
      }}
      numColumns={2}
      masonry
    />
  );
}
