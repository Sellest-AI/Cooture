import { ROUTES, useRouter } from "@/hooks";
import { api, usePaginatedQuery, useQueryCached } from "@/lib/convex/client";
import { Block } from "@ui/block";
import { Bell, Loader } from "@ui/icons";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "theme";

type Props = {
  style?: ViewStyle;
}

export const Notification = ({ style }: Props) => {
  const { results: generations } = usePaginatedQuery(api.router.generations.getPaginated.authed, {}, { initialNumItems: 9 });
  const { data } = useQueryCached(api.router.notifications.getUnread.authed);
  const isLoading = generations.some(g => g.status === 'LOADING');
  const hasNewNotifications = isLoading || (data?.length ?? 0) > 0;

  const { push } = useRouter();

  return (
    <Pressable style={style}
      onPress={() => push(ROUTES.EXTRA.NOTIFICATIONS)}
    >
      <Block
        variant="blur"
        style={{
          borderRadius: 99,
          padding: 10,
        }}
      >
        <Bell size={24} color={Colors.foreground} />
      </Block>
      {(!isLoading && hasNewNotifications) && <Block
        variant="destructive"
        style={styles.badge}
      >
        <Text.Sm color={Colors.destructive[50]} weight={700}
          style={{ marginLeft: -4, marginTop: -2 }}
        >
          {data?.length ?? 0}
        </Text.Sm>
      </Block>}
      {isLoading && <Block
        variant="destructive"
        style={styles.badge}
      >
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginLeft: -2 }}>
          <Loader size={12} color={Colors.destructive[50]} />
        </View>
      </Block>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: 2,
    left: -8,
    borderRadius: 99,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  }
})