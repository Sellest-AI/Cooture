import { Platform } from 'react-native';

// reuse your existing web download implementation
import { nanoid } from 'nanoid/non-secure';
import { download as webDownload } from './download.web';

export async function downloadImageCrossPlatform(source: string) {
  if (Platform.OS === 'web') {
    return webDownload(source);
  }

  const { File, Paths } = await import('expo-file-system');
  const { requestPermissionsAsync, saveToLibraryAsync } = await import('expo-media-library');
  const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator');

  // Request permission
  const { status } = await requestPermissionsAsync();
  if (status !== 'granted') return;

  let localUri: string | null = null;

  if (source.startsWith('data:')) {
    // write base64 data URI to file
    const [, base64] = source.split(',');
    const file = new File(Paths.document, `img_${Date.now()}.jpg`);
    // Decode base64 string to bytes (Buffer is available in React Native via polyfill)
    const bytes = Uint8Array.from(Buffer.from(base64 ?? '', 'base64'));
    file.write(bytes);
    localUri = file.uri;
  } else {
    // remote URL -> download
    const filenameBase = (source.split('/').pop() || `img_${Date.now()}`).split('?')[0];
    const filename = nanoid(7) + '_' + filenameBase;
    const file = new File(Paths.document, filename);
    const { uri } = await File.downloadFileAsync(source, file);
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