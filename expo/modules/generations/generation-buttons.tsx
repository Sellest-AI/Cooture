import { downloadImageCrossPlatform } from "@/lib/image/client";
import { downloadVideo } from "@/lib/video";
import { Block } from "@ui/block";
import { Button, BUTTON_HEIGHT } from "@ui/button";
import { Check, HeartIcon, Loader, X } from "@ui/icons";
import { AnimatePresence, MotiView } from "@ui/motion";
import { useSafeAreaInsets } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { useToasts } from "@ui/toast";
import { Platform, View } from "react-native";
import { Colors } from "theme";

type Generation = {
  _id: string,
  imageUrl?: string,
  videoUrl?: string,
  status: string,
}

type Props = {
  onNext: (validated: boolean) => void;
  currentItem: Generation | undefined;
  items: Generation[];
}
export const GenerationButtons = ({ onNext, currentItem, items }: Props) => {
  const { addToast, removeToast } = useToasts();

  const isCurrentLoading = currentItem?.status === 'LOADING';
  const processed = items.filter((i) => i.status !== 'LOADING').length;
  const loading = items.filter((i) => i.status === 'LOADING').length;

  const { bottom: _bottom } = useSafeAreaInsets();
  const bottom = Platform.OS === 'ios' ? 0 : _bottom;

  return (
    <View style={{ height: bottom + 48 + BUTTON_HEIGHT }}>
      <AnimatePresence>
        {currentItem && <MotiView
          key="buttons"
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 20 }}
        >
          <View
            style={{
              paddingBottom: bottom + 28,
              alignItems: 'center',
            }}>
            {isCurrentLoading && <Block
              variant="blur"
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 12,
                paddingHorizontal: 24,
                borderRadius: 99,
                gap: 12,
              }}
            >
              <Loader color={Colors.primary[500]} />
              <Text.Base color={Colors.neutral[50]}>
                Please be patient...
              </Text.Base>
              <Text.Sm color={Colors.neutral[400]} weight={600} style={{ marginLeft: 12 }}>
                {Math.min(processed + 1, processed + loading)} / {processed + loading}
              </Text.Sm>
            </Block>}
            {!isCurrentLoading && <View style={{
              flexDirection: 'row',
              gap: 12,
            }}
            >
              <Button
                variant="blur"
                startIcon={X}
                onPress={() => {
                  if (!currentItem) return;
                  onNext(false);
                }}
              >
                Archive
              </Button>
              <Button
                variant="primary"
                startIcon={HeartIcon}
                onPress={async () => {
                  const hasMedia = !!currentItem?.imageUrl || !!currentItem?.videoUrl;
                  if (!currentItem || !hasMedia) return;
                  try {
                    if (currentItem.videoUrl) {
                      const key = addToast({
                        title: 'Saving video to your gallery',
                        type: 'default',
                        durationS: 10,
                        icon: Loader
                      });
                      downloadVideo(currentItem.videoUrl)
                        .then(() => {
                          addToast({
                            title: 'Video saved to your gallery',
                            type: 'success',
                            durationS: 3,
                            icon: Check
                          });
                          removeToast(key);
                        }).catch(() => null);
                    } else if (currentItem.imageUrl) {
                      const key = addToast({
                        title: 'Saving image to your gallery',
                        type: 'default',
                        durationS: 10,
                        icon: Loader
                      });
                      downloadImageCrossPlatform(currentItem.imageUrl, { applyWatermark: true })
                        .then(() => {
                          addToast({
                            title: 'Image saved to your gallery',
                            type: 'success',
                            durationS: 3,
                            icon: Check,
                          })
                          removeToast(key);
                        })
                        .catch(() => null);
                    }
                  } catch { }
                  onNext(true);
                }}
              >
                Save
              </Button>
            </View>}
          </View>
        </MotiView>}
      </AnimatePresence>
    </View>
  )
}
