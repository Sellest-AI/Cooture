import { usePortraits } from "@/modules/profiles/_hooks/usePortraits";
import { UpdatePortraits } from "@/modules/profiles/update-portraits";
import { router } from "expo-router";
import { useEffect } from "react";

export default function Screen() {
  const { setFrontImage, frontImage } = usePortraits.Local();
  useEffect(() => { setFrontImage(null) }, [setFrontImage])

  return (
    <UpdatePortraits
      imageUri={frontImage ?? undefined}
      onCapture={(photoUri) => {
        setFrontImage(photoUri);
        setTimeout(() => { router.push('/settings/update-portraits/smile') }, 1300);
      }}
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