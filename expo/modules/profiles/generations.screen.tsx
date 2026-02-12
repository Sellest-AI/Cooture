import { ROUTES, useRouter } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import { api, useQuery } from "@/lib/convex/client";
import { EmptyBlock } from "@ui/block.empty";
import { LoadingBlock } from "@ui/block.loading";
import { ImageGeneration } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { EyeClosed, ImageIcon } from "@ui/icons";
import { View } from "react-native";
import { Colors } from "theme";
import { useProfileContext } from "./page";

export function Screen() {
  const { user } = useAccount();
  const { push } = useRouter();
  const { userId } = useProfileContext();
  const { data: generations } = useQuery(api.router.generations.getAll.anon, { userId });

  const isOwnProfile = user?._id === userId;

  if (!generations) { return (<LoadingBlock />) }

  const predictions = generations.map((g) => g.predictions).flat()
    .filter((g) => g.hasImage).filter((g) => g.status === "ACCEPTED");

  if (predictions.length === 0) {
    return (
      <EmptyBlock
        variant="secondary"
        style={{ paddingVertical: 72 }}
        icon={ImageIcon}
        title="No Generations Yet"
        description="You haven't generated any images yet. Start creating to see your generations here."
        cta={isOwnProfile && {
          label: "New Photoshoot",
          onPress: () => push(ROUTES.PHOTOSHOOT.NEW)
        }}
      />
    )
  }

  return (
    <FlashList
      data={predictions}
      style={{ paddingHorizontal: 0 }}
      renderItem={({ item, index }) => {
        const marginLeft = index % 2 === 0 ? 0 : 4;
        const marginRight = index % 2 === 0 ? 4 : 0;
        return (
          <View style={{ marginBottom: 8, marginLeft, marginRight }}>
            <ImageGeneration
              source={item.image?.sizes.medium.url}
              onPresss={() => {
                if (!item.generationId) return;
                // push(ROUTES.PHOTOSHOOT.GENERATIONS.PATH, {
                //   pathParams: { id: item.generationId }
                // })
                push(ROUTES.POST.PATH, {
                  pathParams: { id: item._id }
                })
              }}
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
