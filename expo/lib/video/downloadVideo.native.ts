import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { nanoid } from 'nanoid/non-secure';

export const downloadVideo = async (videoUrl: string) => {
  // Request permission
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') return;

  // Download the file
  const filenameBase = (videoUrl.split('/').pop() || `vid_${Date.now()}`).split('?')[0];
  const filename = nanoid(7) + '_' + filenameBase;
  const file = new File(Paths.document, filename);
  const { uri } = await File.downloadFileAsync(videoUrl, file);

  // Save to media library (Camera Roll)
  await MediaLibrary.saveToLibraryAsync(uri);
};