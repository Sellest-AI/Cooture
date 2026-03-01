import { VideoView as ExpoVideoView, useVideoPlayer } from "expo-video";
import { ViewStyle } from "react-native";

type VideoViewProps = {
  source: string;
  contentFit?: 'cover' | 'contain' | 'fill';
  style?: ViewStyle;
}

export const VideoView = ({ style, source, contentFit }: VideoViewProps) => {
  const player = useVideoPlayer(source, player => {
    try {
      player.loop = true;
      player.muted = true;
      requestAnimationFrame(() => { try { player.play(); } catch { } })
    } catch { }
  });

  return (
    <ExpoVideoView
      player={player}
      nativeControls={false}
      contentFit={contentFit ?? "cover"}
      style={style}
    />
  )
}