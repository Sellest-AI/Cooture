import { useRouter } from "@/hooks";
import { useUpload } from "@/lib/convex/upload";
import { usePortraits } from "@/modules/profiles/_hooks/usePortraits";
import { UpdatePortraits } from "@/modules/profiles/update-portraits";
import { useEffect } from "react";
import { ROUTES } from "routes";

export default function Screen() {
  const { redirect } = useRouter('/update-portraits/side');

  const { uploadImage } = useUpload()
  const { setSideImage, sideImage, frontImage, smileImage, pushToServer } = usePortraits.Local();
  useEffect(() => { setSideImage(null) }, [setSideImage]);

  return (
    <UpdatePortraits
      imageUri={sideImage ?? undefined}
      onCapture={async (photoUri) => {
        setSideImage(photoUri);
        if (!frontImage || !smileImage || !photoUri) return;

        const [_frontImage, _smileImage, _photoUri] = await Promise.all([
          uploadImage(frontImage),
          uploadImage(smileImage),
          uploadImage(photoUri)
        ])

        await pushToServer({
          frontImageId: _frontImage._id,
          smileImageId: _smileImage._id,
          sideImageId: _photoUri._id,
        })

        redirect({ fallbackTo: ROUTES.PROFILE.PATH });
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