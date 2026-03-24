import { View, ViewStyle } from 'react-native';
import { Colors } from 'theme';
import { Loader, LogoLoading } from './icons';

type Props = {
  className?: string;
  style?: ViewStyle;
  type?: 'logo' | 'loader'
}

export const LoadingBlock = ({ style, type = 'loader' }: Props) => {
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
      {type === 'loader' ? (
        <Loader color={Colors.primary[500]} size={28} />
      ) : (
        <LogoLoading size={64} variant="primary" />
      )}
    </View>
  )
}