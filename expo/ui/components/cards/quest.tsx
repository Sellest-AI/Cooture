import { ComponentProps } from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { Image } from "../image";
import { Text } from '../text';

type Props = {
  style?: ViewStyle;
  source?: ComponentProps<typeof Image>['source'];
  title: string;
  description: string;
  progress: { completed: number; total: number };
  credits?: number;
}

export const Quest = ({ style, source, title, description, progress, credits }: Props) => {
  return (
    <View style={{
      alignItems: 'center',
      ...style,
    }}>
      <Image
        source={source}
        contentFit={"contain"}
        style={{
          width: 100,
          height: 100,
        }}
      />
      <Text.Base color={Colors.neutral[50]} weight={600} style={{ marginTop: 12, width: '95%', textAlign: 'center' }} numberOfLines={1}>
        {title}
      </Text.Base>
      <Text.Sm color={Colors.neutral[400]} style={{ marginTop: 6, width: '95%', textAlign: 'center' }} numberOfLines={2}>
        {progress.completed} / {progress.total} {description}
      </Text.Sm>
      <View style={{
        marginTop: 12,
        maxWidth: 85,
        width: '100%',
        height: 4,
        backgroundColor: Colors.primary[900],
        borderRadius: 99,
        overflow: 'hidden',
      }}>
        <View style={{
          width: `${(progress.completed / progress.total) * 100}%`,
          height: '100%',
          backgroundColor: Colors.primary[500],
        }}
        />
      </View>
    </View>
  )
}