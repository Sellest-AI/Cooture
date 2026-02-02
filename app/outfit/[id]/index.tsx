import { useRouter, useStateEffect } from "@/hooks";
import { Id } from "@/lib/convex/api";
import { SelectedItemModal } from "@/modules/items/selected-item.modal";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { CardItem } from "@ui/cards/card-item";
import { Pencil, SquirishPlus, Trash } from "@ui/icons";
import { Image } from '@ui/image';
import { MasonryList } from "@ui/masonry-list";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { TextInput } from "@ui/text-input";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function ItemScreen() {
  const { push, searchParams: { id } } = useRouter<{ id: Id<'outfits'> }>('/outfit/[id]');
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

  if (!outfit) {
    return <LoadingBlock style={{ height: 'auto', flex: 1 }} />
  }

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
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
            style={{
              paddingTop: 12,
              paddingHorizontal: 12,
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
              <TextInput
                startIcon={Pencil}
                placeholder="Name your outfit..."
                onChangeText={setName}
                value={name}
                style={{ marginBottom: 20 }}
              />
              <MasonryList
                key="0"
                data={[...items, undefined]}
                style={{ columnGap: 48, paddingHorizontal: 8, minHeight: Dimensions.get('window').height - 316 }}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => {
                  if (!item) {
                    return (<SquirishPlus
                      style={{ marginBottom: 24, paddingTop: 3, }}
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
                    <View style={{ marginBottom: 24, paddingTop: 3 }}>
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
              />
              <Button
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
              </Button>
            </View>
            <View style={{ height: 92 }} />
          </SafeScrollView>
          <View style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
          }}>
            <Button
              variant="primary"
              disabled={!hasChanges}
              onPress={async () => {
                Keyboard.dismiss();
                await updateItems(items.map((i) => i._id));
                await updateName(name);
              }}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
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