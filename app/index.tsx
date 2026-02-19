import { LogoLoading } from "@ui/icons";
import { View } from "react-native";
import { Colors } from "theme";

export default function Screen() {
  return <View style={{
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  }}>
    <LogoLoading size={120} />
  </View>
}