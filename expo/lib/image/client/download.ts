import { Platform } from 'react-native';

// reuse your existing web download implementation
import { uriToImage } from './base64/uri-to-file';
import { download as webDownload } from './download.web';

export async function downloadImageCrossPlatform(source: string) {
  if (Platform.OS === 'web') {
    const asset = await uriToImage(source);
    return webDownload(asset.uri);
  }

  const { File, Paths } = await import('expo-file-system');
  const { createAlbumAsync, createAssetAsync, requestPermissionsAsync } = await import('expo-media-library');

  // native mobile
  // Try to request media library permissions, but Expo Go may not allow full library access.
  // If permissions are unavailable/denied, we'll still download the file to the app documents
  // directory as a fallback so the user can access it via Files/Downloads.
  let canSaveToLibrary = true;
  try {
    const { status } = await requestPermissionsAsync();
    canSaveToLibrary = status === 'granted';
  } catch {
    canSaveToLibrary = false;
  }

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
    const filename = (source.split('/').pop() || `img_${Date.now()}`).split('?')[0];
    const file = new File(Paths.document, filename);
    await File.downloadFileAsync(source, file);
    localUri = file.uri;
  }

  if (!localUri) throw new Error('Failed to resolve file URI.');

  if (canSaveToLibrary) {
    const asset = await createAssetAsync(localUri);
    try {
      await createAlbumAsync('Cooture', asset, false);
    } catch { }
    // Alert.alert('Saved', 'Image saved to your photos.', undefined, { userInterfaceStyle: 'dark' });
    return;
  }

}