import { ButtonSlider } from "@ui/button.slider";
import { Collection } from "@ui/cards";
import { Flame, Search } from "@ui/icons";
import { MasonryList } from "@ui/masonry-list";
import { AnimatePresence, MotiView } from "@ui/motion";
import { TextInput } from "@ui/text-input";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function Screen() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{
        marginTop: 8,
        paddingHorizontal: 12,
        marginBottom: Platform.OS === 'web' ? 0 : 52
      }}>
        <TextInput
          startIcon={Search}
          placeholder="Search style"
        />
      </View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 12 }}>
        <MasonryList
          data={[
            require('assets/placeholders/street-model.png'),
            require('assets/placeholders/can-model.png'),
            require('assets/placeholders/home-model.png'),
            require('assets/placeholders/tiger-model.png'),
            require('assets/placeholders/snow-model.png'),
            require('assets/placeholders/bench-model.png'),
            require('assets/placeholders/restaurant-model.png'),
          ]}
          style={{ columnGap: 36, paddingHorizontal: 12, marginTop: 24 }}
          renderItem={({ item, i }) => {
            return (
              <View style={{ marginBottom: 24, paddingTop: 3 }}>
                <Collection
                  selected={selected === i}
                  source={item as string}
                  contentFit="cover"
                  title="Style"
                  onPress={() => {
                    setSelected((p) => p === i ? null : i);
                  }}
                />
              </View>
            )
          }}
          numColumns={2}
        />
        <View style={{ height: 86 }} />
      </ScrollView>
      <AnimatePresence>
        {selected !== null && <MotiView
          style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 10 }}
          exitTransition={{ duration: 100 }}
        >
          <ButtonSlider
            startIcon={Flame}
            onComplete={() => router.replace(ROUTES.PHOTOSHOOT.GENERATIONS.ID('XXX'))}
          >
            Slide to generate
          </ButtonSlider>
        </MotiView>}
      </AnimatePresence>
    </View>
  )
}