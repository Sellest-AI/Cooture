import { useDebounce, useRouter } from "@/hooks";
import { api, useQuery } from "@/lib/convex/client";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Badge } from "@ui/badge";
import { FlashList } from "@ui/flat-list";
import { Loader, Search } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, View, ViewStyle } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

type UserProps = {
  style?: ViewStyle;
  src?: string;
  username?: string;
  name?: string;
  id: string;
}

const User = ({ style, src, username, name, id }: UserProps) => {
  const { push } = useRouter();
  return (
    <Pressable
      onPress={() => push(ROUTES.ADMIN.USERS.ID.PATH, { pathParams: { id } })}
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

export default function Screen() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 800);
  const query = search !== debouncedSearch ? '' : search;

  const hasQuery = query.length > 0;
  const { data: searchedUsers, isSuccess: isUsersSuccess } = useQuery(api.router.users.searchMany.authed, hasQuery ? { query } : 'skip');
  const { data: latestUsers } = useQuery(api.router.admin.users.getLatests.admin);

  const showLoading = hasQuery && !isUsersSuccess || !latestUsers;

  const users = hasQuery ? searchedUsers : latestUsers;

  return (
    <SafeScrollView
      contentContainerStyle={{
        paddingTop: Platform.OS !== 'ios' ? 12 : 0,
        paddingHorizontal: 12,
        paddingBottom: TOTAL_TABS_SPACE
      }}
      edges={{ bottom: 'android' }}
    >
      <ModalHeader
        title="Users"
        onBack={router.canGoBack() ? router.back : undefined}
      />
      <TextInput
        startIcon={showLoading ? Loader : Search}
        canClear
        autoFocus
        value={search}
        onChangeText={setSearch}
        style={{ flex: 1 }}
      />
      <FlashList
        scrollEnabled={!showLoading}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={showLoading ? <>
          <UserSkeleton style={{ marginBottom: 24 }} />
          <UserSkeleton style={{ marginBottom: 24 }} />
          <UserSkeleton style={{ marginBottom: 24 }} />
        </> : undefined}
        style={{ paddingHorizontal: 4 }}
        contentContainerStyle={{ paddingTop: 24 }}
        data={users?.map((user) => ({
          _id: user._id,
          username: user.username,
          name: user.name,
          image: "image" in user ? user.image : user.imageUrl
        }))}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => {
          return (
            <User
              key={item._id}
              style={{ marginBottom: 24 }}
              src={item.image}
              username={item.username}
              name={item.name}
              id={item._id}
            />
          )
        }}

      />
    </SafeScrollView>
  )
}