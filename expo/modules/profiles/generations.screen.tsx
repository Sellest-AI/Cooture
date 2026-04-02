import { ROUTES, useRouter } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import { api, Id, useQueryCached } from "@/lib/convex/client";
import { EmptyBlock } from "@ui/block.empty";
import { LoadingBlock } from "@ui/block.loading";
import { ImageGeneration } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { EyeClosed, ImageIcon } from "@ui/icons";
import { View } from "react-native";
import { Colors } from "theme";
import { useProfileContext } from "./page";

const Item = ({ imageId, predictionId }: { imageId: Id<'images'>, predictionId: Id<'predictions'> }) => {
  const { data: image } = useQueryCached(api.router.storage.images.getOne.anon, { id: imageId });
  const { push } = useRouter();

  return (
    <ImageGeneration
      source={image?.sizes.medium.url}
      onPress={() => {
        push(ROUTES.POST.PATH, {
          pathParams: { id: predictionId }
        })
      }}
    />
  )
}

export function Screen() {
  const { user } = useAccount();
  const { push } = useRouter();
  const { userId } = useProfileContext();
  const { data: generations } = useQueryCached(api.router.generations.getAll.anon, { userId });

  const isOwnProfile = user?._id === userId;

  if (!generations) { return (<LoadingBlock />) }

  const predictions = generations.map((g) => g.predictions).flat()
    .filter((g) => !!g.imageId).filter((g) => g.status === "ACCEPTED");

  if (predictions.length === 0) {
    return (
      <EmptyBlock
        variant="secondary"
        style={{ paddingVertical: 72 }}
        icon={ImageIcon}
        title="No Generations Yet"
        description={!isOwnProfile ? "This user hasn't generated any images yet." :
          "You haven't generated any photoshoots yet. Start creating your AI looks to see them gathered here."}
        cta={isOwnProfile && {
          label: "New Photoshoot",
          onPress: () => push(ROUTES.PHOTOSHOOT.NEW)
        }}
      />
    )
  }

  return (
    <FlashList
      scrollEnabled={false}
      data={predictions}
      style={{ paddingHorizontal: 0 }}
      renderItem={({ item, index }) => {
        const marginLeft = index % 2 === 0 ? 0 : 4;
        const marginRight = index % 2 === 0 ? 4 : 0;

        if (!item.imageId) return null;

        return (
          <View style={{ marginBottom: 8, marginLeft, marginRight }}>
            <Item
              imageId={item.imageId}
              predictionId={item._id}
            />
            {item.status === "REJECTED" && <View style={{
              position: 'absolute',
              top: 12,
              right: 12,
              paddingHorizontal: 8,
              paddingVertical: 6,
              borderRadius: 10,
              backgroundColor: Colors.secondary[500],
            }}>
              <EyeClosed size={12} color={Colors.secondary[900]} />
            </View>}
          </View>
        )
      }}
      numColumns={2}
    />
  );
}
