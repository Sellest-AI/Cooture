import { useRouter } from "@/hooks";
import { usePortraitsLocal } from "@/modules/profiles/_hooks/useAppearance";
import { UpdatePortraits } from "@/modules/profiles/update-portraits";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function Screen() {
  const { push } = useRouter('/avatar/portraits');
  const { setFrontImage, frontImage } = usePortraitsLocal();
  useFocusEffect(useCallback(() => { setFrontImage(null) }, [setFrontImage]))

  return (
    <UpdatePortraits
      imageUri={frontImage ?? undefined}
      onCapture={(photoUri) => {
        setFrontImage(photoUri);
        setTimeout(() => { push('/avatar/portraits/smile', { forwardRedirect: true }) }, 1300);
      }}
      guideline="default"
      examples={{
        hint: "Make sure to be in a bright enough room. Try to keep a plain white background.",
        good: require('assets/placeholders/portraits/front-good.webp'),
        bad: [
          require('assets/placeholders/portraits/front-bad.jpg'),
          require('assets/placeholders/tiger-model.png')
        ]
      }}
    />
  )
}