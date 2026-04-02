import { useRouter, useScrollToTop } from "@/hooks";
import { Api, api, usePaginatedQuery, useQueryCached, useQueryCachedData } from "@/lib/convex/client";
import { CreditsButton } from "@/modules/premium/credits.button";
import { Notification } from "@/modules/profiles/notification";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { BlurKeys, BlurTargetView } from "@ui/blur-view";
import { Collection } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { ArrowUpRight, Camera } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { useSafeAreaInsets } from "@ui/safe-area-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { shuffleWithSeed } from "@utils/convex-allowed";
import { useMemo, useState } from "react";
import { FlatList, Platform, StyleSheet, View, ViewStyle } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const Actions = () => {
  const { push } = useRouter('/new');

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 8,
        gap: 8,
      }}
    >
      <Pressable
        onPress={() => { push(ROUTES.PHOTOSHOOT.NEW) }}
        style={{
          borderTopColor: Colors.primary[200],
          backgroundColor: Colors.primary[500],
          ...styles.headerButtons,
        }}
      >
        <Camera size={40} color={Colors.primary[900]} />
        <Text.Lg color={Colors.primary[900]} style={{ textAlign: 'center' }}>Photoshoot</Text.Lg>
      </Pressable>
      <Pressable
        style={{
          ...styles.headerButtons,
          borderTopColor: Colors.secondary[200],
          backgroundColor: Colors.secondary[500],
        }}
        onPress={() => {
          push(ROUTES.OUTFIT.NEW, { redirectTo: ROUTES.OUTFIT.PATH });
        }}
      >
        <ArrowUpRight size={40} color={Colors.primary[900]} />
        <Text.Lg color={Colors.secondary[900]} style={{ textAlign: 'center' }}>New Outfit</Text.Lg>
      </Pressable>
    </View>
  )
}

type Category = Api["router"]["presets"]["getCategories"]["anon"]["_returnType"][number];
const SectionPresets = ({ category, style }: { category: Category, style: ViewStyle }) => {
  const { push } = useRouter(ROUTES.TABS.NEW);
  const { results, isLoading } = usePaginatedQuery(api.router.presets.getByCategory.anon, { category: category.value }, { initialNumItems: 8 });

  const [date] = useState(new Date());

  if (!isLoading && results.length < 3) return null;

  return (
    <View style={style}>
      <Text.H4 color={Colors.foreground} style={{ marginLeft: 12 }}>
        {category.label}
      </Text.H4>
      {isLoading && <View style={{
        marginTop: 16,
        flexDirection: 'row',
        paddingHorizontal: 16, gap: 32
      }}
      >
        <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
        <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
        <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
      </View>}
      <FlatList
        style={{ marginTop: 16 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 32, paddingHorizontal: 16, paddingTop: 6 }}
        data={shuffleWithSeed(results?.slice(0, 4) || [], `${date.getTime()}-${category.value}`)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Collection
            onPress={() => push(ROUTES.PHOTOSHOOT.RECAP, {
              params: { presetId: item._id }
            })}
            source={item.cover.sizes.medium.url}
            title={item.name}
            style={{ width: 132 }}
          />
        )}
      />
    </View>
  )
}

type Outfits = Api["router"]["outfits"]["getLatest"]["anon"]["_returnType"];
const SectionOutfits = ({ outfits, style }: { outfits: Outfits, style?: ViewStyle }) => {
  const { push } = useRouter(ROUTES.TABS.NEW);

  return (
    <View style={style}>
      <Text.H4 color={Colors.foreground} style={{ marginLeft: 12 }}>
        {shuffleWithSeed([
          "Your next try on",
          "Try on something new",
          "How about this outfit?",
          "Your next outfit is waiting",
          "Fresh fits for you",
          "Step into something new",
          "Outfits picked for you",
          "Your next look is here",
          "Discover your next outfit",
          "New fits to try on",
        ], outfits[0]._id)[0]}
      </Text.H4>
      {!outfits && <View style={{
        marginTop: 16,
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 32
      }}
      >
        <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
        <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
        <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
      </View>}
      <FlatList
        style={{ marginTop: 16 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 32, paddingHorizontal: 16, paddingTop: 6 }}
        data={outfits}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Collection
            onPress={() => push(ROUTES.PHOTOSHOOT.NEW, {
              params: { outfitId: item._id }
            })}
            backgroundColor={item.backgroundColor}
            source={item.cover.sizes.small.url}
            title={item.name}
            style={{ width: 132 }}
            contentFit="contain"
          />
        )}
      />
    </View>
  )
}

