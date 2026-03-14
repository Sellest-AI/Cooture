import { ROUTES, useDebounce } from "@/hooks";
import { api, useQuery } from "@/lib/convex/client";
import { Badge } from "@ui/badge";
import { Block } from "@ui/block";
import { FlashList } from "@ui/flat-list";
import { ArrowLeft, Search } from "@ui/icons";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import { router } from "expo-router";
import { useState } from "react";
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
          width={128}
          height={16}
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
        <Text.Lg
          color={Colors.neutral[50]}
        >
          {username}
        </Text.Lg>
        <Text.Base
          color={Colors.neutral[400]}
          style={{ marginTop: 6 }}
        >
          {name}
        </Text.Base>
      </View>
    </Pressable>
  )
}

export default function Screen() {
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 800);
  const query = search !== debouncedSearch ? '' : search;

  const hasQuery = query.length > 0;
  const { data, isSuccess } = useQuery(api.router.users.searchMany.authed, hasQuery ? { query } : 'skip');

  const showLoading = search && !isSuccess;

  return (
    <SafeAreaView style={{
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
          focusOnLayout
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1 }}
        />
      </View>
      <FlashList
        ListEmptyComponent={showLoading ? <>
          <UserSkeleton style={{ marginBottom: 24 }} />
          <UserSkeleton style={{ marginBottom: 24 }} />
          <UserSkeleton style={{ marginBottom: 24 }} />
        </> : undefined}
        style={{
          marginTop: 24,
          paddingHorizontal: 4
        }}
        data={data}
        renderItem={({ item }) => (
          <User
            style={{ marginBottom: 24 }}
            src={item.imageUrl}
            username={item.username}
            name={item.name}
            id={item._id}
          />
        )}
      />
    </SafeAreaView>
  )
}