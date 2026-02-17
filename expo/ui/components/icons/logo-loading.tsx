import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import { ViewStyle } from "react-native";
import { MotiView } from "../motion";

const videoSourcePrimary = require("assets/videos/logo_rotation_primary.mp4");
const videoSourceDark = require("assets/videos/logo_rotation_dark.mp4");

type Props = {
  style?: ViewStyle;
  size: number;
  variant?: 'primary' | 'dark';
}
export const LogoLoading = ({ style, size, variant = "primary" }: Props) => {
  const [init, setInit] = useState(false);
  const videoSource = variant === 'primary' ? videoSourcePrimary : videoSourceDark;
  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.muted = true;
    requestAnimationFrame(() => { player.play(); setInit(true); })
  });

  return (
    <MotiView
      style={{ width: size, height: size, ...style }}
      from={{ opacity: 0 }}
      animate={{ opacity: init ? 1 : 0 }}
      transition={{ type: 'timing', duration: 200 }}
    >
      <VideoView
        style={{ flex: 1 }}
        nativeControls={false}
        player={player}
      />
    </MotiView>
  )
}