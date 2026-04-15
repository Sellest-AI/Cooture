import { useDebounce, useRouter } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import { Api, api, useQueryCached } from "@/lib/convex/client";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { useSearchPresets } from "@/modules/presets/_hooks";
import { Block } from "@ui/block";
import { BlurKeys, BlurTargetView } from "@ui/blur-view";
import { Button } from "@ui/button";
import { Collection } from "@ui/cards";
import { FlashList, FlashListRef } from "@ui/flat-list";
import { Col, Grid } from "@ui/grid";
import { ArrowRight, Loader, Search } from "@ui/icons";
import { AnimatePresence, MotiView } from "@ui/motion";
import { Pressable } from "@ui/pressable";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import React, { useRef, useState } from "react";
import { Platform, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const loading = false;

export default function Screen() {
  const { userId, isPremium } = useAccount();
  const { isAdmin } = useAccount.Admin();
  const { push } = useRouter('/photoshoot/create');
  const { setPresetId, presetId, outfitId, friendId } = usePhotoshoot.New();

  const [category, setCategory] = useState<Api['router']['presets']['getByCategory']['anon']['_args']['category'] | null>(friendId ? "DUO" : null);
  const { data: categories } = useQueryCached(api.router.presets.getCategories.anon);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 800);
  const query = search !== debouncedSearch ? '' : search;

  const { isLoading, presets } = useSearchPresets({ category, query, userId });

  const displayedPresets = outfitId ? presets.filter((p) => !p.hasMultipleSubjects) : presets;

  const listRef = useRef<FlashListRef<typeof displayedPresets[number] | string>>(null);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ marginTop: 8 }}>
        <TextInput
          startIcon={(isLoading && query) ? Loader : Search}
          placeholder="Search preset"
          style={{ marginHorizontal: 12 }}
          canClear
          value={search}
          onChangeText={(v) => {
            setSearch(v);
            if (v.length > 0) { setCategory(null); }
            listRef.current?.scrollToTop({ animated: true });
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <FlashList
          ref={listRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: presetId !== null ? 72 : 0,
          }}
          data={['header', 'new', ...(displayedPresets ?? [])]}
          keyExtractor={(item) => typeof item === 'string' ? item : item._id}
          stickyHeaderIndices={[0]}
          stickyHeaderHiddenOnScroll={true}
          stickyHeaderConfig={{
            useNativeDriver: true,
            hideRelatedCell: true,
            offset: 8
          }}
          overrideItemLayout={(layout, _, index) => { if (index === 0) layout.span = 2 }}
          numColumns={2}
          masonry
          ListFooterComponent={
            loading ? <>
              <Grid style={{ gap: 28, height: 3 * (200 + 28) }}>
                <Col style={{ gap: 28 }}>
                  <Skeleton style={{ flex: 1 }} />
                  <Skeleton style={{ flex: 1 }} />
                  <Skeleton style={{ flex: 1 }} />
                </Col>
                <Col style={{ gap: 28 }}>
                  <Skeleton style={{ flex: 1 }} />
                  <Skeleton style={{ flex: 1 }} />
                  <Skeleton style={{ flex: 1 }} />
                </Col>
              </Grid>
            </> : undefined
          }
          renderItem={({ item, index }) => {
            const sharedStyle = {
              marginBottom: 24,
              paddingTop: 3,
              marginLeft: Platform.OS === 'android' ? 12 : 20,
              marginRight: Platform.OS === 'android' ? 12 : 20,
              paddingHorizontal: 6
            }

            if (typeof item === 'string') {
              if (item === 'new') return (
                <View style={sharedStyle}>
                  <Collection
                    style={{ padding: Platform.OS === 'android' ? 6 : 0 }}
                    title="New preset"
                    onPress={() => {
                      if (isPremium || isAdmin) push(ROUTES.PRESETS.CREATE.PATH, { redirectHere: true })
                      else push(ROUTES.MODALS.UPGRADE);
                    }}
                  />
                </View>
              )

              if (item === 'header') return (
                <FlashList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    minHeight: 34,
                    paddingHorizontal: 12,
                    marginBottom: 24
                  }}
                  data={categories}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item, index }) => (
                    <Pressable
                      onPress={() => {
                        setCategory((c) => c === item.value ? null : item.value);
                        listRef.current?.scrollToTop({ animated: true });
                        setSearch('');
                      }}
                    >
                      <Block
                        blurKey={BlurKeys.PHOOTSHOOT_PRESETS_ITEMS}
                        variant={category === item.value ? 'primary' : 'blur'}
                        style={{
                          padding: 8,
                          paddingHorizontal: 16,
                          marginRight: (categories?.length ?? 0) - 1 === index ? 0 : 8,
                          borderRadius: 99,
                        }}
                      >
                        <Text.Base weight={500} color={category === item.value ? Colors.primary[900] : Colors.neutral[200]}>
                          {item.label}
                        </Text.Base>
                      </Block>
                    </Pressable>
                  )}
                />
              )

              return null;
            }

            const selected = presetId === item._id;

            return (
              <BlurTargetView
                blurKey={BlurKeys.PHOOTSHOOT_PRESETS_ITEMS}
                style={sharedStyle}
              >
                <Collection
                  selected={selected}
                  source={item.cover.sizes.medium.url}
                  style={{ padding: Platform.OS === 'android' ? 6 : 0 }}
                  contentFit="cover"
                  title={item.name}
                  onLongPress={() => {
                    push(ROUTES.PRESETS.ID.PATH, { pathParams: { id: item._id } });
                  }}
                  onPress={() => {
                    setPresetId((p) => p === item._id ? null : item._id);
                    if (!selected) requestAnimationFrame(() => push(ROUTES.PHOTOSHOOT.RECAP, { resetNextRoute: false }));
                  }}
                />
              </BlurTargetView>
            )
          }}
        />
      </View>
      <AnimatePresence>
        {presetId !== null && <MotiView
          style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 800 }}
          exit={{ opacity: 0, translateY: 10 }}
          exitTransition={{ duration: 100, delay: 0 }}
        >
          <Button
            style={{ marginTop: 12 }}
            variant="primary"
            endIcon={ArrowRight}
            onPress={() => push(ROUTES.PHOTOSHOOT.RECAP, { resetNextRoute: false })}
          >
            Next step
          </Button>
        </MotiView>}
      </AnimatePresence>
    </View>
  )
}