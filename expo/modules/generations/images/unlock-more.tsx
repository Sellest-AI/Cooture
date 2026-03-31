import { ROUTES, useRouter } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import { api, Id, useAction, useQueryCached } from "@/lib/convex/client";
import { Button } from "@ui/button";
import { Lock } from "@ui/icons";
import { Image } from "@ui/image";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Colors } from "theme";
import { usePhotoshoot } from "../../photoshoot/_hooks/usePhotoshoot";

export const UnlockMore = () => {
  const { push } = useRouter();
  const { id } = useLocalSearchParams<{ id: Id<'generations'> }>();
  const { preset, photoshoot } = usePhotoshoot(id);

  const { data: cost } = useQueryCached(api.router.credits.getCost.anon, { type: "IMAGE_GENERATION_COST", amount: 1 });
  const { data: canPay } = useQueryCached(api.router.credits.canPay.authed, cost ? { amount: cost } : 'skip');

  const { isPremium } = useAccount();

  const disabled = isPremium ? !canPay : false;

  const { outfitSize } = usePhotoshoot.New();
  const { action, isLoading } = useAction(api.llm.triggers.photoshoot.authed);

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
          source={preset?.cover?.sizes.large.url ?? require('assets/backgrounds/dark-gradient.png')}
          contentFit="cover"
          contentPosition="center"
          blurRadius={20}
        />
        {isPremium && <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}>
          <Text.H3 color={Colors.primary[500]} style={{ maxWidth: '65%', textAlign: 'center' }}>
            Unlock
          </Text.H3>
          <Text.Lg color={Colors.neutral[50]} weight={600}
            style={{
              maxWidth: '55%',
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            Get access to this image for {cost} credits
          </Text.Lg>
          <Button
            variant="primary"
            style={{ marginTop: 32 }}
            align="center"
            startIcon={Lock}
            isLoading={isLoading}
            onPress={async () => {
              if (!preset) return;
              if (!photoshoot) return;

              const friendId = photoshoot.userIds?.find((id) => id !== photoshoot.userId) ?? null;
              const outfitId = photoshoot.outfitId;

              await action({
                generationId: photoshoot._id,
                presetId: preset._id,
                numberToGenerate: 1,
                extraUserIds: friendId ? [friendId] : undefined,
                outfit: outfitId ? {
                  _id: outfitId,
                  size: outfitSize
                } : undefined,
              });
            }}
          >
            Unlock
          </Button>
        </View>}
        {!isPremium && <View style={{
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
            Get access to this image and way more
          </Text.Lg>
          <Button
            variant="primary"
            style={{ marginTop: 32 }}
            align="center"
            startIcon={Lock}
            onPress={() => push(ROUTES.MODALS.UPGRADE)}
          >
            Unlock
          </Button>
        </View>}
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