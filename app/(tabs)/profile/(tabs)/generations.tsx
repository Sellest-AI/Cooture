import { ROUTES, useRouter } from "@/hooks";
import { api, useQuery } from "@/lib/convex/client";
import { ImageGeneration } from "@ui/cards";
import { EyeClosed } from "@ui/icons";
import { MasonryList } from "@ui/masonry-list";
import { View } from "react-native";
import { Colors } from "theme";

export default function GenerationsScreen() {
  const { push } = useRouter('/profile/generations');
  const { data: generations } = useQuery(api.router.generations.getAll.authed);

  if (!generations) return null;

  const predictions = generations.map((g) => g.predictions).flat();

  return (
    <MasonryList
      data={predictions.filter((g) => g.hasImage)}
      style={{ columnGap: 8, paddingHorizontal: 0 }}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={{ marginBottom: 8 }}>
          <ImageGeneration
            source={item.image?.sizes.medium.url}
            onPresss={() => {
              if (!item.generationId) return;
              push(ROUTES.PHOTOSHOOT.GENERATIONS.PATH, {
                pathParams: { id: item.generationId }
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
      )}
      numColumns={2}
    />
  );
}
