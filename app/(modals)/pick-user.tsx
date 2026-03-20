import { useRouter } from "@/hooks";
import { api, usePaginatedQuery } from "@/lib/convex/client";
import { Badge } from "@ui/badge";
import { Search } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import { FlatList, View } from "react-native";
import { Colors } from "theme";

export default function Screen() {
  const { redirect } = useRouter('/pick-user');
  const { results, loadMore } = usePaginatedQuery(api.router.users.follows.getRelatedPaginated.authed, {}, { initialNumItems: 20 });

  return (
    <View style={{ padding: 12, flex: 1 }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8 }}
        onEndReached={() => loadMore(20)}
        data={results}
        keyExtractor={item => item._id}
        numColumns={3}
        ListHeaderComponent={
          <>
            <ModalHeader
              title="Select a friend"
              style={{ marginBottom: 8 }}
            />
            <TextInput
              startIcon={Search}
              placeholder="Search"
              style={{ marginBottom: 32 }}
            />
          </>
        }
        // style={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => redirect({ params: { userId: item._id } })}
            style={{
              marginBottom: 40,
              marginHorizontal: 12,
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <Badge
              source={item.image ?? require('assets/backgrounds/dark-gradient.png')}
              style={{ width: 92, height: 92, marginBottom: 16 }}
            />
            <Text.Sm
              color={Colors.neutral[400]}
              style={{ textAlign: 'center', maxWidth: '90%' }}
              numberOfLines={1}
              weight={600}
            >
              @{item.username}
            </Text.Sm>
            <Text.Base
              color={Colors.foreground}
              style={{ textAlign: 'center', maxWidth: '90%' }}
              numberOfLines={1}
              weight={600}
            >
              {item.name}
            </Text.Base>
          </Pressable>
        )}
      />
    </View>
  )
}