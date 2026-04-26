import { getShareExtensionKey } from "expo-share-intent";
import { ROUTES } from "routes";

export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: string;
}) {
  if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
    // Intercept the native deep link and gently redirect it.
    // Returning "/" prevents Expo Router from trying to mount "/cooture://dataUrl=cootureShareKey"
    // The listener hook in our providers handles opening the modal.
    return ROUTES.HOME;
  }

  return path;
}
