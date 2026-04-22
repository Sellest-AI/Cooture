import { Route, ROUTES, useRoute, useRouter } from "@/hooks"
import { Button } from "@ui/button"
import { Image } from "@ui/image"
import { Modal } from "@ui/modal"
import { Text } from "@ui/text"
import { useCallback, useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Colors } from "theme"
import { useAppearance } from "../profiles/_hooks/useAppearance"

type Props = {
  currentPath: Route;
}
export const ModalAppearance = ({ currentPath }: Props) => {
  const { push } = useRouter(currentPath);
  const { isPending, hasFullAppearance } = useAppearance();
  const [open, setOpen] = useState(false);

  const checkStatus = useCallback(() => {
    if (isPending) return;
    if (!hasFullAppearance) setOpen(true);
  }, [isPending, hasFullAppearance]);

  useRoute(currentPath, { onUpdate: () => { checkStatus(); } });
  useEffect(() => { checkStatus(); }, [checkStatus])

  return (
    <Modal
      open={open}
      onOpenChange={hasFullAppearance ? () => setOpen(false) : undefined}
      header={{
        title: "Appearance",
        type: "alt",
        showBackButton: hasFullAppearance,
        customBackIcon: 'x'
      }}
    >
      <View>
        <View style={styles.imagesContainer}>
          <Image
            source={require('assets/placeholders/portraits/front-good.webp')}
            style={[styles.image, { transform: [{ rotate: '-5deg' }] }]}
          />
          <Image
            source={require('assets/placeholders/portraits/smile-good.jpg')}
            style={[styles.image, { zIndex: 1, marginLeft: -12, marginRight: -12, height: 148, width: 120, marginTop: -4 }]}
          />
          <Image
            source={require('assets/placeholders/portraits/side-good.png')}
            style={[styles.image, { transform: [{ rotate: '5deg' }] }]}
          />
        </View>
        <Text.Base color={Colors.neutral[200]} style={styles.text}>
          We need a few photos of you to match your appearance with your virtual avatar.
        </Text.Base>
        <Button
          variant="primary"
          onPress={() => {
            setOpen(false);
            push(ROUTES.EXTRA.AVATAR.PORTRAITS, {
              redirectTo: currentPath
            })
          }}
        >
          Open camera
        </Button>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  imagesContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 112,
    height: 140,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  text: {
    maxWidth: 280,
    marginTop: 24,
    marginBottom: 24,
    textAlign: 'center',
    marginHorizontal: 'auto'
  }
})