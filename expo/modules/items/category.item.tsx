import { Glasses, Hand, HardHat, Shirt, VenetianMask, Watch } from "@ui/icons";
import { Modal } from "@ui/modal";
import { ComponentProps, useState } from "react";
import { FlatList, View } from 'react-native';
import { Category } from "./category";

type Props = { style?: ComponentProps<typeof Category>['style'] };

export const ItemCategory = ({ ...props }: Props) => {
  const [open, setOpen] = useState(false);

  const items = [
    { icon: Shirt, title: 'Hoodie', selected: true },
    { icon: VenetianMask, title: 'Mask' },
    { icon: HardHat, title: 'Cap' },
    { icon: Glasses, title: 'Glasses' },
    { icon: HardHat, title: 'Hat' },
    { icon: Watch, title: 'Watch' },
    { icon: Hand, title: 'Gloves' },
  ]

  return (
    <>
      <Category
        {...props}
        icon={Shirt}
        title="Hoodie"
        onPress={() => setOpen(true)}
      />
      <Modal
        onOpenChange={setOpen}
        scrollable={false}
        open={open}
      >
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(i) => i.title}
          renderItem={({ item }) => (
            <View style={{ padding: 2, flex: 1 }}>
              <Category {...item} />
            </View>
          )}
        />
      </Modal>
    </>
  )
}