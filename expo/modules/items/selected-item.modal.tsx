import { api, Id } from '@/lib/convex/api';
import { useQuery } from '@/lib/convex/client';
import { Button } from '@ui/button';
import { CardItem } from '@ui/cards/card-item';
import { ExternalLink, Globe, Trash } from '@ui/icons';
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
    <Modal {...props} open={open}
      header={{ title: item?.name ?? '' }}
    >
      {({ close }) => !item ? null : (
        <View style={{ paddingTop: 12 }}>
          <CardItem
            image={item.image}
            source={item.image.sizes.medium.url}
            title={item.name}
            subtitle={item.category}
            animate={false}
            style={{ height: 256 }}
          />
          <Button
            variant="destructive"
            startIcon={Trash}
            style={{ marginTop: 28 }}
            onPress={onRemove}
            disabled={!onRemove}
          >
            Remove
          </Button>
          {item.link && <Button
            variant="blur"
            startIcon={Globe}
            style={{ marginTop: 12 }}
            onPress={() => item.link && Linking.openURL(item.link)}
          >
            Open Website
          </Button>}
          <Button
            variant="blur"
            startIcon={ExternalLink}
            style={{ marginTop: 12 }}
            onPress={() => router.push(ROUTES.ITEM.ID(item._id))}
          >
            View Details
          </Button>
          <Button
            style={{ marginTop: 12 }}
            variant="blur"
            onPress={() => close()}
          >
            Close
          </Button>
        </View>
      )}
    </Modal>
  )
}