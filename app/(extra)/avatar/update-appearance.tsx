import { ROUTES, useRouter } from "@/hooks";
import { useAppearance } from "@/modules/profiles/_hooks/useAppearance";
import { Portrait } from "@/modules/profiles/portrait";
import { Block } from "@ui/block";
import { Button, BUTTON_HEIGHT } from "@ui/button";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Slider } from "@ui/slider";
import { Text } from "@ui/text";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Colors } from "theme";

const SizeBlock = ({ label, selected, onPress }: { label: string, selected?: boolean, onPress?: () => void }) => {
  return (
    <Pressable style={{ flex: 1, aspectRatio: 1 }} onPress={onPress}>
      <Block style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} variant={selected ? "primary" : "blur"}>
        <Text.Base weight={600} color={selected ? Colors.primary[900] : Colors.neutral[200]}>{label}</Text.Base>
      </Block>
    </Pressable>
  )
}

export default function Screen() {
  const { redirect } = useRouter('/avatar/update-appearance');

  const { heightCm, updateHeight } = useAppearance();
  const [innerHeight, setInnerHeight] = useState(heightCm || 0);
  useEffect(() => { if (heightCm) setInnerHeight(heightCm) }, [heightCm])

  const { size, updateSize } = useAppearance();
  const [innerSize, setInnerSize] = useState(size || "average");
  useEffect(() => { if (size) setInnerSize(size) }, [size])

  return (
    <View style={{ flex: 1 }}>
      <SafeScrollView style={{ flex: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: BUTTON_HEIGHT + 24 }}>
        <ModalHeader
          title="Update your appearance"
        />
        <Block
          variant="blur"
          style={{
            marginTop: 16,
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
          <Text.H4 color={Colors.neutral[50]}>Height</Text.H4>
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
          <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
            <SizeBlock label="Lean" selected={innerSize === "lean"} onPress={() => setInnerSize("lean")} />
            <SizeBlock label="Average" selected={innerSize === "average"} onPress={() => setInnerSize("average")} />
          </View>
          <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
            <SizeBlock label="Athletic" selected={innerSize === "athletic"} onPress={() => setInnerSize("athletic")} />
            <SizeBlock label="Muscular" selected={innerSize === "muscular"} onPress={() => setInnerSize("muscular")} />
          </View>
          <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
            <SizeBlock label="Heavy" selected={innerSize === "heavy"} onPress={() => setInnerSize("heavy")} />
            <SizeBlock label="Heavyset" selected={innerSize === "heavyset"} onPress={() => setInnerSize("heavyset")} />
          </View>
        </Block>
      </SafeScrollView>
      <SafeAreaView style={{ position: 'absolute', padding: 12, bottom: 0, width: '100%' }}>
        <Button
          variant="primary"
          onPress={async () => {
            if (!innerHeight) return;
            await updateHeight(innerHeight);
            await updateSize(innerSize);

            redirect({ fallbackTo: ROUTES.PROFILE.PATH });
          }}
        >
          Save appearance
        </Button>
      </SafeAreaView>
    </View>
  )
}