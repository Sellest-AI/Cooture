import { Button } from '@ui/button';
import { CardItem } from '@ui/cards/card-item';
import { Trash } from '@ui/icons';
import { Modal, ModalProps } from '@ui/modal';

type SelectedItemModalProps = {

} & ModalProps;

export const SelectedItemModal = ({ ...props }: SelectedItemModalProps) => {
  return (
    <Modal {...props}>
      {({ close }) => (
        <>
          <CardItem
            source={require('assets/placeholders/blue-shirt.png')}
            title="Shirt"
            subtitle='M'
            animate={false}
          />
          <Button
            variant="destructive"
            startIcon={Trash}
            style={{ marginTop: 28 }}
          >
            Remove
          </Button>
          <Button
            style={{ marginTop: 12 }}
            variant="blur"
            onPress={() => close()}
          >
            Cancel
          </Button>
        </>
      )}
    </Modal>
  )
}