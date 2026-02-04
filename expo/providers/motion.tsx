// The "motion" library doesn't need providers like framer-motion did. It's optimized and tree-shakeable by default
// import { LazyMotion, MotionConfig, domMax } from "@ui/motion";

import { GestureHandlerRootView } from "react-native-gesture-handler"

type Props = {
  children?: React.ReactNode
}

export const MotionProvider = ({ children }: Props) => {
  return <GestureHandlerRootView>
    {children}
  </GestureHandlerRootView>
}