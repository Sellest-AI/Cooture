import { LoaderCircle } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

type LoaderProps = ComponentProps<typeof LoaderCircle>;
export const Loader = (props: LoaderProps) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <LoaderCircle {...props} />
    </Animated.View>
  );
};
