import { useScrollToTop } from "@/hooks";
import { api, Doc, Id, useQuery, useQueryCached } from "@/lib/convex/client";
import { SavedOutfits } from "@/modules/collection/saved-outfits";
import { SavedPosts } from "@/modules/collection/saved-posts";
import { CreditsButton } from "@/modules/premium/credits.button";
import { PremiumBlock } from "@/modules/premium/premium-block";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Quest } from "@ui/cards";
import { Check } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Text } from "@ui/text";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Platform, View, ViewStyle } from "react-native";
import { Colors } from "theme";

const PADDING_HORIZONTAL = 12;

const QUEST_TYPE_IMAGES: Record<(Doc<'quests'>['type']), string> = {
  "posts_published": require("assets/placeholders/quests/posted_pics.webp"),
  "outfits_created": require("assets/placeholders/quests/outfit_mastery.webp"),
  "presets_used": require("assets/placeholders/quests/preset_collector.webp"),
  "posts_liked": require("assets/placeholders/quests/social_butterfly.webp"),
  "photos_generated": require("assets/placeholders/quests/photography.webp"),
  "posts_shared": require("assets/placeholders/quests/viral_spreader.webp"),
  "likes_received": require("assets/placeholders/quests/received_likes.webp"),
  "followers_gained": require("assets/placeholders/quests/welcome_to_the_club.webp"),
}

const QUEST_CATEGORY_IMAGES: Partial<Record<Doc<'quests'>['category'], string>> = {
  'onboarding': require("assets/placeholders/quests/welcome_to_the_club.webp"),
}

const TYPE_TO_TEXT: Record<Doc<'quests'>['type'], string> = {
  "posts_liked": "liked posts",
  "posts_published": "published posts",
  "outfits_created": "created outfits",
  "presets_used": "used presets",
  "posts_shared": "shared posts",
  "photos_generated": "photos generated",
  "likes_received": "received likes",
  "followers_gained": "gained followers",
}

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const Quests = ({ style }: { style?: ViewStyle }) => {
  const { data: _quests, isPending } = useQueryCached(api.router.quests.getAll.anon);
  const [completed, setCompleted] = useState<Id<"quests">[]>([]);

  const Item = useMemo(() => function ChildItem({ id }: { id: Id<"quests"> }) {
    const { data: quest } = useQuery(api.router.quests.getOne.authed, { questId: id });

    useEffect(() => {
      if (quest?.progress?.isCompleted) { setCompleted((prev) => Array.from(new Set([...prev, id]))); }
    }, [id, quest])

    if (!quest)
      return <Quest.Skeleton
        style={{ width: 132 }}
      />

    const progress = quest.progress?.currentAmount ?? 0;
    const image = QUEST_TYPE_IMAGES[quest.type] || QUEST_CATEGORY_IMAGES[quest.category] || require('assets/placeholders/quests/unknown.webp');
    const description = TYPE_TO_TEXT[quest.type] || "progress";

    return (
      <Quest
        style={{ width: 132 }}
        source={image}
        title={quest.title}
        description={description}
        progress={{ completed: progress, total: quest.target }}
        credits={quest.rewardCredits}
      />
    )
  }, []);

  const quests = (_quests || []);
  const categories = Array.from(new Set(quests.map((q) => q.category)));

  if (isPending) return null;

  return (
    <View style={style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: PADDING_HORIZONTAL }}>
        <Text.H4 color={Colors.foreground}>
          Quests
        </Text.H4>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text.Base color={completed.length > 1 ? Colors.primary[200] : Colors.neutral[400]} weight={600}>
            {completed.length} / {quests.length}
          </Text.Base>
          {completed.length > 1 && <Check color={Colors.primary[500]} size={20} />}
        </View>
      </View>
      {categories.map((category, i) => (
        <View key={category}>
          <Text.Lg
            style={{ marginLeft: PADDING_HORIZONTAL, marginTop: i === 0 ? 24 : 32 }}
            color={Colors.neutral[400]}
          >
            {capitalizeFirstLetter(category).replaceAll("_", " ")}
          </Text.Lg>
          <FlatList
            style={{ marginTop: 24 }}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 8,
              paddingLeft: 4,
              paddingRight: PADDING_HORIZONTAL
            }}
            data={quests.filter((q) => q.category === category)
              .sort((a, b) => a.target - b.target)}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (<Item id={item._id} />)}
          />
        </View>
      ))}
    </View>
  )
}

export default function SavedScreen() {
  const scrollRef = useScrollToTop();

  return (
    <SafeScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: TOTAL_TABS_SPACE + 32 }}
      edges={{ top: 'padding', bottom: 'android' }}
      style={{ paddingTop: Platform.OS !== 'ios' ? 8 : 0 }}
    >
      <ModalHeader
        title="Collection"
        type="alt"
        size="big"
        endContent={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 48 }}>
          <CreditsButton />
        </View>}
        style={{
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
        style={{ marginBottom: 24 }}
        direction="horizontal"
        header={true}
      />
      <Quests />
    </SafeScrollView>
  );
}
