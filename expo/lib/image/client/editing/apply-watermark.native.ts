import { Skia } from "@shopify/react-native-skia";
import { urlToImage } from "../base64/url-to-file";

export const applyWatermark = async (
  imageUrl: string,
  watermarkUrl: string
): Promise<string> => {
  // Load both images into Skia
  const imageUri = (await urlToImage(imageUrl)).uri;
  const imageData = await Skia.Data.fromURI(imageUri);

  const watermarkUri = (await urlToImage(watermarkUrl)).uri;
  const watermarkData = await Skia.Data.fromURI(watermarkUri);

  const baseImage = Skia.Image.MakeImageFromEncoded(imageData);

  const watermarkImage = Skia.Image.MakeImageFromEncoded(watermarkData);

  if (!baseImage || !watermarkImage) throw new Error("Failed to load images");

  const imgWidth = baseImage.width();
  const imgHeight = baseImage.height();

  // 10% of the smaller dimension
  const watermarkSize = Math.min(imgWidth, imgHeight) * 0.1;
  const scale = watermarkSize / Math.min(watermarkImage.width(), watermarkImage.height());
  const wmWidth = watermarkImage.width() * scale;
  const wmHeight = watermarkImage.height() * scale;

  // 5% padding bottom-right
  const paddingRight = imgWidth * 0.05;
  const paddingBottom = imgWidth * 0.05;
  const left = imgWidth - wmWidth - paddingRight;
  const top = imgHeight - wmHeight - paddingBottom;

  // Draw onto an offscreen surface
  const surface = Skia.Surface.Make(imgWidth, imgHeight)!;
  const canvas = surface.getCanvas();

  canvas.drawImage(baseImage, 0, 0);
  canvas.drawImageRect(
    watermarkImage,
    { x: 0, y: 0, width: watermarkImage.width(), height: watermarkImage.height() },
    { x: left, y: top, width: wmWidth, height: wmHeight },
    Skia.Paint()
  );

  // Snapshot and export to file
  const snapshot = surface.makeImageSnapshot();
  const outputBase64 = snapshot.encodeToBase64();

  return `data:image/png;base64,${outputBase64}`;
};