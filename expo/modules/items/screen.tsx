import { Route, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useAccount } from "@/lib/convex/auth";
import { useMutation, useQuery } from "@/lib/convex/client";
import { useItem } from "@/modules/items/_hooks/useItem";
import { ColorCategory } from "@/modules/items/category.color";
import { FeelCategory } from "@/modules/items/category.feel";
import { GenderCategory } from "@/modules/items/category.gender";
import { ItemCategory } from "@/modules/items/category.item";
import { WeatherCategory } from "@/modules/items/category.weather";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { CardItem } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { GhostIconWrapper } from "@ui/ghost-animation";
import { BookmarkIcon, ExternalLink, Loader, Plus, User } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import * as Linking from 'expo-linking';
import { useEffect, useMemo, useState } from "react";
import { Platform, View, ViewStyle } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";
import { useSearchItems } from "./_hooks/useSearchItems";

const ColorsBlock = ({ style }: { style?: ViewStyle }) => {
  const { item } = useItem();

  if (!item) return null;

  return (
    <View style={[{
      gap: 8,
      height: 24,
      maxWidth: 164,
      flexDirection: 'row',
      justifyContent: 'center',
      marginHorizontal: 'auto'
    }, style]}>
      {item.mainColors.slice(0, 4).map((color, i) => (
        <View
          key={color + i}
          style={{
            flex: 1,
            borderRadius: 999,
            overflow: 'hidden',
            backgroundColor: 'transparent',
            borderColor: Colors.blur.medium,
            borderWidth: 1,
          }}
        >
          <View style={{ flex: 1, backgroundColor: color, borderRadius: 999 }} />
        </View>
      ))}
    </View>
  )
}

const DeleteItemButton = ({ path }: { path: Route }) => {
  const [disabled, setDisabled] = useState(false);

  const { user } = useAccount();
  const { item } = useItem();

  const { dismissTo } = useRouter(path);
  const { mutate } = useMutation(api.router.items.deleteOne.authed);

  if (!item || item.userId !== user?._id) return null;

  return (
    <Button
      variant="destructive"
      disabled={disabled}
      onLongPress={async () => {
        const { success } = await mutate({ itemId: item._id });
        if (success) dismissTo(ROUTES.PROFILE.ITEMS);
        else setDisabled(true);
      }}
    >
      Long press to delete
    </Button>
  )
}

const LinkBlock = () => {
  const { item } = useItem();
  // const { user } = useAccount();
  // const isOwner = item?.userId === user?._id;

  const [canOpen, setCanOpen] = useState(true);
  useEffect(() => {
    (async () => {
      if (!item?.link) return setCanOpen(false);
      const canOpen = await Linking.canOpenURL(item.link);
      setCanOpen(canOpen);
    })();
  }, [item?.link])

  if (canOpen) return (
    <Button
      variant="blur"
      startIcon={ExternalLink}
      onPress={() => { if (item?.link) Linking.openURL(item.link); }}
    >
      Open website
    </Button>
  )

  return null;
}

const ToggleBookmarkButton = ({ style }: { style?: ViewStyle }) => {
  const { item } = useItem();
  const { data: isBookmarked } = useQuery(api.router.collection.getBookmarked.authed, item ? { itemId: item._id } : 'skip');
  const { mutate: toggleBookmark } = useMutation(api.router.collection.toggleBookmark.authed);

  return (
    <Button
      variant="blur"
      size="rounded"
      style={style}
    >
      <GhostIconWrapper
        style={{ padding: 4 }}
        icon={BookmarkIcon}
        selected={isBookmarked}
        color={Colors.primary[500]}
        onPress={() => { if (item) toggleBookmark?.({ itemId: item._id }); }}
        size={24}
      />
    </Button>
  )
}

const SimilarItems = ({ style, path }: { path: Route, style?: ViewStyle }) => {
  const { push } = useRouter(path);
  const { item } = useItem();

  const query = useMemo(() => ({ query: '', category: item?.category, hexColor: item?.mainColors[0], extraHexColors: item?.mainColors.slice(1, 2) }), [item]);
  const { isLoading, results, canLoadMore, loadMore } = useSearchItems(query);

  const items = results?.filter((i) => i._id !== item?._id) || [];

  const { paddingHorizontal, ...restStyle } = style || {};

  if (!canLoadMore && items.length === 0) return null;

  return (
    <View style={{ ...restStyle }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: paddingHorizontal ?? 0,
        marginLeft: 4,
        gap: 4,
      }}>
        <Text.Lg color={Colors.neutral[400]} weight={500} style={{ marginBottom: 8 }}>
          Similar items
        </Text.Lg>
        {isLoading && <Loader size={16} color={Colors.neutral[400]} />}
      </View>
      <FlashList
        data={items}
        horizontal
        style={{ marginTop: 12, height: 156 }}
        contentContainerStyle={{ paddingHorizontal: paddingHorizontal ?? 0 }}
        showsHorizontalScrollIndicator={false}
        onEndReached={() => canLoadMore ? loadMore() : undefined}
        onEndReachedThreshold={0.7}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return (
            <View
              style={{
                width: Math.min(200, Number(item.image.aspectRatio.actual) * 132),
                height: 156,
                marginRight: 24,
                paddingBottom: 44
              }}
            >
              <CardItem
                onPress={() => push(ROUTES.ITEM.PATH, {
                  pathParams: { id: item._id }
                })}
                source={item.image.sizes.small.url}
                image={item.image.sizes.small}
                title={item.name}
                subtitle={item.brand}
                style={{ height: '100%' }}
              />
            </View>
          )
        }}
      />
    </View>
  )
}

