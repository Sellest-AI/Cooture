import { ROUTES, useRouter } from "@/hooks"
import { api, Id } from "@/lib/convex/api"
import { useAccount } from "@/lib/convex/auth"
import { useMutation, useQuery, useQueryCached, useQueryCachedData } from "@/lib/convex/client"
import { Block } from "@ui/block"
import { UserRoundCheck, UserRoundPlus } from "@ui/icons"
import { Pressable } from "@ui/pressable"
import { Skeleton } from "@ui/skeleton"
import { Text } from "@ui/text"
import { MotiView } from "moti"
import { useState } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { Colors } from "theme"

const sanitizeDisplay = (_value: number) => {
  const value = Math.max(0, _value); // Ensure we don't display negative numbers
  // Add K for thousands, M for millions, etc.
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + "M";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + "K";
  }
  return value.toString();
}

type Props = {
  userId: Id<'users'>;
  style?: ViewStyle;
}

export const FollowersFollowing = ({ style, userId }: Props) => {
  const [animateFollow, setAnimateFollow] = useState(false);
  const [justFollowed, setJustFollowed] = useState(0);

  const { user: self } = useAccount();
  const { push } = useRouter(ROUTES.USER.PATH);

  const { data: user } = useQuery(api.router.users.getAccount.anon, { userId });
  const { data: stats } = useQueryCachedData(api.router.users.follows.getFollowStats.anon, { userId, key: "followStats" });
  const { data: followCheck } = useQueryCached(api.router.users.follows.checkFollowing.authed, self && self._id !== userId ? { targetUserId: userId } : "skip");
  const { mutate: toggleFollow, isLoading: isToggling } = useMutation(api.router.users.follows.toggleFollow.authed);

  const isSelf = self?._id === userId;

  if (!user) return (
    <View style={{ flexDirection: 'row', gap: 8, ...style }}>
      <Skeleton style={{ ...styles.SharedButtons, height: 92 }} />
      <Skeleton style={{ ...styles.SharedButtons, height: 92 }} />
    </View>
  )

  if (isSelf)
    return (
      <View style={{ flexDirection: 'row', gap: 8, ...style }}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => push(ROUTES.USER.FOLLOWERS, { pathParams: { id: userId } })}
        >
          <Block variant="primary" style={{ ...styles.SharedButtons }}>
            <UserRoundPlus color={Colors.primary[900]} size={28} />
            <View>
              <Text.H4 color={Colors.primary[900]} weight={600}>
                {sanitizeDisplay(stats?.followersCount ?? 0)}
              </Text.H4>
              <Text.Sm color={Colors.primary[700]} weight={600} style={{ marginTop: 1 }}>
                Followers
              </Text.Sm>
            </View>
          </Block>
        </Pressable>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => push(ROUTES.USER.FOLLOWING, { pathParams: { id: userId } })}
        >
          <Block variant="secondary" style={{ ...styles.SharedButtons }}>
            <UserRoundCheck color={Colors.secondary[900]} size={28} />
            <View>
              <Text.H4 color={Colors.secondary[900]} weight={600}>
                {sanitizeDisplay(stats?.followingCount ?? 0)}
              </Text.H4>
              <Text.Sm color={Colors.secondary[700]} weight={600} style={{ marginTop: 1 }}>
                Following
              </Text.Sm>
            </View>
          </Block>
        </Pressable>
      </View>
    )

  const isFollowing = followCheck?.isFollowing;

  return (
    <View style={{ flexDirection: 'row', gap: 8, ...style }}>
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          toggleFollow({ targetUserId: userId });
          if (!isFollowing) {
            setAnimateFollow(true);
            setJustFollowed(prev => prev + 1);
            setTimeout(() => setAnimateFollow(false), 2500);
          } else {
            setJustFollowed((prev) => prev - 1);
          }
        }}
        disabled={isToggling}
      >
        <Block
          style={{ ...styles.SharedButtons }}
          variant={isFollowing ? "secondary" : "primary"}
        >
          <View>
            <Text.H4
              color={isFollowing ? Colors.secondary[900] : Colors.primary[900]}
              style={{ textAlign: 'center' }}
              weight={600}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Text.H4>
            <Text.Sm
              color={isFollowing ? Colors.secondary[700] : Colors.primary[700]}
              style={{ textAlign: 'center', marginTop: 1 }}
              weight={600}
            >
              {user?.name}
            </Text.Sm>
          </View>
        </Block>
      </Pressable>
      <MotiView
        key={animateFollow ? "animate" : "static"}
        style={{ flex: undefined }}
        from={animateFollow ? { width: 135 } : undefined}
        animate={animateFollow ? {
          width: [135, 0, 0, 0, 0, 135],
          height: [93, 112, 93, 93, 93, 93],
          opacity: [1, 0, 0, 0, 1],
        } : undefined}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => push(ROUTES.USER.FOLLOWERS, { pathParams: { id: userId } })}
        >
          <Block variant="blur"
            style={{
              ...styles.SharedButtons,
              paddingLeft: 18,
              paddingRight: 24,
              flexDirection: 'row',
              gap: 14
            }}
          >
            <UserRoundPlus color={Colors.neutral[200]} size={28} />
            <View>
              <Text.H4 color={Colors.neutral[50]} weight={600}>
                {sanitizeDisplay((stats?.followersCount ?? 0) + justFollowed)}
              </Text.H4>
              <Text.Sm color={Colors.neutral[400]} weight={600} style={{ marginTop: 2 }}>
                Followers
              </Text.Sm>
            </View>
          </Block>
        </Pressable>
      </MotiView>
    </View>
  )
}

const styles = StyleSheet.create({
  SharedButtons: {
    paddingTop: 28,
    paddingLeft: 12,
    paddingRight: 20,
    paddingBottom: 28,
    justifyContent: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  }
})