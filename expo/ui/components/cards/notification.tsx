import { JSX, ReactNode, useCallback } from "react";
import { TextStyle, View } from "react-native";
import { Colors } from "theme";
import { Badge } from "../badge";
import { Block } from "../block";
import { Image } from "../image";
import { Pressable } from "../pressable";
import { Skeleton } from "../skeleton";
import { Text } from "../text";

type DateComponent = ({ style }: {
  style?: TextStyle | undefined;
}) => JSX.Element | null

type Props = {
  read?: boolean;
  onPress?: () => void;
  leftImage?: string;
  rightImage?: { url?: string; backgroundColor?: string };
  date?: number | Date;
  children?: ((date: DateComponent) => ReactNode) | string;
}

export const Notification = ({ read, onPress, leftImage, rightImage, date, children }: Props) => {
  const Component = read ? View : Block;

  const minutesAgo = date ? Math.floor((Date.now() - new Date(date).getTime()) / 60000) : null;
  const hoursAgo = minutesAgo !== null ? Math.floor(minutesAgo / 60) : null;
  const daysAgo = hoursAgo !== null ? Math.floor(hoursAgo / 24) : null;

  const timeAgoString = minutesAgo !== null ? minutesAgo < 60 ?
    (minutesAgo < 1 ? null : `${minutesAgo} m`)
    : hoursAgo !== null ? hoursAgo < 24 ? `${hoursAgo} h`
      : daysAgo !== null ? `${daysAgo} d` : null : null : null;

  const DateComponent = useCallback(({ style }: { style?: TextStyle }) => {
    if (!timeAgoString) return null;
    return (
      <Text.Base color={Colors.neutral[400]} style={style}>
        {timeAgoString}
      </Text.Base>)
  }, [timeAgoString])

  return (
    <Pressable
      onPress={onPress}
    >
      <Component
        variant="blur"
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 12,
          paddingHorizontal: read ? 8 : 12,
          marginBottom: read ? 8 : 16,
          borderRadius: 28,
          gap: 24,
          overflow: 'hidden',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          {!leftImage ?
            <Skeleton style={{ width: 46, height: 46, borderRadius: 99 }} /> :
            <Badge
              style={{ width: 46, height: 46, flexShrink: 0 }}
              source={leftImage}
            />
          }
          <View style={{
            overflow: 'hidden',
            flex: 1,
            minWidth: 0,
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
            {typeof children === 'string' ? (
              <Text.Base color={Colors.neutral[50]} weight={500}>
                {children}
                <DateComponent style={{ paddingLeft: 6 }} />
              </Text.Base>
            ) : (children?.(DateComponent))}
          </View>
        </View>
        {rightImage && <View style={{
          flexDirection: 'row',
          overflow: 'hidden',
          flexShrink: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: rightImage.backgroundColor ?? undefined,
          borderRadius: read ? 8 : 16,
          shadowOffset: { width: -2, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
        >
          {!rightImage.url && <Skeleton style={{ width: 52, height: 56 }} />}
          {rightImage.url && <View style={{
            padding: rightImage.backgroundColor ? 4 : 0,
            width: 52,
            height: 56,
          }}>
            <Image
              source={rightImage.url}
              contentFit={rightImage.backgroundColor ? 'contain' : 'cover'}
              style={{ shadowColor: 'black', width: '100%', height: '100%' }}
            />
          </View>}
        </View>}
      </Component>
    </Pressable>
  )
}

const NotificationSkeleton = () => {
  return (
    <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Skeleton style={{ width: 46, height: 46, borderRadius: 99 }} />
        <View style={{ marginLeft: 12, justifyContent: 'center' }}>
          <Skeleton style={{ width: 80, height: 14 }} />
          <Skeleton style={{ width: 128, height: 14, marginTop: 4 }} />
        </View>
      </View>
      <Skeleton style={{ width: 56, height: 56 }} />
    </View>
  )
}

Notification.Skeleton = NotificationSkeleton;
