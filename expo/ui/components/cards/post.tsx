import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { GhostIconWrapper } from '@ui/ghost-animation';
import { BookmarkIcon, CircleFadingArrowUp, EllipsisVertical, HeartIcon, ShareIcon } from '@ui/icons';
import { Skeleton } from '@ui/skeleton';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, View, ViewStyle } from 'react-native';
import { Colors } from 'theme';
import { Image } from '../image';
import { Pressable as AnimatedPressable } from '../pressable';
import { Text } from '../text';
import { ZoomableImage } from '../zoomable-image';
import { PostMenu } from './post.menu';

type Props = {
  style?: ViewStyle;
  paddingHorizontal?: number;
  postedAt?: Date;
  recreateCount?: number;
  isLiked?: boolean;
  onToggleLike?: (value: boolean) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onShare?: (_id: string) => void;
  onPress?: (_id: string) => void;
  image?: {
    _id: string;
    url: string;
    contentFit?: 'cover' | 'contain';
    backgroundColor?: string;
  }
  images?: {
    _id: string;
    url: string;
    contentFit?: 'cover' | 'contain';
    backgroundColor?: string;
  }[]
  likedAccounts?: string[];
  users?: {
    onPress?: () => void;
    imageUrl?: string;
    name: string;
    username: string;
  }[]
  preset?: {
    onPress?: () => void;
    imageUrl: string;
  }
  outfit?: {
    onPress?: () => void;
    itemUrls: string[];
  }
  onRecreate?: () => void;
}

