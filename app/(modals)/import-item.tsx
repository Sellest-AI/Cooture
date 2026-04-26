import { ModalHeader } from "@ui/modal";
import { Text } from "@ui/text";
import { Redirect, useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { Button, View } from "react-native";
import { ROUTES } from "routes";

export default function Screen() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const router = useRouter();

  const handleCancel = () => {
    resetShareIntent(); // Always clear that you received it!
    if (router.canGoBack()) router.back();
    else router.dismissTo(ROUTES.TABS.DISCOVER);
  };

  const handleAccept = () => {
    // 1. the URL shared from Zalando/Shein:
    console.log("Shared URL", shareIntent.webUrl || shareIntent.text);

    // 2. Or the shared image files:
    console.log("Shared Files", shareIntent.files);

    // call Convex to extract the Zalando URL or upload the image...

    resetShareIntent();
    if (router.canGoBack()) router.back();
    else router.dismissTo(ROUTES.TABS.DISCOVER);
  };

  // Safe fallback if opened without intent
  if (!hasShareIntent)
    return (<Redirect href={ROUTES.HOME} />);

  return (
    <View style={{ flex: 1, padding: 12, gap: 16 }}>
      <ModalHeader
        customBackIcon="x"
        title="Import item"
      />
      {shareIntent.webUrl ? (
        <Text.Base>Found a Link to Import: {shareIntent.webUrl}</Text.Base>
      ) : shareIntent.files?.length ? (
        <Text.Base>Found {shareIntent.files.length} Image(s) to import.</Text.Base>
      ) : (
        <Text.Base>Found Text: {shareIntent.text}</Text.Base>
      )}

      <Button title="Approve & Import" onPress={handleAccept} />
      <Button title="Cancel" onPress={handleCancel} color="red" />
    </View>
  )
}