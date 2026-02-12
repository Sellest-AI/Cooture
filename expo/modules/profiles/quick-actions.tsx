import { ROUTES, useRouter } from '@/hooks';
import { Pressable } from '@ui/pressable';
import { Text } from '@ui/text';
import { ArrowUpRight, Camera } from "lucide-react-native";
import { StyleSheet, View, ViewProps } from "react-native";
import { Colors } from "theme";

type Props = ViewProps;

export const QuickActions = ({ style, ...props }: Props) => {
  const { push } = useRouter()

  return (
    <View
      {...props}
      style={[{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
      }, style]}
    >
      <Pressable
        style={{
          ...styles.headerButtons,
          borderTopColor: Colors.primary[200],
          backgroundColor: Colors.primary[500],
        }}
        onPress={() => {
          push(ROUTES.PHOTOSHOOT.NEW)
        }}
      >
        <Camera size={40} color={Colors.primary[900]} />
        <Text.Lg color={Colors.primary[900]}>Photoshoot</Text.Lg>
      </Pressable>
      <Pressable
        onPress={() => push(ROUTES.MODALS.NEW_OUTFIT)}
        style={{
          ...styles.headerButtons,
          borderTopColor: Colors.secondary[200],
          backgroundColor: Colors.secondary[500],
        }}
      >
        <ArrowUpRight size={40} color={Colors.primary[900]} />
        <Text.Lg color={Colors.secondary[900]}>New Outfit</Text.Lg>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
    flex: 1,
    borderTopWidth: 2,
    borderRadius: 28,
    gap: 8
  }
})