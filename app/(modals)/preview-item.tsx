import { ROUTES, useRoute } from "@/hooks";
import { ItemScreen } from "@/modules/items/screen";
import { Button } from "@ui/button";
import { Trash } from "@ui/icons";
import { View } from "react-native";

export default function Screen() {
  const { itemId, onRemove } = useRoute(ROUTES.MODALS.PREVIEW_ITEM);

  return (
    <View style={{ flex: 1 }}>
      <ItemScreen
        isFullScreen={false}
        path={ROUTES.MODALS.PREVIEW_ITEM}
        id={itemId}
        headerEndContent={onRemove && <Button
          startIcon={Trash}
          onPress={onRemove}
          variant="destructive"
          size="rounded"
        />}
      />
    </View>
  )
}