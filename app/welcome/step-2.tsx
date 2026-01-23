import { Button } from '@ui/button';
import { ImageGeneration } from '@ui/cards';
import { SafeAreaView } from '@ui/safe-area-view';
import { Carousel } from '@ui/screen-carousel';
import { Text } from '@ui/text';
import { Platform, View } from 'react-native';
import { ROUTES } from 'routes';
import { Colors } from 'theme';

const data = [
  require('assets/placeholders/can-model.png'),
  require('assets/placeholders/snow-model.png'),
  require('assets/placeholders/restaurant-model.png'),
  require('assets/placeholders/tiger-model.png'),
  require('assets/placeholders/street-model.png'),
]

const CarouselComponent = () => {
  return (
    <View style={{
      width: '100%',
      flex: 1,
    }}
    >
      <Carousel
        scaleAnimation={true}
        items={data.map((source, i) => (
          <ImageGeneration
            key={i}
            source={source}
          />
        ))}
      />
    </View>
  )
}

export default function Screen() {
  return (
    <SafeAreaView
      style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        marginTop: Platform.OS === "web" ? 164 : 172,
        overflow: 'hidden'
      }}
    >
      <View
        style={{
          maxWidth: 456,
          paddingHorizontal: 8,
        }}
      >
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
          Find trending outfits and styles
        </Text.H3>
        <Text.Lg
          style={{
            textBalance: true,
            textAlign: 'center',
            color: Colors.neutral[400],
            maxWidth: 320,
            marginInline: 'auto',
            marginBottom: 24,
          }}
        >
          Try out the newest outfits in the most popular trending scenaries.
        </Text.Lg>
      </View>
      <View style={{ flex: 1, width: '100%', marginBottom: 24 }}>
        <CarouselComponent />
      </View>
      <View
        style={{ paddingHorizontal: 8, paddingBottom: 8, width: '100%' }}
      >
        <Button
          style={{ alignSelf: 'stretch' }}
          variant="primary"
          href={ROUTES.WELCOME.STEP_3}
        >
          Next
        </Button>
      </View>
    </SafeAreaView>
  );
}
