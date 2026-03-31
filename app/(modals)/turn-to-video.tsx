import { ROUTES, useRoute } from "@/hooks";
import { api, useAction, useQuery, useQueryCached } from "@/lib/convex/client";
import { ButtonSlider } from "@ui/button.slider";
import { Clapperboard, Credits } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { View } from "react-native";
import { Colors } from "theme";

const numberToGenerate = 1;

export default function Screen() {
  const { data: cost } = useQueryCached(api.router.credits.getCost.anon, { type: 'VIDEO_GENERATION_COST', amount: numberToGenerate });
  const { data: canPay } = useQueryCached(api.router.credits.canPay.authed, cost ? { amount: cost } : 'skip');

  const { predictionId } = useRoute(ROUTES.MODALS.TURN_TO_VIDEO);
  const { data } = useQuery(api.router.generations.getFromPrediction.anon, { id: predictionId });

  const imageId = data?.predictions.filter((p) => p._id === predictionId)[0]?.imageId;
  const { data: image } = useQueryCached(api.router.storage.images.getOne.anon, imageId ? { id: imageId } : 'skip');

  const { action, isLoading } = useAction(api.llm.triggers.generateVideo.authed);

  return (
    <View
      style={{ padding: 12, flex: 1 }}
    >
      <ModalHeader
        title="Turn to Video"
        subtitle="Bring your creation to life"
        onBack={router.canGoBack() ? router.back : undefined}
        style={{ marginBottom: 20 }}
      />
      {!image && <Skeleton
        style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: 28 }}
      />}
      {image && <Image
        source={image?.sizes.large.url}
        style={{
          width: '100%',
          aspectRatio: 3 / 4,
          borderRadius: 28
        }}
      />}
      <View style={{
        flex: 1,
        justifyContent: 'flex-end',
        paddingTop: 24,
      }}>
        <ButtonSlider
          startIcon={Clapperboard}
          disabled={isLoading}
          onComplete={async () => {
            if (!canPay) {
              router.push(ROUTES.MODALS.UPGRADE);
              return;
            }

            const generationId = await action({ predictionId });
            router.dismissTo(ROUTES.GENERATIONS.VIDEO.ID(generationId));
          }}
        >
          Generate video
        </ButtonSlider>
        <View style={{
          gap: 4,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 12,
        }}>
          {cost && <Text.Sm
            style={{
              textAlign: 'center',
              maxWidth: 172,
            }}
            color={Colors.neutral[400]}
          >
            You will generate {numberToGenerate} video{numberToGenerate > 1 ? 's' : ''} for
          </Text.Sm>}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Credits size={12} />
            <Text.Base
              color={Colors.primary[200]} weight={600}
              style={{ marginLeft: 2 }}
            >
              {cost}
            </Text.Base>
          </View>
        </View>
      </View>
    </View>
  )
}