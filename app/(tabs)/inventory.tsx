import { ROUTES, useRouter } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import { api, usePaginatedQuery, useQuery, useQueryCached } from "@/lib/convex/client";
import { PremiumBlock } from "@/modules/premium/premium-block";
import { Notification } from "@/modules/profiles/notification";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Collection, PostMini, Quest } from "@ui/cards";
import { Check } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { useMemo } from "react";
import { FlatList, View, ViewStyle } from "react-native";
import { Colors } from "theme";

const PADDING_HORIZONTAL = 12;

const SavedPosts = ({ style }: { style?: ViewStyle }) => {
  const { push } = useRouter();

  const { user } = useAccount();
  const { results: generations, isLoading } = usePaginatedQuery(api.router.generations.getPaginated.anon, user ? { userId: user._id } : 'skip', { initialNumItems: 8 });

  const Item = useMemo(() => function ChildItem(props: NonNullable<typeof generations>[number]) {
    const { userId, ...item } = props;
    const { data: _image } = useQuery(api.router.storage.images.getOne.anon, item.coverId ? { id: item.coverId } : 'skip');
    const { data: user } = useQuery(api.router.users.getAccount.anon, { userId });

    const image = _image ? {
      ..._image,
      url: _image.sizes.small.url,
    } : undefined;

    return (
      <PostMini
        style={{ width: 132 }}
        onPress={() => push(ROUTES.POST.PATH, { pathParams: { id: item._id } })}
        images={item.predictions.length > 0 ? [image, image].filter(notEmpty) : undefined}
        image={image}
        users={user ? [{
          ...user,
          onPress: () => push(ROUTES.PROFILE.PATH, { pathParams: { id: user._id } }),
          imageUrl: user.image,
          name: user.name ?? 'Anonymous',
          username: user.username ?? 'anonymous',
        }] : undefined}
      />
    )
  }, [push]);

  return (
    <View style={style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: PADDING_HORIZONTAL }}>
        <Text.H4 color={Colors.foreground}>
          Saved Posts
        </Text.H4>
        <Text.Base color={Colors.neutral[200]} weight={600}>
          See more
        </Text.Base>
      </View>
      {isLoading && <View style={{
        marginTop: 16,
        flexDirection: 'row',
        paddingHorizontal: PADDING_HORIZONTAL + 4, gap: 32
      }}
      >
        <PostMini.Skeleton style={{ width: 132 }} />
        <PostMini.Skeleton style={{ width: 132 }} />
        <PostMini.Skeleton style={{ width: 132 }} />
      </View>}
      <FlatList
        style={{ marginTop: 20 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 28, paddingLeft: PADDING_HORIZONTAL, paddingRight: PADDING_HORIZONTAL + 12, paddingTop: 10 }}
        contentOffset={{ x: 120, y: 0 }}
        data={(generations?.slice(0, 6) || [])}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <Item {...item} />
        )}
      />
    </View>
  )
}

const SavedOutfits = ({ style }: { style?: ViewStyle }) => {
  const { push } = useRouter();
  const { data: outfits } = useQueryCached(api.router.outfits.getAll.authed)

  return (
    <View style={style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: PADDING_HORIZONTAL }}>
        <Text.H4 color={Colors.foreground}>
          Saved Outfits
        </Text.H4>
        <Text.Base color={Colors.neutral[200]} weight={600}>
          See more
        </Text.Base>
      </View>
      {!outfits && <View style={{
        marginTop: 16,
        flexDirection: 'row',
        paddingHorizontal: PADDING_HORIZONTAL + 4, gap: 32
      }}
      >
        <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
        <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
        <Skeleton style={{ width: 132, aspectRatio: 4 / 5 }} />
      </View>}
      <FlatList
        style={{ marginTop: 16 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 32, paddingHorizontal: PADDING_HORIZONTAL + 4, paddingTop: 6 }}
        data={(outfits?.slice(0, 6) || [])}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Collection
            onPress={() => push(ROUTES.OUTFIT.PATH, {
              pathParams: { id: item._id }
            })}
            backgroundColor={item.backgroundColor}
            source={item.cover.sizes.small.url}
            title={item.name}
            style={{ width: 132 }}
            contentFit="contain"
          />
        )}
      />
    </View>
  )
}

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
        title="Inventory"
        type="alt"
        size="big"
        endContent={<Notification />}
        style={{
          paddingTop: 12,
          paddingHorizontal: 20,
        }}
      />
      <PremiumBlock style={{ marginTop: 0, marginHorizontal: 12 }} />
      <SavedOutfits style={{ marginTop: 28 }} />
      <SavedPosts style={{ marginTop: 40 }} />
      <Quests style={{ marginTop: 36, paddingBottom: 20 }} />
    </SafeScrollView>
  );
}
