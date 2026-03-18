import { useRoute, useRouter } from "@/hooks";
import { api, Id, useAction, useQuery, useQueryCachedData } from "@/lib/convex/client";
import { Badge } from "@ui/badge";
import { BUTTON_HEIGHT } from "@ui/button";
import { ButtonSlider } from "@ui/button.slider";
import { Collection } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { Camera } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Colors } from "theme";

type PresetsProps = {
  onSelect: (args: { presetId: Id<'presets'>, type: 'single' | 'duo' }) => void;
  presetId: Id<'presets'> | null;
}
const Presets = ({ onSelect, presetId }: PresetsProps) => {
  const { data: presets } = useQuery(api.router.presets.getAll.anon, {});

  useEffect(() => {
    if (!presets) return;
    if (presets.length === 0) return;
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    onSelect({ presetId: randomPreset._id, type: randomPreset.hasMultipleSubjects ? 'duo' : 'single' });
  }, [presets, onSelect])

  const currentScrollIndex = presets?.findIndex(p => p._id === presetId) ?? 0;

  return (
    <View style={{ marginTop: 16 }}>
      <Text.H4 color={Colors.neutral[50]} style={{ marginHorizontal: 12 }}>
        Preset
      </Text.H4>
      <FlashList
        data={presets}
        keyExtractor={(item) => item._id}
        key={`${currentScrollIndex}`}
        horizontal
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 16 }}
        initialScrollIndex={Math.max(0, currentScrollIndex - 1)}
        renderItem={({ item }) => (
          <View style={{ marginHorizontal: 16 }}>
            <Collection
              onPress={() => onSelect({ presetId: item._id, type: item.hasMultipleSubjects ? 'duo' : 'single' })}
              style={{ width: 120 }}
              source={item.cover.sizes.medium.url}
              title={item.name}
              selected={item._id === presetId}
            />
          </View>
        )}
      />
    </View>
  )
}

const Duo = ({ onSelect, userId }: { onSelect: (userId: Id<'users'>) => void, userId: Id<'users'> | null }) => {
  const { data: bots } = useQuery(api.router.admin.bots.getAll.admin);

  useEffect(() => {
    if (!bots) return;
    if (bots.length === 0) return;
    const randomBot = bots[Math.floor(Math.random() * bots.length)];
    onSelect(randomBot._id);
  }, [bots, onSelect])

  const currentScrollIndex = bots?.findIndex(b => b._id === userId) ?? 0;

  return (
    <View style={{ marginTop: 36 }}>
      <Text.H4 color={Colors.neutral[50]} style={{ marginHorizontal: 12 }}>
        Duo
      </Text.H4>
      <FlashList
        data={bots}
        keyExtractor={(item) => item._id}
        key={`${currentScrollIndex}`}
        horizontal
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8 }}
        style={{ marginTop: 16 }}
        initialScrollIndex={Math.max(0, currentScrollIndex - 1)}
        renderItem={({ item }) => {
          const selected = item._id === userId;
          return (
            <Pressable
              style={{ marginHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => onSelect(item._id)}
            >
              <View style={{
                borderRadius: 99,
                backgroundColor: selected ? Colors.primary[500] : undefined
              }}>
                <Badge
                  source={item.image ?? require('assets/backgrounds/dark-gradient.png')}
                  style={{
                    width: 92,
                    height: 92,
                    opacity: selected ? 0.7 : 1,
                  }}
                />
              </View>
              <Text.Base
                style={{ marginTop: 12, maxWidth: 92 }}
                color={selected ? Colors.primary[500] : Colors.neutral[400]}
                numberOfLines={1}
              >
                @{item.username}
              </Text.Base>
            </Pressable>
          )
        }}
      />
    </View>
  )
}

const Outfits = ({ onSelect, outfitId }: { onSelect: (outfitId: Id<'outfits'> | null) => void, outfitId: Id<'outfits'> | null }) => {
  const { data: outfits } = useQueryCachedData(api.router.outfits.getLatest.anon, { key: 'latestOutfits' });

  useEffect(() => {
    if (!outfits) return;
    if (outfits.length === 0) return;
    const randomOutfit = outfits[Math.floor(Math.random() * outfits.length)];
    onSelect(randomOutfit._id);
  }, [outfits, onSelect])

  const currentScrollIndex = outfits?.findIndex(p => p._id === outfitId) ?? 0;

  return (
    <View style={{ marginTop: 36 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 12 }}>
        <Text.H4 color={Colors.neutral[50]}>
          Outfit
        </Text.H4>
        <Pressable onPress={() => onSelect(null)}>
          <Text.Base color={Colors.neutral[400]} weight={600}>
            Remove
          </Text.Base>
        </Pressable>
      </View>
      <FlashList
        data={outfits}
        keyExtractor={(item) => item._id}
        key={`${currentScrollIndex}`}
        horizontal
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8 }}
        style={{ marginTop: 16 }}
        initialScrollIndex={Math.max(0, currentScrollIndex - 1)}
        renderItem={({ item }) => {
          const selected = item._id === outfitId;

          return (
            <View style={{ marginHorizontal: 16 }}>
              <Collection
                onPress={() => onSelect(selected ? null : item._id)}
                style={{ width: 120 }}
                contentFit="contain"
                backgroundColor={item.backgroundColor}
                source={item.cover.sizes.medium.url}
                title={item.name}
                selected={selected}
              />
            </View>
          )
        }}
      />
    </View>
  )
}

export default function Screen() {
  const [showDuo, setShowDuo] = useState(false);
  const [showOutfit, setShowOutfit] = useState(false);

  const { userId } = useRoute('/admin/bots/generate');
  const [presetId, setPresetId] = useState<Id<'presets'> | null>(null);
  const [duoId, setDuoId] = useState<Id<'users'> | null>(null);
  const [outfitId, setOutfitId] = useState<Id<'outfits'> | null>(null);

  const { dismissTo } = useRouter();
  const { action } = useAction(api.llm.triggers.photoshoot.admin);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={{ top: 'off' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: BUTTON_HEIGHT + 48 }}
        showsVerticalScrollIndicator={false}
      >
        <ModalHeader
          onBack={router.canGoBack() ? router.back : undefined}
          style={{ marginHorizontal: 12, marginTop: 16 }}
          title="New Generation"
        />
        <Presets onSelect={(args) => {
          setPresetId(args.presetId);
          if (args.type === 'single') setDuoId(null);
          if (args.type === 'duo') setOutfitId(null);
          setShowDuo(args.type === 'duo');
          setShowOutfit(args.type === 'single');
        }}
          presetId={presetId}
        />
        {showDuo && <Duo onSelect={setDuoId} userId={duoId} />}
        {showOutfit && <Outfits onSelect={setOutfitId} outfitId={outfitId} />}
      </ScrollView>
      <SafeAreaView
        edges={{ top: 'off' }}
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12
        }}
      >
        <ButtonSlider
          disabled={!userId}
          startIcon={Camera}
          onComplete={async () => {
            if (!presetId) return;
            if (!userId) return;

            const generationId = await action({
              userId: userId,
              presetId: presetId,
              numberToGenerate: 2,
              extraUserIds: duoId ? [duoId] : undefined,
              outfit: outfitId ? {
                _id: outfitId,
                size: "LOOSE"
              } : undefined,
            });

            dismissTo(`/admin/bots/generations/[id]`, { pathParams: { id: generationId } });
          }}
        >
          Slide to generate
        </ButtonSlider>
      </SafeAreaView>
    </SafeAreaView>
  )
}