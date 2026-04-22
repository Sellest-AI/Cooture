import { useRoute } from "@/hooks";
import { Id } from "@/lib/convex/api";
import { ItemScreen } from "@/modules/items/screen";
import { ROUTES } from "routes";

export default function Screen() {
  const { id } = useRoute.Params<{ id: Id<'items'> }>();

  return (
    <ItemScreen
      isFullScreen={true}
      path={ROUTES.ITEM.PATH}
      id={id}
    />
  )
}