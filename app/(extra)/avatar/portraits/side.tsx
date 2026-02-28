import { useRouter } from "@/hooks";
import { useUpload } from "@/lib/convex/upload";
import { usePortraitsLocal } from "@/modules/profiles/_hooks/useAppearance";
import { UpdatePortraits } from "@/modules/profiles/update-portraits";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function Screen() {
  const { push } = useRouter('/avatar/portraits/side');

  const { uploadImage } = useUpload();
  const { frontImage, smileImage, setSideImage, sideImage, pushImagesToServer } = usePortraitsLocal();
  useFocusEffect(useCallback(() => { setSideImage(null) }, [setSideImage]))

  return (
    <UpdatePortraits
      imageUri={sideImage ?? undefined}
      onCapture={async (photoUri) => {
        setSideImage(photoUri);

        if (!frontImage || !smileImage || !photoUri) return;

        const [_frontImage, _smileImage, _sideImage] = await Promise.all([
          uploadImage(frontImage),
          uploadImage(smileImage),
          uploadImage(photoUri)
        ]);

        await pushImagesToServer({
          frontImageId: _frontImage._id,
          smileImageId: _smileImage._id,
          sideImageId: _sideImage._id,
        });

        push('/avatar/appearance', { forwardRedirect: true });
      }}
      examples={{
        hint: "Make sure to be in a bright enough room. Try to keep a plain white background.",
        good: require('assets/placeholders/portraits/side-good.png'),
        bad: [
          require('assets/placeholders/portraits/side-bad.jpg'),
          require('assets/placeholders/can-model.png')
        ]
      }}
    />
  )

}