import { usePortraits } from "@/modules/profiles/_hooks/usePortraits";
import { UpdatePortraits } from "@/modules/profiles/update-portraits";
import { router } from "expo-router";
import { useEffect } from "react";

export default function Screen() {
  const { setSmileImage, smileImage } = usePortraits.Local();
  useEffect(() => { setSmileImage(null) }, [setSmileImage])

  return (
    <UpdatePortraits
      imageUri={smileImage ?? undefined}
      onCapture={(photoUri) => {
        setSmileImage(photoUri);
        setTimeout(() => { router.push('/update-portraits/side') }, 1300);
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