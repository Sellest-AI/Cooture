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
  const { results, isLoading, loadMore } = usePaginatedQuery(api.router.users.getRelated.authed, {}, { initialNumItems: 20 });

  return (
    <View style={{ padding: 12, flex: 1 }}>
      <View style={{
        height: 6,
        width: 96,
        backgroundColor: Colors.blur.medium,
        borderRadius: 99,
        marginBottom: 20,
        alignSelf: 'center'
      }} />
      <ModalHeader
        title="Select a friend"
        style={{ marginBottom: 20 }}
      />
      <FlatList
        onEndReached={() => loadMore(20)}
        data={results}
        keyExtractor={item => item._id}
        numColumns={2}
        // style={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => redirect({ params: { userId: item._id } })}
            style={{
              marginHorizontal: 12,
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <Badge
              source={item.image ?? require('assets/backgrounds/dark-gradient.png')}
              style={{ width: 96, height: 96, marginBottom: 16 }}
            />
            <Text.Sm
              color={Colors.neutral[400]}
              style={{ textAlign: 'center' }}
              weight={600}
            >
              @{item.username}
            </Text.Sm>
            <Text.Lg
              color={Colors.foreground}
              style={{ textAlign: 'center' }}
            >
              {item.name}
            </Text.Lg>
          </Pressable>
        )}
      />
      <TextInput
        startIcon={Search}
        placeholder="Search"
      />
    </View>
  )
}