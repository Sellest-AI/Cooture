import { ComponentProps } from 'react';
import { EdgeRecord, SafeAreaView as SafeAreaViewNative } from 'react-native-safe-area-context';

export { KeyboardAvoidingView } from 'react-native';
export { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = Omit<ComponentProps<typeof SafeAreaViewNative>, 'edges'> & {
  edges?: EdgeRecord;
};

export const SafeAreaView = ({ children, edges, ...props }: Props) => {
  return (
    <SafeAreaViewNative
      edges={{
        top: edges?.top ?? 'additive',
        left: edges?.left ?? 'additive',
        right: edges?.right ?? 'additive',
        bottom: edges?.bottom ?? 'additive',
      }}
      {...props}
    >
      {children}
    </SafeAreaViewNative>
  )
}