import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { ArrowRight, Bookmark, CircleFadingArrowUp, Heart, ShareIcon } from '@ui/icons';
import { Skeleton } from '@ui/skeleton';
import { useState } from 'react';
import { Dimensions, FlatList, View, ViewStyle } from 'react-native';
import { Colors } from 'theme';
import { Image } from '../image';
import { Text } from '../text';
import { ZoomableImage } from '../zoomable-image';

type Props = {
  style?: ViewStyle;
  paddingHorizontal?: number;
  postedAt?: Date;
  onPress?: (_id: string) => void;
  image?: {
    _id: string;
    url: string;
    contentFit?: 'cover' | 'contain';
  }
  images?: {
    _id: string;
    url: string;
    contentFit?: 'cover' | 'contain';
  }[]
  likedAccounts?: string[];
  user?: {
    onPress?: () => void;
    imageUrl?: string;
    name: string;
    username: string;
  }
  preset?: {
    onPress?: () => void;
    imageUrl: string;
  }
  outfit?: {
    onPress?: () => void;
    itemUrls: string[];
  }
}

export const Post = ({ style, postedAt, image, user, preset, outfit, images, likedAccounts, paddingHorizontal, onPress }: Props) => {
  const [pinching, setPinching] = useState<{ index: number } | false>(false);
  const type = preset ? 'preset' : outfit ? 'outfit' : undefined;
  const hasImages = images && images.length > 0;

  const PADDING_HORIZONTAL = paddingHorizontal ?? 12;
  const GAP = 4;

  const FALLBACK_IMAGE = image || images?.[0];

  return (
    <View style={[{}, style]}>
      {user && <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
        paddingHorizontal: PADDING_HORIZONTAL
      }}>
        {user && <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 10
        }}>
          <View style={{
            width: 32, height: 32,
            borderRadius: 99,
            borderColor: Colors.blur.medium,
            borderWidth: 1,
            backgroundColor: Colors.blur.dark,
            overflow: 'hidden'
          }}>
            <Image
              source={user.imageUrl}
              style={{ flex: 1 }}
            />
          </View>
          <View>
            <Text.Sm color={Colors.neutral[50]} weight={600}>{user.name}</Text.Sm>
            <Text.Sm color={Colors.neutral[400]} style={{ marginTop: 2 }}>@{user.username}</Text.Sm>
          </View>
        </View>}
        {postedAt && <Text.Sm color={Colors.neutral[400]}>{postedAt.toDateString()}</Text.Sm>}
      </View>}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: GAP,
          paddingHorizontal: PADDING_HORIZONTAL,
        }}
        decelerationRate="fast"
        data={(images ?? [image])}
        keyExtractor={(item) => item?.url ?? ''}
        snapToInterval={Dimensions.get('window').width - (PADDING_HORIZONTAL * 2) + GAP}
        numColumns={1}
        renderItem={({ item: img, index }) => {
          return (
            <View
              key={img?.url ?? index}
              style={{
                width: Dimensions.get('window').width - (PADDING_HORIZONTAL * 2),
                aspectRatio: 3 / 4,
                zIndex: pinching && pinching.index === index ? 10 : 0,
              }}>
              {img && <ZoomableImage
                onPinchChange={(pinching) => setPinching(pinching ? { index } : false)}
                source={img.url}
                contentFit={img.contentFit}
                width={Dimensions.get('window').width - (PADDING_HORIZONTAL * 2)}
                aspectRatio={3 / 4}
                style={{
                  backgroundColor: Colors.blur.dark,
                  borderRadius: 32,
                  borderColor: Colors.blur.medium,
                  borderTopWidth: 1,
                  flex: 1,
                }}
              />}
              {!pinching && <View style={{
                position: 'absolute',
                top: 16,
                right: 16,
                left: 16,
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                {preset && <Badge
                  source={preset.imageUrl}
                  contentFit="cover"
                  contentPosition="top center"
                  style={{ width: 32, height: 32 }}
                />}
                {outfit && <View style={{
                  flexDirection: 'row',
                  gap: 0,
                }}>
                  {outfit.itemUrls.slice(0, 2).map((url) => <Badge
                    key={url}
                    source={url}
                    contentFit="contain"
                    style={{ marginLeft: -14, width: 32, height: 32 }}
                  />)}
                  {outfit.itemUrls.length > 2 &&
                    <Badge text={`+${outfit.itemUrls.length - 2}`}
                      style={{ marginLeft: -14, width: 32, height: 32 }}
                    />}
                </View>}
              </View>}
            </View>
          )
        }}
      />
      {(type === 'preset' || type === 'outfit') && <Button
        onPress={() => {
          preset?.onPress?.();
          outfit?.onPress?.();
        }}
        style={{ marginTop: 8, marginHorizontal: hasImages ? PADDING_HORIZONTAL : 0 }}
        variant={type === 'preset' ? 'secondary' : 'primary'}
        endIcon={type === 'outfit' && ArrowRight}
        startIcon={type === 'preset' && CircleFadingArrowUp}
      >
        {type === 'preset' ? 'Recreate' : 'Try on'}
      </Button>}
      <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: PADDING_HORIZONTAL + 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8 }}>
          <Heart size={20} color={Colors.foreground} />
          {likedAccounts && <View style={{ flexDirection: 'row', gap: 0, alignItems: 'center' }}>
            {likedAccounts.map((account) => (
              <Image
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 99,
                  marginRight: -4
                }}
                source={account}
                key={account}
              />
            ))}
          </View>}
        </View>
        <View style={{ gap: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Bookmark size={20} color={Colors.primary[500]} />
          {FALLBACK_IMAGE && <ShareIcon size={20} color={Colors.secondary[500]} onPress={() => onPress?.(FALLBACK_IMAGE._id)} />}
        </View>
      </View>
    </View>
  )
}

type SkeletonPostProps = {
  style?: ViewStyle;
}

const SkeletonPost = ({ style }: SkeletonPostProps) => {
  return (
    <View style={[{}, style]}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 10
        }}>
          <View style={{
            width: 32, height: 32,
            borderRadius: 99,
            borderColor: Colors.blur.medium,
            borderWidth: 1,
            overflow: 'hidden'
          }}>
            <Skeleton style={{ flex: 1 }} />
          </View>
          <View>
            <Skeleton style={{ height: 10, width: 100 }} />
            <Skeleton style={{ height: 10, width: 120, marginTop: 4 }} />
          </View>
        </View>
        <Skeleton style={{ height: 14, width: 70 }} />
      </View>
      <View style={{
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 32,
        borderTopColor: Colors.blur.medium,
        borderTopWidth: 1,
        overflow: 'hidden',
      }}>
        <Skeleton style={{ flex: 1 }} />
      </View>
      <Skeleton style={{ height: 56, width: '100%', marginTop: 8 }} />
      <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8 }}>
          <Skeleton style={{ height: 20, width: 80 }} />
        </View>
        <View style={{ gap: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Skeleton style={{ height: 20, width: 20 }} />
          <Skeleton style={{ height: 20, width: 20 }} />
        </View>
      </View>
    </View>
  )
}

Post.Skeleton = SkeletonPost;