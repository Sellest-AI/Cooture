import { Image, Platform } from 'react-native';

// reuse your existing web download implementation
import { nanoid } from 'nanoid/non-secure';
import { download as webDownload } from './download.web';
import { applyWatermark } from './editing/apply-watermark.native';

type Options = {
  applyWatermark?: boolean;
}
export async function downloadImageNative(source: string, options?: Options) {
  let fileSource = source;

  if (Platform.OS === 'web') {
    return webDownload(fileSource);
  }

  const { File, Paths } = await import('expo-file-system');
  const { requestPermissionsAsync, saveToLibraryAsync } = await import('expo-media-library');
  const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator');

  // Request permission
  const { status } = await requestPermissionsAsync();
  if (status !== 'granted') return;

  if (options?.applyWatermark) {
    const watermarkUri = Image.resolveAssetSource(require('assets/images/watermark.png')).uri;
    fileSource = await applyWatermark(source, watermarkUri);
  }

  let localUri: string | null = null;

  if (fileSource.startsWith('data:')) {
    // write base64 data URI to file
    const [, base64] = fileSource.split(',');
    const file = new File(Paths.document, `img_${Date.now()}.png`);
    file.write(base64, { encoding: 'base64' });
    localUri = file.uri;
  } else {
    // remote URL -> download
    const filenameBase = (fileSource.split('/').pop() || `img_${Date.now()}`).split('?')[0];
    const filename = nanoid(7) + '_' + filenameBase;
    const file = new File(Paths.document, filename);
    const { uri } = await File.downloadFileAsync(fileSource, file);
    localUri = uri;
  }

  if (!localUri) throw new Error('Failed to resolve file URI.');

  // Convert to JPEG
  const ctx = ImageManipulator.manipulate(localUri);
  const result = await (await ctx.renderAsync()).saveAsync({
    format: SaveFormat.JPEG,
    base64: false,
  });

  // Save to media library (Camera Roll)
  await saveToLibraryAsync(result.uri);

}