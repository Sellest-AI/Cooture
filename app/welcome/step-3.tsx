import { useAuthActions } from '@/lib/convex/auth';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Collection } from '@ui/cards';
import { Plus } from '@ui/icons';
import { Text } from '@ui/text';
import { View } from 'react-native';
import { Colors } from 'theme';

export default function Screen() {
  const { isLoading, signInGoogle } = useAuthActions();

  return (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        marginTop: 144,
        padding: 8,
      }}
    >
      <View style={{ maxWidth: 456, flex: 1 }}>
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
            Your Dream Camera
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
            Choose an outfit, a style and see yourself transformed into a 1M subscribers model.
          </Text.Lg>
          <View
            style={{
              height: 46,
              marginHorizontal: 32,
              marginBottom: 28,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: -12,
              }}
            >
              <Badge
                source={require('assets/placeholders/jeans-outfit.png')}
                contentFit='contain'
                style={{ zIndex: 3 }}
              />
              <Badge
                source={require('assets/placeholders/blue-shirt.png')}
                contentFit='contain'
                style={{ marginLeft: -24, zIndex: 2 }}
              />
              <Badge
                source={require('assets/placeholders/shoes-outfit.png')}
                contentFit='contain'
                style={{ marginLeft: -24, zIndex: 1 }}
              />
              <Badge
                text={"+3"}
                style={{ marginLeft: -24 }}
              />
            </View>
            <Plus color={Colors.neutral[400]} size={12} strokeWidth={4} />
            <Badge
              source={require('assets/placeholders/avatar.png')}
              contentFit='cover'
            />
            <Plus color={Colors.neutral[400]} size={12} strokeWidth={4} />
            <Badge
              source={require('assets/placeholders/bench-model.png')}
              contentFit='cover'
            />
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                flex: 1,
                paddingHorizontal: 24,
                marginHorizontal: 'auto',
                alignSelf: 'stretch',
                alignItems: 'center',
                maxHeight: 370
              }}
            >
              <Collection
                source={require('assets/placeholders/bench-model.png')}
                style={{
                  height: '100%'
                }}
              />
            </View>
          </View>
        </View>
      </View>
      <Button
        isLoading={isLoading}
        style={{ alignSelf: 'stretch', marginTop: 28 }}
        variant="primary"
        onPress={async () => { signInGoogle(); }}
      >
        Begin the Journey
      </Button>
    </View>
  );
}
