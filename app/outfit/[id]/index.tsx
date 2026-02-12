import { useRoute, useRouter, useStateEffect } from "@/hooks";
import { Id } from "@/lib/convex/api";
import { useAccount } from "@/lib/convex/auth";
import { SelectedItemModal } from "@/modules/items/selected-item.modal";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { CardItem } from "@ui/cards/card-item";
import { FlashList } from "@ui/flat-list";
import { ArrowRight, Pencil, SquirishPlus, Trash } from "@ui/icons";
import { Image } from '@ui/image';
import { ModalHeader } from "@ui/modal";
import { useSafeAreaInsets } from "@ui/safe-area-view";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { TextInput } from "@ui/text-input";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Dimensions, Keyboard, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function ItemScreen() {
  const { user } = useAccount();
  const { bottom } = useSafeAreaInsets();

  const { push } = useRouter('/outfit/[id]');
  const { id } = useRoute.Params<{ id: Id<'outfits'> }>();
  const { outfit, updateItems, updateName, remove } = useOutfit(id);

  const [selectedItem, setSelectedItem] = useState<Id<'items'> | null>(null);
  const [items, setItems] = useStateEffect(outfit?.items ?? []);
  const [name, setName] = useStateEffect(outfit?.name ?? '');

  const hasChanges = useMemo(() => {
    if (!outfit) return false;
    if (name !== outfit.name) return true;
    if (items.length !== outfit.items.length) return true;
    const outfitItemIds = outfit.items.map((i) => i._id).sort();
    const currentItemIds = items.map((i) => i._id).slice().sort();
    if (currentItemIds.some((id) => !outfitItemIds.includes(id))) return true;
    if (outfitItemIds.some((id) => !currentItemIds.includes(id))) return true;
    return false;
  }, [items, name, outfit])

  const exit = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(ROUTES.PROFILE.OUTFITS)
    }
  }

  const ownOutfit = outfit?.userId === user?._id;

  if (!outfit) {
    return <LoadingBlock style={{ height: 'auto', flex: 1 }} />
  }

  return (
    <>
      <View
        style={{ flex: 1, backgroundColor: Colors.background }}
      >
        {items[0] && <Image
          source={items[0].image.sizes.thumbnail.url}
          blurRadius={50}
          style={{
            opacity: 0.1,
            position: 'absolute',
            inset: 0,
          }}
        />}
        <SafeScrollView
          showsVerticalScrollIndicator={false}
          edges={{ top: 'padding' }}
          style={{
            paddingTop: 12,
            paddingBottom: 56,
            marginHorizontal: 12
          }}
        >
          <ModalHeader
            type="alt"
            size="big"
            title={"Outfit"}
            subtitle={outfit.name}
            onBack={exit}
          />
          <View style={{ marginTop: 4 }}>
            {ownOutfit && <TextInput
              startIcon={Pencil}
              placeholder="Name your outfit..."
              onChangeText={setName}
              value={name}
              style={{ marginBottom: 20 }}
            />}
            <FlashList
              data={[...items, undefined]}
              style={{
                marginTop: 16,
                paddingHorizontal: 8,
                minHeight: Dimensions.get('window').height - 316
              }}
              renderItem={({ item }) => {
                if (!item) {
                  if (!ownOutfit) return null;
                  return (<SquirishPlus
                    style={{
                      marginBottom: 40,
                      paddingTop: 3,
                      marginLeft: 20,
                      marginRight: 20,
                    }}
                    size={112}
                    onPress={() => {
                      updateItems(items.map((i) => i._id));
                      push(ROUTES.MODALS.OUTFIT_ADD_ITEM, {
                        params: { outfitId: id }
                      })
                    }}
                  />)
                }

                return (
                  <View style={{
                    marginBottom: 40,
                    paddingTop: 3,
                    marginLeft: 20,
                    marginRight: 20,
                  }}
                  >
                    <CardItem
                      source={item.image.sizes.small.url}
                      title={item.name}
                      subtitle={item.category}
                      onPress={() => setSelectedItem(item._id)}
                    />
                  </View>
                )
              }}
              numColumns={2}
              masonry
            />
            {ownOutfit && <Button
              style={{ marginTop: 12 }}
              variant="destructive"
              startIcon={Trash}
              onLongPress={async () => {
                await remove();
                if (router.canGoBack()) router.back();
                else router.replace(ROUTES.PROFILE.OUTFITS);
              }}
            >
              Delete Outfit
            </Button>}
          </View>
        </SafeScrollView>
        <View style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: bottom + 8,
        }}>
          {!ownOutfit && <Button
            variant="primary"
            endIcon={ArrowRight}
            style={{ marginBottom: 12 }}
            onPress={async () => {
              push(ROUTES.PHOTOSHOOT.NEW, {
                params: { outfitId: outfit._id }
              })
            }}
          >
            Try on
          </Button>}
          {ownOutfit && <Button
            variant={'primary'}
            disabled={!hasChanges}
            onPress={async () => {
              Keyboard.dismiss();
              await updateItems(items.map((i) => i._id));
              await updateName(name);
            }}
          >
            Save Changes
          </Button>}
        </View>
      </View>
      <SelectedItemModal
        onRemove={items.length > 1 ? () => {
          setSelectedItem(null);
          setItems((p) => p.filter(x => x._id !== selectedItem))
        } : undefined}
        itemId={selectedItem}
        open={!!selectedItem}
        onOpenChange={() => setSelectedItem(null)}
      />
    </>
  )
}