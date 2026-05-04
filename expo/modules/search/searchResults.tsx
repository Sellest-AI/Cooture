import { ROUTES } from "@/hooks";
import { api, useQuery } from "@/lib/convex/client";
import { useTrackValues } from "@/lib/posthog";
import { Badge } from "@ui/badge";
import { Pressable } from "@ui/pressable";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { shuffleWithSeed } from "@utils/convex-allowed";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { useSafety } from "../safety";
import { SharedScreen } from "./sharedScreen";

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

type Props = {
  query?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}
export const SearchResults = ({ query, onLoadingChange }: Props) => {
  const hasQuery = !!query && query.trim().length > 0;

  const { data: users, isSuccess: isUsersSuccess } = useQuery(api.router.users.searchMany.authed, hasQuery ? { query } : 'skip');
  const { data: items, isSuccess: isItemsSuccess } = useQuery(api.router.items.searchMany.anon, hasQuery ? { query } : 'skip');
  const { data: outfits, isSuccess: isOutfitsSuccess } = useQuery(api.router.outfits.searchMany.anon, hasQuery ? { query } : 'skip');

  const isSuccess = isUsersSuccess && isItemsSuccess && isOutfitsSuccess;
  const showLoading = hasQuery && !isSuccess;

  useEffect(() => { onLoadingChange?.(showLoading); }, [showLoading, onLoadingChange]);

  useTrackValues('search_screen_query_submitted', {
    query,
    enabled: hasQuery && isSuccess
  });

  const [date] = useState(new Date().getMinutes());
  const { isHidden } = useSafety();
  const outfitsData = shuffleWithSeed(outfits?.filter((o) => !isHidden({ outfit: o, itemIds: o.items.map((i) => i.itemId) })) ?? [], date);
  const itemsData = shuffleWithSeed(items?.filter((i) => !isHidden({ item: i })) ?? [], date);

  return (
    <SharedScreen
      firstTab="Results"
      firstTabHeader={() => <View style={{ paddingHorizontal: 12 }}>
        {users?.slice(0, 7).map((u) => (
          <User
            key={u._id}
            style={{ marginBottom: 24 }}
            src={u.image}
            username={u.username}
            name={u.name}
            id={u._id}
          />
        ))}
        {!isSuccess && <>
          <UserSkeleton style={{ marginBottom: 24 }} />
          <UserSkeleton style={{ marginBottom: 24 }} />
          <UserSkeleton style={{ marginBottom: 24 }} />
          <View style={{ flexDirection: 'row', gap: 12, width: '100%', paddingRight: 12 }}>
            <Skeleton style={{ width: '50%', aspectRatio: 1 }} />
            <Skeleton style={{ width: '50%', aspectRatio: 1 }} />
          </View>
        </>}
      </View>}
      outfits={outfitsData}
      items={itemsData}
    />
  )
}