import { api, Id } from '@/lib/convex/api';
import { useQuery } from '@/lib/convex/client';
import { Button } from '@ui/button';
import { CardItem } from '@ui/cards/card-item';
import { ExternalLink, Globe, Trash, User } from '@ui/icons';
import { MenuGroup, MenuItem } from '@ui/menu';
import { Modal, ModalProps } from '@ui/modal';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { View } from 'react-native';
import { ROUTES } from 'routes';

type SelectedItemModalProps = {
  itemId: Id<'items'> | null;
  onRemove?: () => void;
} & ModalProps;

export const SelectedItemModal = ({ itemId, onRemove, ...props }: SelectedItemModalProps) => {
  const { data: item } = useQuery(api.router.items.getOne.anon, itemId ? { itemId } : 'skip');
  const open = !!item && props.open;

  return (
    <Modal {...props}
      open={open}
      header={{ title: item?.name ?? '' }}
      scrollable={true}
    >
      {({ close }) => <View style={{ paddingVertical: 12 }}>
        {item && <CardItem
          image={item.image}
          source={item.image.sizes.medium.url}
          title={item.name}
          subtitle={item.category}
          animate={false}
          style={{ height: 256 }}
        />}
        <MenuGroup title="Danger" style={{ marginTop: 24 }}>
          {onRemove && <MenuItem
            icon={Trash}
            text="Remove"
            onPress={onRemove}
            variant="destructive"
          />}
        </MenuGroup>
        <MenuGroup title="More actions">
          <MenuItem
            icon={User}
            text="User profile"
            onPress={!item ? undefined : () => { router.push(ROUTES.USER.ID(item.userId)); close(); }}
          />
          {item?.link && <MenuItem
            icon={Globe}
            text="View on website"
            onPress={!item?.link ? undefined : () => { Linking.openURL(item.link!); close(); }}
          />}
          <MenuItem
            icon={ExternalLink}
            text="View details"
            onPress={!item ? undefined : () => { router.push(ROUTES.ITEM.ID(item._id)); close(); }}
          />
        </MenuGroup>
        <Button
          style={{ marginTop: 8 }}
          variant="blur"
          onPress={() => close()}
        >
          Close
        </Button>
      </View>}
    </Modal>
  )
}