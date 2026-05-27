import { API_CONSTANTS } from "@/lib/convex/api";
import { useSearchItems } from "@/modules/items/_hooks/useSearchItems";
import { Button, BUTTON_HEIGHT } from "@ui/button";
import { FlashList } from "@ui/flat-list";
import { Check, Dices, Frown } from "@ui/icons";
import { Image } from "@ui/image";
import { Modal } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Switch } from "@ui/switch";
import { Text } from "@ui/text";
import { useToasts } from "@ui/toast";
import { shuffleArray } from "@utils/convex-allowed";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { useDailyOutfit } from "../_hooks/useDailyOutfit";


type PaletteProps = {
  name?: string;
  colors: string[];
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}
const Palette = ({ name, colors, selected, onPress, style }: PaletteProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: selected ? Colors.primary[500] : Colors.blur.dark,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        ...style
      }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: selected ? 0.5 : 1,
      }}>
        {colors.map((color, index) => {
          return (
            <View
              key={color}
              style={{
                width: 24,
                height: 32,
              }}
            >
              <View
                key={color}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 99,
                  backgroundColor: color
                }}
              />
            </View>
          )
        })}
      </View>
      {name && (<Text.Base color={selected ? Colors.primary[500] : Colors.neutral[400]} weight={500}>
        {name}
      </Text.Base>)}
      {selected && <Check
        size={20}
        color={Colors.primary[500]}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
        }}
      />}
    </Pressable>
  )
}

type OutfitStyleProps = {
  name: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}
const OutfitStyle = ({ name, selected, onPress, style }: OutfitStyleProps) => {
  const { results, isEmpty } = useSearchItems({ query: name, channel: 'public' });
  const resultsRandomized = shuffleArray(results, name);

  return (
    <Pressable
      disabled={isEmpty}
      onPress={onPress}
      style={{
        padding: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: selected ? Colors.primary[500] : Colors.blur.dark,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        opacity: isEmpty ? 0.3 : 1,
        ...style
      }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: selected ? 0.5 : 1,
        height: 56,
      }}>
        {resultsRandomized.filter((p) => p.position !== 'LEGWEAR').slice(0, 3).map((item) => {
          return (
            <View
              key={item._id}
              style={{
                width: 48,
                height: '100%',
              }}
            >
              <Image
                source={item.image.sizes.thumbnail.url}
                contentFit="contain"
                style={{
                  width: 56,
                  height: '100%',
                }}
              />
            </View>
          )
        })}
      </View>
      {name && (<Text.Base color={selected ? Colors.primary[500] : Colors.neutral[400]} weight={500}>
        {name}
      </Text.Base>)}
      {selected && <Check
        size={24}
        color={Colors.primary[500]}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
        }}
      />}
    </Pressable>
  )
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RandomizerSettingsModal = ({ open, onOpenChange }: Props) => {
  const { settings, allowPublicOutfits, setAllowPublicOutfits, updateSeed,
    palettes, setPalettes, styles, setStyles, randomize } = useDailyOutfit.Settings();
  const { addToast } = useToasts();

  const OUTFIT_PALETTES = settings ? settings.palettes : API_CONSTANTS.OUTFIT_PALETTES;
  const OUTFIT_STYLES = settings ? settings.styles : API_CONSTANTS.ITEM_STYLES;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      header={{
        title: 'Randomize',
        customBackIcon: 'x'
      }}
      style={{ paddingHorizontal: 0 }}
      stickyFooter={
        <SafeAreaView style={{
          position: 'absolute',
          bottom: 16,
          left: 12,
          right: 12
        }}>
          <Button
            onPress={async () => {
              updateSeed();
              const result = await randomize();
              onOpenChange(false);
              if (!result) {
                addToast({
                  icon: Frown,
                  title: "No outfit found",
                  description: "Try changing your settings to get more outfit combinations.",
                  durationS: 5,
                  type: "error",
                })
                updateSeed();
              }
            }}
            style={{ marginTop: 16 }}
            variant="secondary"
            startIcon={Dices}
          >
            Randomize
          </Button>
        </SafeAreaView>
      }
    >
      <View>
        <View style={{
          display: 'none',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 12,
        }}>
          <Text.Base color={Colors.neutral[400]} weight={500}>
            {allowPublicOutfits ? 'Discover outfits from the community' :
              'Only get outfits based on your closet'}
          </Text.Base>
          <View>
            <Switch value={allowPublicOutfits} onValueChange={setAllowPublicOutfits} />
          </View>
        </View>
        <Text.Lg color={Colors.neutral[400]} style={{ marginLeft: 12, marginTop: 16 }}>
          Palettes
        </Text.Lg>
        {[OUTFIT_PALETTES.slice(0, 6), OUTFIT_PALETTES.slice(6, 16), OUTFIT_PALETTES.slice(16)]
          .filter((v) => v.length > 0).map((v, i) => <FlashList
            key={v.map((v) => v.name).join(',')}
            style={{ marginTop: i > 0 ? 12 : 16 }}
            contentContainerStyle={{ paddingLeft: 12, paddingRight: 4 }}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.name}
            data={v}
            renderItem={({ item }) => {
              return (
                <Palette
                  selected={palettes.some(p => p.colors.join(',') === item.colors.join(','))}
                  onPress={() => {
                    setPalettes((prev) => {
                      if (prev.some(p => p.colors.join(',') === item.colors.join(','))) {
                        return prev.filter(p => p.colors.join(',') !== item.colors.join(','));
                      } else {
                        return [...prev, item];
                      }
                    })
                  }}
                  name={item.name}
                  colors={item.colors}
                  style={{ marginRight: 8, }}
                />
              )
            }}
          />)}
        <Text.Lg color={Colors.neutral[400]} style={{ marginLeft: 12, marginTop: 16 }}>
          Styles
        </Text.Lg>
        <FlashList
          numColumns={2}
          scrollEnabled={false}
          overScrollMode="never"
          style={{ marginTop: 16, marginBottom: BUTTON_HEIGHT + 16 }}
          contentContainerStyle={{ paddingLeft: 12, paddingRight: 4 }}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          data={OUTFIT_STYLES}
          renderItem={({ item }) => {
            return (
              <OutfitStyle
                name={item}
                style={{ marginRight: 8, marginBottom: 8 }}
                selected={styles.includes(item)}
                onPress={() => {
                  setStyles((prev) => {
                    if (prev.includes(item))
                      return prev.filter(p => p !== item);
                    else return [...prev, item];
                  })
                }}
              />
            )
          }}
        />
      </View>
    </Modal>
  )
}