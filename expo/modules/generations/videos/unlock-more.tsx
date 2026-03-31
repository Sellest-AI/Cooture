import { useAccount } from "@/lib/convex/auth";
import { api, Id, useAction, useQueryCached } from "@/lib/convex/client";
import { Button } from "@ui/button";
import { Lock } from "@ui/icons";
import { Image } from "@ui/image";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { View } from "react-native";
import { Colors } from "theme";

export const UnlockMore = ({ predictionId }: { predictionId: Id<'predictions'> }) => {
  const { data: cost } = useQueryCached(api.router.credits.getCost.anon, { type: "VIDEO_GENERATION_COST", amount: 1 });
  const { data: canPay } = useQueryCached(api.router.credits.canPay.authed, cost ? { amount: cost } : 'skip');
  const { isPremium } = useAccount();
  const disabled = isPremium ? !canPay : false;

  const { action, isLoading } = useAction(api.llm.triggers.generateVideo.authed);

  const { data: generation } = useQueryCached(api.router.generations.getFromPrediction.authed, { id: predictionId });
  const prediction = generation?.predictions.find(p => p._id === predictionId);

  const { data: image } = useQueryCached(api.router.storage.images.getOne.anon, prediction?.imageId ? { id: prediction.imageId } : 'skip');

  return (
    <View style={{
      flex: 1,
      width: '100%',
    }}>
      <Pressable
        disabled={disabled}
        animated={disabled}
        style={{
          backgroundColor: Colors.blur.darkest,
          borderColor: Colors.blur.medium,
          borderTopWidth: 2,
          borderLeftWidth: 1,
          borderRadius: 24,
          aspectRatio: 3 / 4,
          width: '100%',
          overflow: 'hidden',
          opacity: disabled ? 0.4 : 1,
        }}>
        <Image
          style={{ position: 'absolute', inset: 0, opacity: 0.4 }}
          source={image?.sizes.small.url ?? require('assets/backgrounds/dark-gradient.png')}
          contentFit="cover"
          contentPosition="center"
          blurRadius={20}
        />
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}>
          <Text.H3 color={Colors.primary[500]} style={{ maxWidth: '65%', textAlign: 'center' }}>
            Unlock
          </Text.H3>
          <Text.Lg color={Colors.neutral[50]} weight={600}
            style={{
              maxWidth: '60%',
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            Generate one more video for {cost} credit{cost && cost > 1 ? 's' : ''}.
          </Text.Lg>
          <Button
            variant="primary"
            style={{ marginTop: 32 }}
            align="center"
            startIcon={Lock}
            isLoading={isLoading}
            disabled={generation?.status === 'LOADING' || !prediction}
            onPress={async () => {
              if (!prediction) return;

              await action({
                predictionId: prediction._id,
              })
            }}
          >
            Unlock
          </Button>
        </View>
      </Pressable>
      <View style={{
        marginTop: 8,
        paddingHorizontal: 8,
        justifyContent: 'space-between',
        flexDirection: 'row',
      }}>
        <Text.Sm color={Colors.neutral[400]} style={{
          transform: [{ scale: 1.2 }],
          transformOrigin: 'left top',
        }}>
          Locked
        </Text.Sm>
        <Lock size={18} color={Colors.primary[500]} />
      </View>
    </View>
  )
}