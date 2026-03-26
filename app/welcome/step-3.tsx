import { Button } from '@ui/button';
import { Col, Grid, Row } from '@ui/grid';
import { Image } from '@ui/image';
import { useSafeAreaInsets } from '@ui/safe-area-view';
import { Text } from '@ui/text';
import { router } from 'expo-router';
import { Dimensions, View } from 'react-native';
import { ROUTES } from 'routes';
import { Colors } from 'theme';

export default function Screen() {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        marginTop: 128 + top,
        padding: 8,
      }}
    >
      <View style={{ maxWidth: 456, width: '100%', flex: 1, marginBottom: 28 }}>
        <View style={{ flex: 1 }}>
          <Text.H3
            style={{
              marginInline: 'auto',
              textBalance: true,
              textAlign: 'center',
              color: Colors.foreground,
              marginBottom: 16,
              maxWidth: 224
            }}
          >
            Every version of you
          </Text.H3>
          <Text.Lg
            style={{
              textBalance: true,
              textAlign: 'center',
              color: Colors.neutral[400],
              maxWidth: 320,
              marginInline: 'auto',
              marginBottom: 32,
            }}
          >
            Find your next era.
          </Text.Lg>
          <View style={{
            flex: 1,
            justifyContent: 'center',
          }}>
            <Grid
              style={{
                flex: 1,
                height: Dimensions.get('screen').height - 56 - 328,
                width: '100%',
                paddingHorizontal: 8,
                gap: 8
              }}
            >
              <Col style={{ gap: 8 }}>
                <Row>
                  <Image
                    source={require('assets/placeholders/onboarding/profile/img1.webp')}
                    style={{
                      borderRadius: 12,
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </Row>
                <Row>
                  <Image
                    source={require('assets/placeholders/onboarding/profile/img2.webp')}
                    style={{
                      borderRadius: 12,
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </Row>
              </Col>
              <Col style={{ gap: 8 }}>
                <Row>
                  <Image
                    source={require('assets/placeholders/onboarding/profile/img3.webp')}
                    style={{
                      borderRadius: 12,
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </Row>
                <Row>
                  <Image
                    source={require('assets/placeholders/onboarding/profile/img4.webp')}
                    style={{
                      borderRadius: 12,
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </Row>
              </Col>
            </Grid>
            <View style={{
              position: 'absolute',
              left: '50%',
              transform: [{ translateX: -40 }],
            }}>
              <View
                style={{
                  position: 'absolute',
                  transform: [{ translateX: -12 }, { translateY: -12 }],
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  width: 104,
                  height: 104,
                  borderRadius: 999
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  transform: [{ translateX: -26 }, { translateY: -26 }],
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  width: 132,
                  height: 132,
                  borderRadius: 999
                }}
              />
              <Image
                source={require('assets/placeholders/onboarding/profile/selfie.webp')}
                style={{
                  borderRadius: 99,
                  width: 80,
                  height: 80
                }}
              />
            </View>
          </View>
        </View>
      </View>
      <Button
        variant="primary"
        onPress={() => router.dismissTo(ROUTES.TABS.DISCOVER)}
      >
        Discover the future
      </Button>
    </View>
  );
}
