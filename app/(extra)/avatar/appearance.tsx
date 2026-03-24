import { ROUTES, useRouter } from "@/hooks";
import { useAppearance } from "@/modules/profiles/_hooks/useAppearance";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { FlashList, FlashListRef } from "@ui/flat-list";
import { BodySize, Female, Male } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import Odometer from "@ui/odometer";
import { Pressable } from "@ui/pressable";
import { SafeScrollView } from "@ui/safe-scroll-view";
import RulerSlider from "@ui/slider.ruler";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { Colors } from "theme";

const centimetersToFeet = (cm: number) => {
  const inches = cm / 2.54;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}'${remainingInches}`;
}

const SIZES = [
  { value: 0, label: "Lean", valueText: "lean" },
  { value: 2, label: "Average", valueText: "average" },
  { value: 4, label: "Athletic", valueText: "athletic" },
  { value: 6, label: "Muscular", valueText: "muscular" },
  { value: 8, label: "Heavy", valueText: "heavy" },
  { value: 10, label: "Heavyset", valueText: "heavyset" },
] as const;

type SizeValue = typeof SIZES[number]['valueText'];

const PhysicalAppearance = ({ value, onValueChange }: { value: SizeValue, onValueChange: (value: SizeValue) => void }) => {
  // Size
  const flashListRef = useRef<FlashListRef<number>>(null);

  const scrollToValue = (v: SizeValue) => {
    const index = SIZES.findIndex(s => s.valueText === v);
    const offsetIndex = index !== SIZES.length - 1 ? index - 1 : index; // if not last item, scroll to next item to show partial next item as visual cue of scrollability

    const viewOffset = offsetIndex <= 0 ? 0 : 72;

    flashListRef.current?.scrollToIndex({
      index: Math.max(0, offsetIndex),
      viewOffset: viewOffset,
      animated: true
    });
  }

  const handleSizeChange = (v: number) => {
    const matched = SIZES.find(s => s.value === v);
    if (!matched) return;

    onValueChange(matched.valueText);

    scrollToValue(matched.valueText);
  };

  return (
    <View>
      <View style={{ paddingHorizontal: 12 }}>
        <Text.H4 color={Colors.neutral[50]}>Physical Appearance</Text.H4>
      </View>
      <FlashList
        ref={flashListRef}
        horizontal
        style={{ marginTop: 24, minHeight: 172 }}
        onLoad={() => scrollToValue(value)}
        showsHorizontalScrollIndicator={false}
        data={[0, 2, 4, 6, 8, 10]}
        renderItem={({ index }) => {
          const selected = SIZES[index].valueText === value;

          return (
            <View
              style={{
                paddingHorizontal: 6,
                paddingLeft: index === 0 ? 12 : 6,
                paddingRight: index === SIZES.length - 1 ? 12 : 6,
              }}>
              <Pressable
                onPress={() => handleSizeChange(SIZES[index].value)}
                style={{
                  width: 148,
                  height: 172,
                }}
              >
                <Block
                  variant="blur"
                  style={{
                    backgroundColor: Colors.blur.dark,
                    borderRadius: 24,
                    opacity: selected ? 1 : 0.3,
                    padding: 12,
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BodySize
                    size={32}
                    fill={Colors.neutral[50]}
                    bodySize={SIZES[index].valueText}
                  />
                  <Text.Base
                    color={selected ? Colors.primary[500] : Colors.neutral[400]}
                    style={{ marginTop: 20, textAlign: 'center' }}
                    weight={600}
                  >
                    {SIZES[index].label}
                  </Text.Base>
                </Block>
              </Pressable>
            </View>
          )
        }}
      />
      {/* <View style={{ paddingHorizontal: 12 }}>
        <Slider
          style={{ marginTop: 20 }}
          value={SIZES.find(s => s.valueText === value)?.value ?? 0}
          onValueChange={handleSizeChange}
          label="Appearance"
          labels={[
            { value: 0, label: "Lean" },
            { value: 2, label: "Average" },
            { value: 4, label: "Athletic" },
            { value: 6, label: "Muscular" },
            { value: 8, label: "Heavy" },
            { value: 10, label: "Heavyset" },
          ]}
        />
      </View> */}
    </View>
  )
}

const GenderButton = ({ gender, onPress, selected }: { gender: string; onPress: () => void, selected: boolean }) => {
  const Icon = gender === "male" ? Male : Female;
  return (
    <Pressable style={{ flex: 1 }} onPress={onPress}>
      <Block variant={selected ? "primary" : "blur"}
        style={{ aspectRatio: 1, flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Icon size={48} color={selected ? Colors.primary[900] : Colors.neutral[50]} />
        <Text.Base
          weight={500}
          style={{ maxWidth: 96, textAlign: 'center', lineHeight: 18 }}
          color={selected ? Colors.primary[700] : Colors.neutral[400]}
        >
          {gender === "male" ? "Masculine" : "Feminine"} silhouette
        </Text.Base>
      </Block>
    </Pressable>
  )
}

export function Content() {
  const { redirect } = useRouter();

  // Height
  const { heightCm, updateHeight } = useAppearance();
  const [innerHeight, setInnerHeight] = useState(heightCm || 170);
  useEffect(() => { if (heightCm) setInnerHeight(heightCm) }, [heightCm])

  // Size
  const { size, updateSize } = useAppearance();
  const [innerSize, setInnerSize] = useState(size || "athletic");
  useEffect(() => { if (size) setInnerSize(size) }, [size])

  // Gender
  const { gender, updateGender } = useAppearance();
  const [innerGender, setInnerGender] = useState(gender || "female");
  useEffect(() => { if (gender) setInnerGender(gender) }, [gender])

  return (
    <SafeScrollView
      edges={{ bottom: 'android' }}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 12 : 0 }}
      style={{
        backgroundColor: Colors.background,
        flex: 1,
      }}
    >
      <ModalHeader
        onBack={router.canGoBack() ? router.back : undefined}
        title="Appearance"
        subtitle="Manage your physical appearance"
        style={{ marginBottom: 32, marginTop: 12, paddingHorizontal: 12 }}
      />

      <PhysicalAppearance
        value={innerSize}
        onValueChange={(v) => setInnerSize(v)}
      />

      {/* Sex */}
      <View style={{ marginTop: 36, paddingHorizontal: 12 }}>
        <View>
          <Text.H4 color={Colors.neutral[50]}>
            Your body type
          </Text.H4>
          <Text.Base color={Colors.neutral[400]} style={{ marginTop: 8 }}>
            So we generate outfits that actually fit your silhouette
          </Text.Base>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <GenderButton
            gender="male"
            selected={innerGender === "male"}
            onPress={() => setInnerGender("male")}
          />
          <GenderButton
            gender="female"
            selected={innerGender === "female"}
            onPress={() => setInnerGender("female")}
          />
        </View>
      </View>


      {/* Height */}
      <View style={{ marginTop: 40, marginBottom: 20 }}>
        <View style={{ paddingHorizontal: 12 }}>
          <Text.H4 color={Colors.neutral[50]}>
            Height
            <Text.Base color={Colors.neutral[400]} style={{ marginLeft: 8, marginTop: 8 }}>
              ({centimetersToFeet(innerHeight)})
            </Text.Base>
          </Text.H4>
        </View>
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Odometer
            value={innerHeight}
            suffix={`cm`}
            color={Colors.primary[500]}
            style={{ marginBottom: 24 }}
          />
          <RulerSlider
            key={heightCm}
            initialValue={innerHeight}
            minValue={140}
            maxValue={220}
            onValueChange={(v) => setInnerHeight(v)}
            color={Colors.primary[500]}
          />
        </View>
      </View>

      <View style={{
        justifyContent: 'flex-end',
        padding: 12,
        marginTop: 12,
        flex: 1,
      }}
      >
        <Button
          variant="primary"
          onPress={async () => {
            if (!innerHeight) return;
            await updateHeight(innerHeight);
            await updateSize(innerSize);
            await updateGender(innerGender);

            redirect({ fallbackTo: ROUTES.PROFILE.PATH });
          }}
        >
          Save appearance
        </Button>
      </View>
    </SafeScrollView>
  )
}


export default function Screen() {
  return <Content />
}