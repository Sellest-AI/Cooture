import { ROUTES, useRoute, useRouter } from "@/hooks";
import { api, Id, usePaginatedQuery } from "@/lib/convex/client";
import { Badge } from "@ui/badge";
import { EmptyBlock } from "@ui/block.empty";
import { FlashList } from "@ui/flat-list";
import { UserRoundCheck } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { Colors } from "theme";

export default function Screen() {
  const { id } = useRoute.Params<{ id: Id<'users'> }>();
  const { dismissTo, replace } = useRouter(ROUTES.USER.FOLLOWING);
  const { results, isLoading, loadMore } = usePaginatedQuery(api.router.users.follows.getFollowingPaginated.anon,
    id ? { userId: id } : "skip", { initialNumItems: 20 });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlashList
        ListHeaderComponent={
          <ModalHeader
            title="Following"
            style={{ marginBottom: 28, paddingTop: 12, paddingHorizontal: 4 }}
            onBack={router.canGoBack() ? () => router.back() : undefined}
          />
        }
        ListEmptyComponent={
          isLoading ? undefined : <EmptyBlock
            style={{ marginTop: 72 }}
            icon={UserRoundCheck}
            title="No following yet"
            description="Follow other users to see their content!"
            cta={{
              label: "Explore content",
              onPress: () => dismissTo(ROUTES.TABS.DISCOVER),
            }}
          />
        }
        onEndReached={() => loadMore(20)}
        data={results}
        keyExtractor={item => item._id}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => replace(ROUTES.USER.PATH, { pathParams: { id: item._id } })}
            style={{
              marginHorizontal: 12,
              marginBottom: 40,
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <Badge
              source={item.image ?? require('assets/backgrounds/dark-gradient.png')}
              style={{ width: 82, height: 82, marginBottom: 16 }}
            />
            <Text.Sm
              color={Colors.neutral[400]}
              style={{ textAlign: 'center', maxWidth: '90%' }}
              numberOfLines={1}
              weight={600}
            >
              @{item.username}
            </Text.Sm>
            <Text.Sm
              color={Colors.foreground}
              style={{ textAlign: 'center', maxWidth: '90%', marginTop: 2 }}
              numberOfLines={1}
              weight={600}
            >
              {item.name}
            </Text.Sm>
          </Pressable>
        )}
      />
    </SafeAreaView>
  )
}
