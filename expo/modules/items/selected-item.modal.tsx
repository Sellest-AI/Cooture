import { Id } from '@/lib/convex/api';
import { Button } from '@ui/button';
import { Trash } from '@ui/icons';
import { Modal, ModalProps } from '@ui/modal';
import { View } from 'react-native';
import { ROUTES } from 'routes';
import { useItem } from './_hooks/useItem';
import { ItemScreen } from './screen';

type SelectedItemModalProps = {
  itemId: Id<'items'> | null;
  onRemove?: () => void;
} & ModalProps;

export const SelectedItemModal = ({ itemId, onRemove, ...props }: SelectedItemModalProps) => {
  const { item } = useItem(itemId);
  const open = !!item && props.open;

  return (
    <Modal {...props}
      open={open && !!item}
      header={{
        showBackButton: true,
        title: item?.name ?? '',
        endContent: onRemove && <Button
          startIcon={Trash}
          onPress={onRemove}
          variant="destructive"
          size="rounded"
        />
      }}
    >
      <View>
        {item && <ItemScreen
          showHeader={false}
          path={ROUTES.ITEM.PATH}
          id={item._id}
        />}
      </View>
    </Modal>
  )
}