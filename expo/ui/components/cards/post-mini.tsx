import { Skeleton } from "@ui/skeleton";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { Image } from '../image';
import { Pressable } from "../pressable";
import { Text } from "../text";

type Props = {
  style?: ViewStyle;
  onPress?: () => void;
  image?: {
    url: string;
    contentFit?: 'cover' | 'contain';
    backgroundColor?: string;
  }
  images?: {
    _id: string;
    url: string;
    contentFit?: 'cover' | 'contain';
    backgroundColor?: string;
  }[]
  users?: {
    onPress?: () => void;
    imageUrl?: string;
    name: string;
    username: string;
  }[]
}

export const PostMini = ({ style, onPress, image, images, users }: Props) => {
  const user = users?.[0];

  const _image = image || images?.[0];
  const hasMultiple = images && images.length > 1;

  return (
    <View
      style={{
        flexDirection: 'column',
        ...style
      }}
    >
      <Pressable onPress={onPress}>
        {images?.[1] && <Image
          source={images[1]?.url}
          style={{
            top: -3,
            right: -2,
            width: '98%',
            aspectRatio: 4 / 5,
            borderRadius: 16,
            position: 'absolute',
            transform: [{ rotate: '1deg' }],
            opacity: 0.6
          }}
        />}
        <Image
          source={_image?.url}
          style={{
            width: '100%',
            aspectRatio: 4 / 5,
            borderRadius: 16,
            shadowOffset: { width: 3, height: -3 },
            shadowRadius: 12,
            shadowColor: 'black',
            shadowOpacity: hasMultiple ? 0.3 : 0,
            backgroundColor: _image?.backgroundColor || Colors.blur.dark,
          }}
        />
      </Pressable>
      {user && <Pressable
        onPress={user.onPress}
        style={{
          marginTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 10
        }}>
        <View style={{
          width: 20, height: 20,
          borderRadius: 99,
          borderColor: Colors.blur.medium,
          borderWidth: 1,
          backgroundColor: Colors.blur.dark,
          overflow: 'hidden'
        }}>
          <Image source={user.imageUrl} style={{ flex: 1 }} />
        </View>
        <Text.Sm color={Colors.neutral[200]} weight={600}>{user.name}</Text.Sm>
      </Pressable>}
    </View>
  )
}

const PostSkeleton = ({ style }: { style?: ViewStyle }) => {
  return (
    <View style={style}>
      <Skeleton style={{ width: style?.width, aspectRatio: 4 / 5, borderRadius: 16 }} />
      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Skeleton style={{ width: 20, height: 20, borderRadius: 99 }} />
        <Skeleton style={{ width: 60, height: 12, borderRadius: 4 }} />
      </View>
    </View>
  )
}

PostMini.Skeleton = PostSkeleton;
