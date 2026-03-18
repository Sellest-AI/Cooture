import { AnimatePresence, MotiView } from "@ui/motion";
import { Dimensions } from "react-native";
import { Colors } from "theme";
import { BrowserItems } from "./browser.items";
import { Browser, BrowserProductItem } from "./browser.view";

type Item = BrowserProductItem & { key: string };

type Props = {
  items: Item[];
  isOpen: boolean;
  onRemoveItem: (id: string) => void;
  onSelectImage: (item: { id: string, url: string }) => void;
  onClose: () => void;
}

export const BrowserItemsList = ({ isOpen, items, onRemoveItem, onSelectImage, onClose }: Props) => {
  const { setCurrentUrl } = Browser.useContext();

  return (
    <AnimatePresence>
      {isOpen && <MotiView
        from={{ height: 0 }}
        animate={{ height: 'auto' }}
        exit={{ translateY: 16 }}
        exitTransition={{ duration: 500 }}
        style={{
          maxHeight: 320,
          overflow: 'hidden',
          borderRadius: 20,
          width: '100%',
        }}>
        <BrowserItems
          onNavigateToItem={(id) => {
            const item = items.find(i => i.key === id);
            if (item) setCurrentUrl(item.url);
          }}
          onRemoveItem={(id) => { onRemoveItem(id); }}
          items={items.map((p) => ({
            ...p,
            title: p.title,
            id: p.key,
            description: p.description ?? '',
            images: p.images.map((i) => ({ ...i }))
          }))}
          onSelectImage={({ id, url }) => { onSelectImage({ id: id, url }); }}
          style={{
            width: Dimensions.get("screen").width,
            backgroundColor: Colors.background,
            padding: 12,
            paddingBottom: 0,
          }}
        />
      </MotiView>}
    </AnimatePresence>
  )
}
