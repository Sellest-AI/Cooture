import { ROUTES, useRouter } from "@/hooks";
import { api, useQuery } from "@/lib/convex/client";
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
  const { data } = useQuery(api.router.generations.getAll.authed);
  const generations = data ?? [];
  const newGenerations = generations.filter(g => g.status === 'PENDING');
  const hasNewNotifications = newGenerations.length > 0;
  const isLoading = generations.some(g => g.status === 'LOADING');

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
          {newGenerations.length}
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