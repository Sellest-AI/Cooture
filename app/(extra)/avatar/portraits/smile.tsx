import { useRouter } from "@/hooks";
import { usePortraitsLocal } from "@/modules/profiles/_hooks/useAppearance";
import { UpdatePortraits } from "@/modules/profiles/update-portraits";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function Screen() {
  const { push } = useRouter('/avatar/portraits/smile');
  const { setSmileImage, smileImage } = usePortraitsLocal();
  useFocusEffect(useCallback(() => { setSmileImage(null) }, [setSmileImage]))

  return (
    <UpdatePortraits
      imageUri={smileImage ?? undefined}
      onCapture={(photoUri) => {
        setSmileImage(photoUri);
        setTimeout(() => { push('/avatar/portraits/side', { forwardRedirect: true }) }, 1300);
      }}
      examples={{
        hint: "Make sure to be in a bright enough room. Try to keep a plain white background.",
        good: require('assets/placeholders/portraits/smile-good.jpg'),
        bad: [
          require('assets/placeholders/portraits/smile-bad1.jpg'),
          require('assets/placeholders/restaurant-model.png')
        ]
      }}
    />
  )
}