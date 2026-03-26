import { useAccount } from "@/lib/convex/auth";
import { api, useQueryCached } from "@/lib/convex/client";
import { EmptyBlock } from "@ui/block.empty";
import { LoadingBlock } from "@ui/block.loading";
import { Collection } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { HoodieIcon } from "@ui/icons";
import { router } from "expo-router";
import { View } from "react-native";
import { ROUTES } from "routes";
import { useProfileContext } from "./page";

export function Screen() {
  const { user } = useAccount();
  const { userId } = useProfileContext();
  const { data: outfits } = useQueryCached(api.router.outfits.getFromUser.anon, { userId });

  const isOwnProfile = user?._id === userId;

  if (!outfits) { return (<LoadingBlock />) }

  if (outfits.length === 0) {
    return (
      <EmptyBlock
        variant="secondary"
        style={{ paddingVertical: 72 }}
        icon={HoodieIcon}
        title="No Outfits Yet"
        description="You haven't created any outfits yet. Start mixing and matching to see your creations appear here."
        cta={isOwnProfile && {
          label: "Create an outfit",
          onPress: () => router.push(ROUTES.MODALS.NEW_OUTFIT)
        }}
      />
    )
  }

  return (
    <FlashList
      data={outfits}
      scrollEnabled={false}
      style={{ paddingHorizontal: 12 }}
      renderItem={({ item, index }) => {
        const marginLeft = index % 2 === 0 ? 6 : 20;
        const marginRight = index % 2 === 0 ? 20 : 6;
        return (
          <View style={{ marginBottom: 24, marginLeft, marginRight, paddingTop: 3 }}>
            <Collection
              backgroundColor={item.backgroundColor}
              source={item.cover.sizes.small.url}
              contentFit="contain"
              title={item.name}
              subtitle={`${item.items.length} items`}
              onPress={() => router.push(ROUTES.OUTFIT.ID(item._id))}
            />
          </View>
        )
      }}
      numColumns={2}
    />
  );
}
