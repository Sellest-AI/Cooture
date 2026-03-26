import { useFocusEffect } from "expo-router";
import { VideoView as ExpoVideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect } from "react";
import { AppState, ViewStyle } from "react-native";

type VideoViewProps = {
  source: string;
  contentFit?: 'cover' | 'contain' | 'fill';
  style?: ViewStyle;
  autoPlay?: boolean;
}

export const VideoView = ({ style, source, contentFit, autoPlay = true }: VideoViewProps) => {
  const player = useVideoPlayer(source, player => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    if (!player) return;
    if (!autoPlay) return;
    try { player.play(); } catch { }
  }, [player, source, autoPlay]);

  useFocusEffect(useCallback(() => {
    if (!player) return;
    if (!autoPlay) return;
    try { player.play(); } catch { }
  }, [autoPlay, player]));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (!autoPlay) return;
      if (nextAppState === 'active' && player) { try { player.play(); } catch { } }
    });

    return () => { subscription.remove(); };
  }, [autoPlay, player]);

  return (
    <ExpoVideoView
      player={player}
      nativeControls={false}
      contentFit={contentFit ?? "cover"}
      style={style}
    />
  )
}