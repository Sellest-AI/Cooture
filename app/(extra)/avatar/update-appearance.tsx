import { ROUTES, useRouter } from "@/hooks";
import { useAppearance } from "@/modules/profiles/_hooks/useAppearance";
import { Portrait } from "@/modules/profiles/portrait";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { Slider } from "@ui/slider";
import { Text } from "@ui/text";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Colors } from "theme";
export default function Screen() {
  const { redirect } = useRouter('/avatar/update-appearance');

  const { heightCm, updateHeight } = useAppearance();
  const [innerHeight, setInnerHeight] = useState(heightCm || 0);
  useEffect(() => { if (heightCm) setInnerHeight(heightCm) }, [heightCm])

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ padding: 12, flex: 1 }}>
        <ModalHeader
          title="Update appearance"
        />
        <Block
          variant="blur"
          style={{
            borderRadius: 32,
            paddingHorizontal: 16,
            paddingVertical: 20,
            gap: 12,
          }}
        >
          <Text.H4 color={Colors.neutral[50]}>Portrait</Text.H4>
          <Text.Base color={Colors.neutral[400]}>Make sure your portrait images are up to date.</Text.Base>
          <Portrait />
        </Block>
        <Block
          variant="blur"
          style={{
            marginTop: 8,
            borderRadius: 32,
            paddingHorizontal: 16,
            paddingVertical: 20,
            gap: 12,
          }}
        >
          <Text.H4 color={Colors.neutral[50]}>Physical Appearance</Text.H4>
          <Text.Base color={Colors.neutral[400]}>Adjust your height with the slider below.</Text.Base>
          <Slider
            style={{ marginTop: 8 }}
            value={innerHeight || heightCm || 170}
            label="Height"
            labels={[
              { value: 150, label: '150cm' },
              { value: 160, label: '160cm' },
              { value: 170, label: '170cm' },
              { value: 180, label: '180cm' },
              { value: 190, label: '190cm' },
              { value: 200, label: '200cm' },
            ]}
            onValueChange={(_, closestValue) => { setInnerHeight(closestValue); }}
          />
        </Block>
      </SafeAreaView>
      <SafeAreaView style={{ position: 'absolute', padding: 12, bottom: 0, width: '100%' }}>
        <Button
          variant="primary"
          onPress={() => {
            if (!innerHeight) return;
            updateHeight(innerHeight)

            redirect({ fallbackTo: ROUTES.PROFILE.PATH });
          }}
        >
          Save appearance
        </Button>
      </SafeAreaView>
    </View>
  )
}