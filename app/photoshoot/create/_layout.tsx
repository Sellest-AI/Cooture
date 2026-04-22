import { ROUTES, useRoute, useRouter } from "@/hooks";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { ArrowLeft, X } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { SafeAreaView } from "@ui/safe-area-view";
import { Skeleton } from "@ui/skeleton";
import { Stepper } from "@ui/stepper";
import { Text } from "@ui/text";
import { router, Slot } from "expo-router";
import { MotiView } from "moti";
import { Platform, View } from "react-native";
import { Colors } from "theme";

const getHeader = (path: string): {
  title: string;
  subtitle: string;
  showBackButton: boolean;
  step: 1 | 2 | 3 | 4;
  stepName: 'preset' | 'outfit' | 'friend' | 'recap';
} => {
  if (path.includes(ROUTES.PHOTOSHOOT.RECAP)) {
    return {
      title: "Recap",
      subtitle: "Make sure everything is correct.",
      showBackButton: true,
      step: 3,
      stepName: 'recap',
    }
  }
  if (path.includes(ROUTES.PHOTOSHOOT.OUTFIT)) {
    return {
      title: "Outfit",
      subtitle: "Choose your style.",
      showBackButton: true,
      step: 2,
      stepName: 'outfit',
    }
  }
  return {
    title: "Preset",
    subtitle: "Select an environment.",
    showBackButton: false,
    step: 1,
    stepName: 'preset',
  }
}

const getPreviousPath = (path: string) => {
  if (path.includes(ROUTES.PHOTOSHOOT.RECAP)) return ROUTES.PHOTOSHOOT.OUTFIT;
  if (path.includes(ROUTES.PHOTOSHOOT.OUTFIT)) return ROUTES.PHOTOSHOOT.NEW;
  return null;
};

export default function Layout() {
  const { setOutfitId, setPresetId, setFriendId, reset, preset } = usePhotoshoot.New();
  const { initialized } = useRoute(ROUTES.PHOTOSHOOT.NEW, {
    resetFnc: reset,
    onUpdate: ({ outfitId, presetId, userId }) => {
      if (outfitId === null) setOutfitId(null);
      if (presetId === null) setPresetId(null);
      if (userId === null) setFriendId(null);
      if (outfitId) setOutfitId(outfitId)
      if (presetId) setPresetId(presetId)
      if (userId) setFriendId(userId);
    }
  });

  const { pathname, previousPathname } = useRouter.Path();
  const path = pathname.startsWith(ROUTES.PHOTOSHOOT.NEW) ? pathname : (previousPathname ?? pathname);
  const { dismissTo } = useRouter();

  const { title, subtitle, step, stepName } = getHeader(path);
  const isRecap = stepName === 'recap';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={{ bottom: 'android', top: 'off' }}
    >
      <ParallaxScrollView
        scrollKey={step}
        locked={isRecap ? false : true}
        headerBackground={isRecap ? <Image
          source={preset?.cover?.sizes.large.url}
          style={{ flex: 1, opacity: 0.2 }}
        /> : undefined}
        headerContent={
          <View style={{ marginBottom: 4, flex: 1 }}>
            <View style={{ padding: 12, paddingTop: Platform.OS === 'ios' ? 0 : 12 }}>
              <ModalHeader
                title={title}
                subtitle={subtitle}
                type="alt"
                onBack={() => {
                  const previousPath = getPreviousPath(path);
                  if (previousPath) dismissTo(previousPath, { resetNextRoute: false });
                  else if (router.canGoBack()) router.back();
                }}
                customBackIcon={step === 1 ? X : undefined}
              />
              <Stepper
                style={{ width: "90%", maxWidth: 280, alignSelf: 'center', marginTop: 12, paddingBottom: 2 }}
                // steps={hasMultipleSubjects ? 4: 3}
                steps={3}
                value={step}
              />
            </View>
            {(isRecap) && <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: 8,
              marginTop: 32,
            }}
            >
              <Badge
                source={preset?.cover?.sizes.small.url}
                style={{ width: 112, height: 112, marginBottom: 16 }}
              />
              <Text.Base color={Colors.neutral[400]} weight={600}>Preset</Text.Base>
              {!preset ? <Skeleton style={{ height: 20, width: 148, marginTop: 4 }} /> :
                <Text.H4 color={Colors.foreground}>{preset.name}</Text.H4>}
              <Button
                onPress={() => dismissTo(ROUTES.PHOTOSHOOT.NEW, {
                  resetNextRoute: false,
                  redirectTo: ROUTES.PHOTOSHOOT.RECAP,
                })}
                variant="blur"
                style={{ marginTop: 20 }}
                startIcon={ArrowLeft}
                size="sm"
                align="center"
              >
                Change Preset
              </Button>
            </View>}
          </View>
        }
      >
        {initialized && <MotiView
          style={{ flex: 1 }}
          animate={{ opacity: 1, translateY: 0 }}
          from={{ opacity: 0, translateY: 50 }}
          transition={{ duration: 500, delay: 100 }}
        >
          <Slot />
        </MotiView>}
      </ParallaxScrollView>
    </SafeAreaView>
  )
}