export const Post = ({ style, image, users, preset, outfit, images, likedAccounts, onRecreate,
  onShare, paddingHorizontal, isBookmarked, onPress, onToggleBookmark, onToggleLike, isLiked,
  recreateCount,
}: Props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [doubleTap, setDoubleTap] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pinching, setPinching] = useState<{ index: number } | false>(false);
  const type = preset ? 'preset' : outfit ? 'outfit' : undefined;

  const PADDING_HORIZONTAL = paddingHorizontal ?? 12;
  const GAP = 4;

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: { index?: number | null }[] }) => {
    if (viewableItems.length === 0) return;
    setCurrentIndex(viewableItems[0].index ?? 0);
  }, [])

  const viewabilityConfigCallbackPairs = useRef([
    {
      onViewableItemsChanged,
      viewabilityConfig: {
        minimumViewTime: 100, itemVisiblePercentThreshold: 90,
      }
    },
  ]);

  const user = users?.[0];
  const recreateCountStr = recreateCount !== undefined && recreateCount > 0 ? recreateCount.toString() : null;

  return (
    <>
      <View style={[{}, style]}>
        {users && users.length > 0 && <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 12,
          paddingHorizontal: PADDING_HORIZONTAL
        }}>
          {users && users.length > 1 && <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 32
            }}
          >
            <View>
              <View style={{
                top: 0, left: 2,
                width: 28, height: 28,
                borderRadius: 99,
                borderColor: Colors.blur.medium,
                borderWidth: 1,
                backgroundColor: Colors.blur.dark,
                overflow: 'hidden'
              }}>
                <Image
                  source={users[0]?.imageUrl}
                  style={{ flex: 1 }}
                />
              </View>
              <View style={{
                position: 'absolute',
                top: 0, left: 20,
                width: 28, height: 28,
                borderRadius: 99,
                borderColor: Colors.blur.medium,
                borderWidth: 1,
                backgroundColor: Colors.blur.dark,
                overflow: 'hidden'
              }}>
                <Image
                  source={users[1]?.imageUrl}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
            <View style={{ gap: 6, marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Pressable onPress={users[0]?.onPress}>
                <Text.Sm color={Colors.neutral[50]} weight={600}>
                  {users[0]?.name}
                </Text.Sm>
              </Pressable>
              <Text.Sm color={Colors.neutral[200]}>
                x
              </Text.Sm>
              <Pressable onPress={users[1]?.onPress}>
                <Text.Sm color={Colors.neutral[50]} weight={600}>
                  {users[1]?.name}
                </Text.Sm>
              </Pressable>
            </View>
          </View>}
          {(user && users.length < 2) &&
            <Pressable
              onPress={user.onPress}
              style={{
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
            </Pressable>
          }
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
            {/* {(postedAt && users.length < 2) && <Text.Sm color={Colors.neutral[400]}>{postedAt.toDateString()}</Text.Sm>} */}
            <AnimatedPressable onPress={() => { setShowMenu(true) }} style={{ paddingLeft: 8, paddingTop: 8 }}>
              <EllipsisVertical size={20} color={Colors.neutral[400]} />
            </AnimatedPressable>
          </View>
        </View>}
        <FlatList
          horizontal
          scrollEnabled={(!images || images.length <= 1) ? false : !pinching}
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
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          renderItem={({ item: img, index }) => {
            return (
              <AnimatedPressable
                animated={false}
                key={img?.url ?? index}
                style={{
                  width: Dimensions.get('window').width - (PADDING_HORIZONTAL * 2),
                  aspectRatio: 3 / 4,
                  zIndex: pinching && pinching.index === index ? 10 : 0,
                  backgroundColor: img?.backgroundColor ?? Colors.blur.dark,
                  borderRadius: 28,
                }}>
                {img && <ZoomableImage
                  onPinchChange={(pinching) => setPinching(pinching ? { index } : false)}
                  source={img.url}
                  contentFit={img.contentFit}
                  width={Dimensions.get('window').width - (PADDING_HORIZONTAL * 2)}
                  aspectRatio={3 / 4}
                  onDoubleTap={onToggleLike ? () => {
                    const rotate = Math.random() * 40 - 20;
                    setDoubleTap(rotate);
                    if (!isLiked) onToggleLike?.(true);
                  } : undefined}
                  onTap={() => img && onPress?.(img._id)}
                  onLongPress={() => {
                    setShowMenu(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }}
                  style={{
                    borderRadius: 28,
                    backgroundColor: img?.backgroundColor ?? Colors.blur.dark,
                    borderColor: !pinching ? Colors.blur.dark : undefined,
                    borderTopWidth: 0, // Removed borders
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
                  {preset && <Pressable onPress={(e) => { e.stopPropagation(); preset.onPress?.(); }}>
                    <Badge
                      source={preset.imageUrl}
                      contentFit="cover"
                      contentPosition="top center"
                      style={{ width: 32, height: 32 }}
                    />
                  </Pressable>}
                  {outfit && <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      outfit.onPress?.()
                    }}
                    style={{
                      flexDirection: 'row',
                      gap: 0,
                      marginLeft: preset ? 0 : 16,
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
                  </Pressable>}
                </View>}
                {doubleTap && (
                  <MotiView
                    from={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ type: 'timing', duration: 400 }}
                    onDidAnimate={() => setDoubleTap(null)}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <HeartIcon
                      color={Colors.secondary[500]}
                      weight={'fill'}
                      size={56}
                      style={{
                        transform: [{ rotate: `${doubleTap}deg` }]
                      }}
                    />
                  </MotiView>
                )}
              </AnimatedPressable>
            )
          }}
        />
        {(type === 'preset' || type === 'outfit') && <Button
          onPress={() => { onRecreate?.(); }}
          style={{ marginTop: 8, marginHorizontal: PADDING_HORIZONTAL }}
          variant={type === 'preset' ? 'primary' : 'secondary'}
          startIcon={CircleFadingArrowUp}
        >
          {type === 'preset' ? 'Recreate' : 'Try on'}
        </Button>}
        <View style={{ paddingHorizontal: PADDING_HORIZONTAL + 4, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8 }}>
              <GhostIconWrapper
                style={{ padding: 4 }}
                icon={HeartIcon}
                selected={isLiked}
                color={isLiked ? Colors.secondary[500] : Colors.foreground}
                onPress={() => { onToggleLike?.(!isLiked); }}
                size={24}
              />
              {likedAccounts && <View style={{ flexDirection: 'row', gap: 0, alignItems: 'center' }}>
                {likedAccounts.slice(0, 3).map((account) => (
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
              {recreateCountStr && <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CircleFadingArrowUp size={20} color={Colors.neutral[200]} />
                <Text.Base color={Colors.neutral[200]}>{recreateCountStr}</Text.Base>
              </Pressable>}
              <GhostIconWrapper
                style={{ padding: 4 }}
                icon={BookmarkIcon}
                selected={isBookmarked}
                color={Colors.primary[500]}
                onPress={() => { onToggleBookmark?.(); }}
                size={20}
              />
              {onShare && <ShareIcon size={20} color={Colors.secondary[500]} onPress={() => {
                const id = images?.[currentIndex]._id ?? image?._id;
                if (id) onShare?.(id);
              }} />}
            </View>
            {(images && images.length > 1) && <View style={{
              position: 'absolute',
              left: '50%',
              transform: [{ translateX: '-50%' }],
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}>
              {images?.map((img, i) => (
                <MotiView
                  key={img._id}
                  style={{
                    width: 5,
                    height: 5,
                    backgroundColor: currentIndex === i ? Colors.neutral[50] : Colors.neutral[400],
                    borderRadius: 99,
                  }}
                // animate={{}}
                />
              ))}
            </View>}
          </View>
        </View>
      </View>
      <PostMenu
        open={showMenu}
        onOpenChange={setShowMenu}
        liked={isLiked}
        onToggleLike={onToggleLike}
        bookmarked={isBookmarked}
        onToggleBookmark={onToggleBookmark}
        onProfilePress={users?.[0].onPress}
        onOutfitPress={outfit?.onPress}
        onRecreate={onRecreate ?? preset?.onPress}
        onShare={() => {
          const id = images?.[currentIndex]._id ?? image?._id;
          if (id) onShare?.(id);
        }}
      />
    </>
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
        borderRadius: 28,
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