export default function Screen() {
  const scrollRef = useScrollToTop.FlashList();
  const { top, bottom } = useSafeAreaInsets();

  const { data: presets, isPending: isPresetsPending } = useQueryCached(api.router.presets.getCategories.anon);
  const { data: outfits, isLoading: isOutfitsPending } = useQueryCachedData(api.router.outfits.getLatest.anon, { key: 'latestOutfits' });

  const [date] = useState(new Date());

  const isLoading = isPresetsPending || isOutfitsPending;

  const list = useMemo(() => {
    if (isLoading) return [];

    // Batch outfits in groups of 4 to ensure better distribution in the UI
    const outfitBatches = outfits ? outfits.reduce((acc, outfit, index) => {
      const batchIndex = Math.floor(index / 4);
      if (!acc[batchIndex]) acc[batchIndex] = [];
      acc[batchIndex].push(outfit);
      return acc;
    }, [] as Outfits[]) : [];

    const items = [
      ...(outfitBatches || []).map((o) => ({ type: 'outfit' as const, data: o })),
      ...(presets || []).map((p) => ({ type: 'preset' as const, data: p })),
    ]

    return shuffleWithSeed(items, date.toString());
  }, [date, isLoading, outfits, presets]);

  return (
    <BlurTargetView blurKey={BlurKeys.NEW}>
      <FlashList
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ paddingBottom: Platform.OS === 'android' ? bottom : 0 }}
        contentContainerStyle={{
          paddingTop: Platform.OS !== 'ios' ? top + 8 : top,
          paddingBottom: TOTAL_TABS_SPACE
        }}
        data={list.length > 0 ? list : undefined}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 12 }}>
            <Skeleton style={{ width: 96, height: 14, marginTop: 32 }} />
            <View style={{ marginTop: 16, flexDirection: 'row', paddingHorizontal: 4, gap: 32 }}>
              <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
              <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
              <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
            </View>
            <Skeleton style={{ width: 96, height: 14, marginTop: 32 }} />
            <View style={{ marginTop: 16, flexDirection: 'row', paddingHorizontal: 4, gap: 32 }}>
              <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
              <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
              <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
            </View>
            <Skeleton style={{ width: 96, height: 14, marginTop: 32 }} />
            <View style={{ marginTop: 16, flexDirection: 'row', paddingHorizontal: 4, gap: 32 }}>
              <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
              <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
              <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
            </View>
          </View>
        }
        ListHeaderComponent={<>
          <ModalHeader
            title="Create"
            type="alt"
            size="big"
            endContent={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CreditsButton />
              <Notification />
            </View>}
            style={{
              paddingLeft: 16,
              paddingRight: 12,
              backgroundColor: Colors.background,
            }}
          />
          <Actions />
        </>}
        renderItem={({ item }) => {
          if (item.type === 'outfit')
            return (
              <SectionOutfits
                key={item.data.reduce((acc, outfit) => acc + outfit._id, '')}
                outfits={item.data}
                style={{ marginTop: 40 }}
              />)

          if (item.type === 'preset')
            return (
              <SectionPresets
                key={item.data.value}
                category={item.data}
                style={{ marginTop: 40 }}
              />
            )
          return null;
        }}
      />
    </BlurTargetView>
  )
}

const styles = StyleSheet.create({
  headerButtons: {
    width: '100%',
    height: '100%',
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
    flex: 1,
    borderTopWidth: 2,
    borderRadius: 32,
    gap: 8
  }
})