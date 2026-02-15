import { SavedOutfits } from "@/modules/collection/saved-outfits";
import { SavedPosts } from "@/modules/collection/saved-posts";
import { CreditsButton } from "@/modules/premium/credits.button";
import { PremiumBlock } from "@/modules/premium/premium-block";
import { Notification } from "@/modules/profiles/notification";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Quest } from "@ui/cards";
import { Check } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Text } from "@ui/text";
import { useMemo } from "react";
import { FlatList, View, ViewStyle } from "react-native";
import { Colors } from "theme";

const PADDING_HORIZONTAL = 12;

const Quests = ({ style }: { style?: ViewStyle }) => {
  const Item = useMemo(() => function ChildItem() {
    return (
      <Quest
        style={{ width: 132 }}
        source={require('assets/placeholders/quests/heart.png')}
        title="Look at my pic!"
        description="published posts"
        progress={{ completed: 1, total: 8 }}
      />
    )
  }, []);

  const categories = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  return (
    <View style={style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: PADDING_HORIZONTAL }}>
        <Text.H4 color={Colors.foreground}>
          Quests
        </Text.H4>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text.Base color={Colors.primary[200]} weight={600}>
            0 / 38
          </Text.Base>
          <Check color={Colors.primary[500]} size={20} />
        </View>
      </View>
      {categories.map((category, i) => (
        <View key={category}>
          <Text.Lg
            style={{ marginLeft: PADDING_HORIZONTAL, marginTop: i === 0 ? 24 : 32 }}
            color={Colors.neutral[400]}
          >
            {category}
          </Text.Lg>
          <FlatList
            style={{ marginTop: 24 }}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 0, paddingRight: PADDING_HORIZONTAL }}
            data={[{ _id: 1 }, { _id: 2 }, { _id: 3 }]}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (<Item />)}
          />
        </View>
      ))}
    </View>
  )
}

export default function SavedScreen() {
  return (
    <SafeScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: TOTAL_TABS_SPACE + 20 }}
      edges={{ top: 'padding', bottom: 'maximum' }}
    >
      <ModalHeader
        title="Collection"
        type="alt"
        size="big"
        endContent={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CreditsButton />
          <Notification />
        </View>}
        style={{
          paddingTop: 12,
          paddingLeft: 16,
          paddingRight: 12,
        }}
      />
      <PremiumBlock style={{ marginTop: 0, marginHorizontal: 12, marginBottom: 28 }} />
      <SavedOutfits
        itemWidth={132}
        style={{ marginBottom: 40 }}
        direction="horizontal"
        header={true}
      />
      <SavedPosts
        itemWidth={132}
        style={{ marginBottom: 36 }}
        direction="horizontal"
        header={true}
      />
      <Quests style={{ paddingBottom: 20 }} />
    </SafeScrollView>
  );
}
