import { useRouter } from "@/hooks";
import { api, usePaginatedQuery, useQuery } from "@/lib/convex/client";
import { KeyboardAvoiderView } from "@good-react-native/keyboard-avoider";
import { Badge } from "@ui/badge";
import { EmptyBlock } from "@ui/block.empty";
import { Loader, Search, User } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { Colors } from "theme";

export default function Screen() {
  const { redirect } = useRouter('/pick-user');
  const { results, loadMore } = usePaginatedQuery(
    api.router.users.follows.getWithAppearancePaginated.authed, {}, { initialNumItems: 20 });

  const [query, setQuery] = useState('');
  const { data: searchResults, isPending } = useQuery(api.router.users.searchMany.authed, query.length > 0 ? { query } : 'skip');
  const isLoading = isPending && query.length > 0;

  const users = query.length > 0 ? searchResults : results;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 12,
        }}
        onEndReached={() => loadMore(20)}
        data={users}
        keyExtractor={item => item._id}
        numColumns={3}
        ListHeaderComponent={<ModalHeader
          title="Select a friend"
          style={{ marginBottom: 24 }}
          onBack={router.canGoBack() ? router.back : undefined}
        />}
        ListEmptyComponent={<EmptyBlock
          icon={User}
          title="No friend found"
          description="Follow some friends to see them here"
          style={{ minHeight: 432 }}
        />}
        // style={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => redirect({ params: { userId: item._id } })}
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
      <KeyboardAvoiderView
        extraSpace={112}
        style={{ padding: 12, paddingTop: 0 }}
      >
        <TextInput
          startIcon={isLoading ? Loader : Search}
          onBlur={setQuery}
          canClear
          placeholder="Search"
        />
      </KeyboardAvoiderView>
    </View>
  )
}