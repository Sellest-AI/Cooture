import { Router, ROUTES, useRouter } from "@/hooks";
import { Button } from "@ui/button";
import { Col, Grid, Row } from "@ui/grid";
import { Pencil } from "@ui/icons";
import { Image } from "@ui/image";
import { ViewStyle } from "react-native";
import { Colors } from "theme";
import { useAppearance } from "./_hooks/useAppearance";

export const Portrait = ({ style }: { style?: ViewStyle }) => {
  const { frontImage, sideImage, smileImage, isPending } = useAppearance();
  const { push } = useRouter(ROUTES.PHOTOSHOOT.RECAP);

  const HEIGHT = style?.height ?? 256;

  // Only redirect if we're certain there's no image (not during loading)
  if (!isPending && frontImage === null) return <Router.Redirect
    href={ROUTES.EXTRA.AVATAR.UPDATE_PORTRAITS}
    redirectTo={ROUTES.PHOTOSHOOT.RECAP}
  />

  return (
    <>
      <Grid style={{ width: '100%', ...style, height: HEIGHT }}>
        <Col style={{ height: HEIGHT, borderRadius: 64, backgroundColor: Colors.blur.medium }}>
          <Image
            source={frontImage?.sizes.large.url}
            style={{ borderRadius: 64, flex: 1, borderWidth: 1, borderColor: Colors.blur.medium }}
          />
        </Col>
        <Col style={{ height: HEIGHT, marginLeft: 12, minWidth: 120, width: 120 }}>
          <Row style={{ marginBottom: 12, borderRadius: 48, backgroundColor: Colors.blur.medium }}>
            <Image
              source={sideImage?.sizes.medium.url}
              style={{ borderRadius: 48, flex: 1, borderWidth: 1, borderColor: Colors.blur.medium }}
            />
          </Row>
          <Row style={{ borderRadius: 48, backgroundColor: Colors.blur.medium }}>
            <Image
              source={smileImage?.sizes.medium.url}
              style={{ borderRadius: 48, flex: 1, borderWidth: 1, borderColor: Colors.blur.medium }}
            />
          </Row>
        </Col>
      </Grid>
      <Button
        variant="blur"
        startIcon={Pencil}
        style={{ marginTop: 12 }}
        onPress={() => {
          push(ROUTES.EXTRA.AVATAR.UPDATE_PORTRAITS, {
            redirectHere: true
          })
        }}
      >
        Edit my portraits
      </Button>
    </>
  )
}