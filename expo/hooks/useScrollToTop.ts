import { useScrollToTop as useScrollToTopNative } from "@react-navigation/native";
import { useRef } from "react";
import { ScrollView } from "react-native";

export const useScrollToTop = (ref?: React.RefObject<ScrollView | null>) => {
  const innerRef = useRef<ScrollView | null>(null);
  const scrollRef = ref ?? innerRef;

  useScrollToTopNative(scrollRef);

  return scrollRef;
}

const useScrollToTopFlashList = () => {
  const scrollRef = useRef(null);

  useScrollToTopNative(scrollRef);

  return scrollRef;
}

useScrollToTop.FlashList = useScrollToTopFlashList;