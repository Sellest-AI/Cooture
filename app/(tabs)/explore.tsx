import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { View } from "react-native";
import { Colors } from "theme";

export default function ExploreScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text.H1 color={Colors.foreground}>Explore</Text.H1>
      </View>
    </SafeAreaView>
  );
}
