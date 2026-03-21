import { useFocusEffect } from "expo-router";
import { VideoView as ExpoVideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect } from "react";
import { ViewStyle } from "react-native";

type VideoViewProps = {
  source: string;
  contentFit?: 'cover' | 'contain' | 'fill';
  style?: ViewStyle;
}

export const VideoView = ({ style, source, contentFit }: VideoViewProps) => {
  const player = useVideoPlayer(source, player => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    if (!player) return;
    try { player.play(); } catch { }
  }, [player, source]);

  useFocusEffect(useCallback(() => {
    if (!player) return;
    try { player.play(); } catch { }
  }, [player]));

  return (
    <ExpoVideoView
      player={player}
      nativeControls={false}
      contentFit={contentFit ?? "cover"}
      style={style}
    />
  )
}