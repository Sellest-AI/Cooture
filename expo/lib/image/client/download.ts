import { File, Paths } from 'expo-file-system';
import { createAlbumAsync, createAssetAsync, requestPermissionsAsync } from 'expo-media-library';
import { Alert, Platform } from 'react-native';

// reuse your existing web download implementation
import { uriToImage } from './base64/uri-to-file';
import { download as webDownload } from './download.web';

export async function downloadImageCrossPlatform(source: string) {
  if (Platform.OS === 'web') {
    const asset = await uriToImage(source);
    return webDownload(asset.uri);
  }

  // native mobile
  const { status } = await requestPermissionsAsync(true, ['photo']);
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Photos permission is needed to save images.', undefined, { userInterfaceStyle: 'dark' });
    return;
  }

  let localUri: string | null = null;

  if (source.startsWith('data:')) {
    // write base64 data URI to file
    const [, base64] = source.split(',');
    const file = new File(Paths.document, `img_${Date.now()}.jpg`);
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
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

  const asset = await createAssetAsync(localUri);
  try { await createAlbumAsync('Cooture', asset, false); } catch { }
  Alert.alert('Saved', 'Image saved to your photos.', undefined, { userInterfaceStyle: 'dark' });
}