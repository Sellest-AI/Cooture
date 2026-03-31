import { useFocusEffect } from "expo-router";
import { VideoView as ExpoVideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef } from "react";
import { AppState, Dimensions, View, ViewStyle } from "react-native";

type VideoViewProps = {
  source: string;
  contentFit?: 'cover' | 'contain' | 'fill';
  style?: ViewStyle;
  autoPlay?: boolean;
  // Percentage of the video that should be visible on screen for it to auto play/pause. Default is 0.5 (50%)
  autoPlayScreenThreshold?: number;
}

export const VideoView = ({ style, source, contentFit, autoPlay = true, autoPlayScreenThreshold = 0.5 }: VideoViewProps) => {
  const viewRef = useRef<View>(null);
  const player = useVideoPlayer(source, player => {
    player.loop = true;
    player.muted = true;
  });

  useFocusEffect(
    useCallback(() => {
      if (!player || !autoPlay) return;

      let isActive = true;

      const checkVisibility = () => {
        try {
          if (!isActive) return;

          viewRef.current?.measureInWindow((x, y, width, height) => {
            if (!isActive || height === 0 || width === 0) return;

            const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

            // Calculate visible width/height within the window boundaries
            const visibleHeight = Math.max(0, Math.min(y + height, windowHeight) - Math.max(y, 0));
            const visibleWidth = Math.max(0, Math.min(x + width, windowWidth) - Math.max(x, 0));

            const visibleArea = visibleHeight * visibleWidth;
            const totalArea = height * width;
            const visibleRatio = visibleArea / totalArea;

            try {
              if (visibleRatio >= autoPlayScreenThreshold) {
                if (!player.playing) player.play();
              } else {
                if (player.playing) player.pause();
              }
            } catch { }
          });
        } catch { }
      };

      // Initial check right away
      checkVisibility();

      // Setup polling interval to track visibility continuously (scroll, animations, etc.)
      const intervalId = setInterval(checkVisibility, 250);

      return () => {
        isActive = false;
        clearInterval(intervalId);
        // Always pause when navigating away from this screen
        try { if (player.playing) player.pause(); } catch { }
      };
    }, [player, autoPlay, autoPlayScreenThreshold])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (!autoPlay || !player) return;
      if (nextAppState !== 'active') {
        try {
          if (player.playing) player.pause();
        } catch { }
      }
    });

    return () => { subscription.remove(); };
  }, [autoPlay, player]);

  return (
    <View ref={viewRef} style={[{ overflow: 'hidden' }, style]} collapsable={false}>
      <ExpoVideoView
        player={player}
        nativeControls={false}
        contentFit={contentFit ?? "cover"}
        style={{ width: '100%', height: '100%', aspectRatio: style?.aspectRatio }}
      />
    </View>
  )
}