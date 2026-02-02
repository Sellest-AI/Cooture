import { View, ViewStyle } from 'react-native';
import { Colors } from 'theme';
import { Loader } from './icons';

type Props = {
  className?: string;
  style?: ViewStyle
}

export const LoadingBlock = ({ style }: Props) => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        ...style,
      }}
    >
      <Loader color={Colors.primary[500]} size={28} />
    </View>
  )
}