type Props = {
  QuickAccessBar?: React.ReactNode;
  id: Id<'items'>;
  path: Route;
  isFullScreen?: boolean;
  headerEndContent?: React.ReactNode;
}

export const ItemScreen = ({ id, path, QuickAccessBar, isFullScreen = false, headerEndContent }: Props) => {
  const { push, redirect } = useRouter(path);
  const { item, isLoading, update } = useItem(id);

  const { user } = useAccount();
  const disabled = (id: Id<'users'>) => user?._id !== id;

  if (isLoading || !item) {
    return <LoadingBlock style={{ height: 'auto' }} type="logo" />
  }

  return (
    <ParallaxScrollView
      headerBackgroundGradient={isFullScreen}
      headerBackground={isFullScreen &&
        <Image
          contentFit="cover"
          blurRadius={100}
          source={item.image?.sizes.thumbnail.url}
          style={{ width: '100%', height: '100%', opacity: 0.2 }}
        />
      }
      headerContent={
        <View>
          <ModalHeader
            style={{ paddingTop: 12, paddingHorizontal: 12 }}
            title={item.name}
            onBack={() => redirect({ fallbackTo: ['back', ROUTES.PROFILE.ITEMS] })}
            endContent={headerEndContent}
          />
          <View style={{
            padding: 32,
            paddingBottom: Platform.OS === 'web' ? 32 : 16,
            flex: 1,
          }}>
            <Image
              priority="high"
              contentFit="contain"
              source={item.image?.sizes.medium.url}
              placeholder={item.image?.sizes.thumbnail.url}
              placeholderContentFit="contain"
              style={{
                width: '100%',
                height: Number(item.image.aspectRatio.actual) > 1 ? 220 : 320,
              }}
            />
          </View>
          <ColorsBlock style={{ marginTop: 24 }} />
          {item.description && <View style={{ paddingHorizontal: 32, marginTop: 28, marginBottom: 24 }}>
            <Text.Base color={Colors.neutral[200]} numberOfLines={4} style={{ textAlign: 'center' }}>
              {item.description}
            </Text.Base>
          </View>}
        </View>
      }
    >
      <View style={{ paddingHorizontal: 8, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, alignItems: 'stretch' }}>
          <ToggleBookmarkButton style={{ marginRight: 4 }} />
          <Button
            startIcon={User}
            onPress={() => {
              push(ROUTES.USER.PATH, {
                pathParams: { id: item.userId }
              })
            }}
            variant="blur"
            size="rounded"
            style={{ padding: 6 }}
          />
          {QuickAccessBar}
          <Button
            startIcon={Plus}
            onPress={() => {
              push(ROUTES.MODALS.PICK_OUTFIT, {
                redirectTo: ROUTES.PROFILE.OUTFITS,
                params: { itemIds: [item._id] }
              })
            }}
            style={{ flex: 1 }}
            variant="primary"
          >
            Add to outfit
          </Button>
        </View>
        <LinkBlock />
      </View>
      <SimilarItems
        path={path}
        style={{ marginTop: 20, paddingHorizontal: 8 }}
      />
      <View style={{ paddingHorizontal: 8, gap: 8 }}>
        <Text.Lg color={Colors.neutral[400]} weight={500}
          style={{ marginBottom: 8, marginLeft: 4, marginTop: 12 }}
        >
          Information
        </Text.Lg>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <ItemCategory title={item.category} onPress={(category) => update({ category })} disabled={disabled(item.userId)} />
          <WeatherCategory title={item.weatherTags[0]} onPress={(weather) => update({ weatherTags: [weather, ...item.weatherTags.slice(1)] })} disabled={disabled(item.userId)} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <ColorCategory title={item.colorTones[0]} onPress={(color) => update({ colorTones: [color, ...item.colorTones.slice(1)] })} disabled={disabled(item.userId)} />
          <FeelCategory title={item.materialFeel} onPress={(materialFeel) => update({ materialFeel })} disabled={disabled(item.userId)} />
          <GenderCategory title={item.gender} onPress={(gender) => update({ gender })} disabled={disabled(item.userId)} />
        </View>
        <DeleteItemButton path={path} />
      </View>
      {isFullScreen && <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} />}
      {!isFullScreen && <View style={{ height: 12 }} />}
    </ParallaxScrollView>
  )
}