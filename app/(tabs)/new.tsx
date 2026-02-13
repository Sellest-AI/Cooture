import { useRouter } from "@/hooks";
import { api, useQueryCached } from "@/lib/convex/client";
import { Notification } from "@/modules/profiles/notification";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Button } from "@ui/button";
import { Collection } from "@ui/cards";
import { ArrowUpRight, ScanLine } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { FlatList, StyleSheet, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function Screen() {
  const { push } = useRouter('/new');

  const { data: presets } = useQueryCached(api.router.presets.getAll.anon);
  const { data: outfits } = useQueryCached(api.router.outfits.getAll.authed)

  return (
    <SafeScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: TOTAL_TABS_SPACE }}
      edges={{ top: 'padding', bottom: 'maximum' }}
    // stickyHeaderIndices={[0]}
    >
      <ModalHeader
        title="Create"
        type="alt"
        size="big"
        endContent={<Notification />}
        style={{
          paddingTop: 12,
          paddingHorizontal: 20,
          backgroundColor: Colors.background,
        }}
      />
      <Button
        variant="blur"
        onPress={() => push('/presets/new')}
        style={{ marginTop: 8, marginHorizontal: 12, marginBottom: 8 }}
      >
        New preset (Admin)
      </Button>
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
          onPress={() => {
            push(ROUTES.SCAN);
          }}
          style={{
            borderTopColor: Colors.primary[200],
            backgroundColor: Colors.primary[500],
            ...styles.headerButtons,
          }}
        >
          <ScanLine size={40} color={Colors.primary[900]} />
          <Text.Lg color={Colors.primary[900]} style={{ textAlign: 'center' }}>Scan an item</Text.Lg>
        </Pressable>
        <Pressable
          style={{
            ...styles.headerButtons,
            borderTopColor: Colors.secondary[200],
            backgroundColor: Colors.secondary[500],
          }}
          onPress={() => {
            push(ROUTES.MODALS.NEW_OUTFIT, {
              redirectTo: ROUTES.PROFILE.OUTFITS,
            });
          }}
        >
          <ArrowUpRight size={40} color={Colors.primary[900]} />
          <Text.Lg color={Colors.secondary[900]} style={{ textAlign: 'center' }}>New Outfit</Text.Lg>
        </Pressable>
      </View>
      <View style={{ marginTop: 32 }}>
        <Text.H4 color={Colors.foreground} style={{ marginLeft: 12 }}>
          Trending styles
        </Text.H4>
        {!presets && <View style={{
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
          contentOffset={{ x: 120, y: 0 }}
          data={(presets?.slice(0, 6) || [])}
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
      <View style={{ marginTop: 40 }}>
        <Text.H4 color={Colors.foreground} style={{ marginLeft: 12 }}>
          You next try on
        </Text.H4>
        {!outfits && <View style={{
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
          style={{ marginTop: 16, marginBottom: 32 }}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 32, paddingHorizontal: 16, paddingTop: 6 }}
          contentOffset={{ x: 120, y: 0 }}
          data={(outfits?.slice(0, 6) || [])}
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
    </SafeScrollView>
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