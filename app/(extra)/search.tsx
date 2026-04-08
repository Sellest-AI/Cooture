import { ROUTES, useDebounce } from "@/hooks";
import { api, Id, useQuery, useQueryCached } from "@/lib/convex/client";
import { useTrackValues } from "@/lib/posthog/useTrackValues";
import { Badge } from "@ui/badge";
import { Block } from "@ui/block";
import { CardItem, Collection } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { ArrowLeft, Search } from "@ui/icons";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import { shuffleArray } from "@utils/convex-allowed";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";

const UserSkeleton = ({ style }: { style?: ViewStyle }) => {
  return (
    <View style={[{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20
    }, style]}>
      <Skeleton
        width={56}
        height={56}
        style={{ borderRadius: 99 }}
      />
      <View>
        <Skeleton
          width={132}
          height={14}
        />
        <Skeleton
          width={96}
          height={12}
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  )
}

type UserProps = {
  style?: ViewStyle;
  src?: string;
  username?: string;
  name?: string;
  id: string;
}

const User = ({ style, src, username, name, id }: UserProps) => {
  return (
    <Pressable
      onPress={() => router.push(ROUTES.USER.ID(id))}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        ...style
      }}>
      <Badge
        style={{ width: 56, height: 56, borderRadius: 99 }}
        source={src ?? require('assets/backgrounds/dark-gradient.png')}
      />
      <View>
        <Text.Base
          color={Colors.neutral[50]}
          weight={600}
        >
          {username}
        </Text.Base>
        <Text.Sm
          color={Colors.neutral[400]}
          style={{ marginTop: 6 }}
        >
          {name}
        </Text.Sm>
      </View>
    </Pressable>
  )
}

const Item = ({ id }: { id: Id<'items'> }) => {
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 5);
  const { data: item } = useQueryCached(api.router.items.getOne.anon, { itemId: id });

  useEffect(() => { if (item) setAspectRatio(item.image.width / item.image.height) }, [item])
  if (!item) return <Skeleton style={{ flex: 1, aspectRatio }} />;

  return (
    <CardItem
      image={item.image}
      source={item.image.sizes.small.url}
      title={item.name}
      subtitle={item.category.toLowerCase()}
      onPress={() => router.push(ROUTES.ITEM.ID(item._id))}
    />
  )
}

const Outfit = ({ id }: { id: Id<'outfits'> }) => {
  const { data: item } = useQueryCached(api.router.outfits.getOne.anon, { outfitId: id });

  if (!item) return <Skeleton style={{ flex: 1, aspectRatio: 4 / 5 }} />;

  return (
    <Collection
      backgroundColor={item.backgroundColor}
      source={item.cover?.sizes.small.url}
      contentFit="contain"
      title={item.name}
      subtitle={`${item.items.length} items`}
      onPress={() => router.push(ROUTES.OUTFIT.ID(item._id))}
    />
  )
}

export default function Screen() {
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 800);
  const query = search !== debouncedSearch ? '' : search;

  const hasQuery = query.length > 0;
  const { data: users, isSuccess: isUsersSuccess } = useQuery(api.router.users.searchMany.authed, hasQuery ? { query } : 'skip');
  const { data: items, isSuccess: isItemsSuccess } = useQuery(api.router.items.searchMany.anon, hasQuery ? { query } : 'skip');
  const { data: outfits, isSuccess: isOutfitsSuccess } = useQuery(api.router.outfits.searchMany.anon, hasQuery ? { query } : 'skip');

  const isSuccess = isUsersSuccess && isItemsSuccess && isOutfitsSuccess;
  const showLoading = search && !isSuccess;

  useTrackValues('search_screen_query_submitted', {
    query,
    enabled: hasQuery && isSuccess
  });

  const data = useMemo(() => shuffleArray([
    ...(items ?? []).map((chunk) => ({ type: 'item' as const, data: chunk })).slice(0, 20),
    ...((outfits ?? []).map((chunk) => ({ type: 'outfit' as const, data: chunk }))).slice(0, 10)
  ], query), [items, outfits, query]);

  return (
    <SafeAreaView
      edges={{ bottom: 'android' }}
      style={{
        padding: 12,
        flex: 1
      }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : undefined}>
          <Block
            style={{ borderRadius: 99, padding: 10 }}
            variant="blur"
          >
            <ArrowLeft color={Colors.foreground} />
          </Block>
        </Pressable>
        <TextInput
          startIcon={Search}
          canClear
          autoFocus
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1 }}
        />
      </View>
      <FlashList
        scrollEnabled={!showLoading}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={showLoading ? <>
          <UserSkeleton style={{ marginBottom: 24 }} />
          <UserSkeleton style={{ marginBottom: 24 }} />
          <UserSkeleton style={{ marginBottom: 24 }} />
          {[1, 2, 3].map((i) => (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }} key={i}>
              <Skeleton style={{ flex: 1, aspectRatio: 4 / 5 }} />
              <Skeleton style={{ flex: 1, aspectRatio: 4 / 5 }} />
            </View>
          ))}
        </> : undefined}
        style={{ paddingHorizontal: 4 }}
        contentContainerStyle={{ paddingTop: 24 }}
        data={data.length > 0 ? data : []}
        masonry
        numColumns={2}
        keyExtractor={(item) => item.data._id.toString()}
        ListHeaderComponent={(users ?? []).length > 0 ? <View>
          {(users ?? []).map((u) => (
            <User
              key={u._id}
              style={{ marginBottom: 24 }}
              src={u.image}
              username={u.username}
              name={u.name}
              id={u._id}
            />
          ))}
          {data.length > 0 && <View style={{
            marginTop: 0,
            marginBottom: 32,
            width: '100%',
            height: 1,
            backgroundColor: Colors.blur.dark,
            borderRadius: 99
          }} />}
        </View> : undefined}
        renderItem={({ item, index }) => {
          if (item.type === "item") {
            return (
              <View style={{
                flexDirection: 'row',
                marginBottom: 32,
                paddingLeft: index % 2 === 0 ? 12 : 24,
                paddingRight: index % 2 === 0 ? 24 : 12,
              }}>
                <Item
                  id={item.data._id}
                />
              </View>
            )
          }

          if (item.type === "outfit") {
            return (
              <View style={{
                flexDirection: 'row',
                marginBottom: 32,
                paddingLeft: index % 2 === 0 ? 12 : 24,
                paddingRight: index % 2 === 0 ? 24 : 12,
              }}>
                <Outfit
                  id={item.data._id}
                />
              </View>
            )
          }

          return null;
        }}
      />
    </SafeAreaView>
  )
}
