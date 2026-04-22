import { Router, ROUTES, useRouter } from "@/hooks";
import { Button } from "@ui/button";
import { Col, Grid } from "@ui/grid";
import { Image } from "@ui/image";
import { Text } from "@ui/text";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { useAppearance } from "./_hooks/useAppearance";

export const Portrait = ({ style }: { style?: ViewStyle }) => {
  const { frontImage, sideImage, smileImage, isPending } = useAppearance();
  const { push } = useRouter(ROUTES.PHOTOSHOOT.RECAP);

  const HEIGHT = 124;

  // Only redirect if we're certain there's no image (not during loading)
  if (!isPending && frontImage === null) return <Router.Redirect
    href={ROUTES.EXTRA.AVATAR.PORTRAITS}
    redirectTo={ROUTES.PHOTOSHOOT.RECAP}
  />

  return (
    <View style={style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text.H4 color={Colors.neutral[50]}>Apearance</Text.H4>
          <Text.Base color={Colors.neutral[400]} style={{ marginTop: 4 }}>
            Make sure it&apos;s up to date.
          </Text.Base>
        </View>
        <Button
          variant="blur"
          size="sm"
          onPress={() => {
            push(ROUTES.EXTRA.AVATAR.PORTRAITS, {
              redirectHere: true
            })
          }}
        >
          Update
        </Button>
      </View>
      <Grid style={{ width: '100%', height: HEIGHT, marginTop: 20 }}>
        <Col style={{ height: HEIGHT, borderRadius: 48, backgroundColor: Colors.blur.medium }}>
          <Image
            source={frontImage?.sizes.large.url}
            style={{ borderRadius: 48, flex: 1, borderWidth: 1, borderColor: Colors.blur.medium }}
          />
        </Col>
        <Col style={{ height: HEIGHT, marginLeft: 12, minWidth: 86, width: 86 }}>
          <Image
            source={sideImage?.sizes.medium.url}
            style={{ borderRadius: 48, flex: 1, borderWidth: 1, borderColor: Colors.blur.medium }}
          />
        </Col>
        <Col style={{ height: HEIGHT, marginLeft: 12, minWidth: 86, width: 86 }}>
          <Image
            source={smileImage?.sizes.medium.url}
            style={{ borderRadius: 48, flex: 1, borderWidth: 1, borderColor: Colors.blur.medium }}
          />
        </Col>
      </Grid>
    </View>
  )
}