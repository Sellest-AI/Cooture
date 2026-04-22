import { Check } from '@ui/icons';
import { ComponentProps, useEffect, useState } from 'react';
import { LayoutChangeEvent, Image as RNImage, View, ViewStyle } from 'react-native';
import { Colors } from 'theme';
import { Image, ImageObject } from '../image';
import { Pressable, } from '../pressable';
import { Text } from '../text';

type Props = {
  title?: string;
  subtitle?: string;
  disabled?: boolean;
  style?: ViewStyle;
  badge?: string;
  selected?: boolean;
  source: ComponentProps<typeof Image>['source'];
  image?: ImageObject;
  onPress?: ComponentProps<typeof Pressable>['onPress'];
  onLongPress?: ComponentProps<typeof Pressable>['onLongPress'];
  animate?: boolean;
}

export const CardItem = ({ title, subtitle, selected, disabled, badge, style, source, onPress, onLongPress, image, animate = true }: Props) => {
  // Default height if we can't compute one from the image
  const DEFAULT_HEIGHT = 160;

  // Track intrinsic image size and layout width so we can compute the scaled height
  const [intrinsicSize, setIntrinsicSize] = useState<{ width: number; height: number } | null>(image ?? null);
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!source) return;

    if (image) {
      setIntrinsicSize({ width: image.width, height: image.height });
      return;
    }

    // Handle local required images (numbers) and remote URIs
    if (typeof source === 'number') {
      const res = RNImage.resolveAssetSource(source as any);
      if (res && res.width && res.height) setIntrinsicSize({ width: res.width, height: res.height });
    } else if (typeof source === 'object' && (source as any).uri) {
      RNImage.getSize((source as any).uri, (w, h) => setIntrinsicSize({ width: w, height: h }), () => { });
    }
    if (typeof source === 'string') {
      RNImage.getSize(source, (w, h) => setIntrinsicSize({ width: w, height: h }), () => { });
    }
  }, [image, source]);

  // Compute height that preserves aspect ratio given the measured layout width
  const computedHeight = intrinsicSize && layoutWidth ? (layoutWidth / intrinsicSize.width) * intrinsicSize.height : null;

  // If caller provides a height via `style`, use it; otherwise prefer computedHeight, then fallback
  const containerHeight = style && (style as any).height ? (style as any).height : (computedHeight ?? DEFAULT_HEIGHT);

  const aspectRatio = image ? (image.width / image.height) : (intrinsicSize ? (intrinsicSize.width / intrinsicSize.height) : undefined);

  const showText = title || subtitle;

  return (
    <Pressable
      disabled={disabled}
      animated={animate}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{ flex: style?.flex ?? 1, opacity: style?.opacity }}
    >
      <View
        onLayout={(e: LayoutChangeEvent) => {
          const w = e.nativeEvent.layout.width;
          if (!layoutWidth) setLayoutWidth(w);
        }}
        style={{
          overflow: 'hidden',
          aspectRatio: style?.height ? undefined : aspectRatio,
          height: style?.height ?? (aspectRatio ? undefined : containerHeight),
          paddingHorizontal: style?.paddingHorizontal,
        }}
      >
        {source && <Image
          key={source.toString()}
          source={source}
          // Let the image scale to fit vertically while preserving aspect ratio
          contentFit="contain"
          style={{
            height: '100%',
            width: undefined,
            opacity: selected ? 0.2 : 1
          }}
        />}
        {selected &&
          <View style={{
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            inset: 0,
          }}>
            <Check
              color={Colors.secondary[500]}
              size={32}
            />
          </View>
        }
        {badge && <View style={{
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 99,
          backgroundColor: Colors.secondary[500],
          borderTopColor: Colors.secondary[200],
          borderTopWidth: 1,
          position: 'absolute',
          top: 6,
          right: 6
        }}>
          <Text.Sm
            color={Colors.secondary[900]}
            style={{ marginTop: -2 }}
            weight={600}
          >
            {badge}
          </Text.Sm>
        </View>}
      </View>
      {showText && <View
        style={{
          paddingHorizontal: selected ? 20 : 0,
          paddingVertical: selected ? 4 : 0,
          backgroundColor: selected ? Colors.primary[500] : 'transparent',
          borderRadius: selected ? 99 : 0,
          width: 'auto',
          maxWidth: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          marginTop: 12,
        }}
      >
        {title && <Text.Sm
          numberOfLines={1}
          style={{
            fontWeight: 700,
            color: selected ? Colors.primary[900] : Colors.neutral[50],
            textAlign: 'center',
            maxWidth: selected ? '100%' : '90%',
          }}
        >
          {title}
        </Text.Sm>}
        {subtitle && <Text.Sm
          numberOfLines={1}
          style={{
            fontWeight: 600,
            color: selected ? Colors.primary[900] : Colors.neutral[400],
            opacity: selected ? 0.5 : 1,
            marginTop: 1,
            textAlign: 'center',
            maxWidth: '90%',
            paddingBottom: 2
          }}
        >
          {subtitle.charAt(0).toUpperCase() + subtitle.slice(1).toLowerCase()}
        </Text.Sm>}
      </View>}
    </Pressable>
  )
}