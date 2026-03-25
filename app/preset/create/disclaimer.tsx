import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ImageIcon, Smile, TriangleAlert, User } from "@ui/icons";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";

const Information = ({ icon, title, subtitle, style }: { icon: ReactNode, title: string, subtitle: string, style?: ViewStyle }) => {
  return (
    <Block
      variant="blur"
      style={{
        borderRadius: 28,
        paddingLeft: 8,
        paddingRight: 20,
        paddingVertical: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        ...style,
      }}
    >
      <Block
        variant="primary"
        style={{
          width: 64,
          aspectRatio: 1,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 22,
        }}
      >
        {icon}
      </Block>
      <View style={{ flex: 1, gap: 6, flexShrink: 1 }}>
        <Text.Base color={Colors.primary[500]} weight={500}>{title}</Text.Base>
        <Text.Sm color={Colors.neutral[200]}>{subtitle}</Text.Sm>
      </View>
    </Block>
  )
}


export default function Screen() {
  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Information
        icon={<User size={28} color={Colors.primary[900]} />}
        title="Only one subject per image"
        subtitle="We cannot generate presets that includes multiple subjects."
      />
      <Information
        icon={<ImageIcon size={28} />}
        title="How are you charged ?"
        subtitle="You pay credits for each image uploaded. You are still charged if you cancel the creation."
        style={{ marginTop: 16 }}
      />
      <Information
        icon={<TriangleAlert size={28} color={Colors.primary[900]} />}
        title="Please read carefully"
        subtitle="Provocatives or NSFW images will be rejected by our moderation system."
        style={{ marginTop: 16 }}
      />
      <Information
        icon={<Smile size={28} />}
        title="Have fun creating your presets!"
        subtitle="We do not offer refunds for presets created that do not meet our guidelines."
        style={{ marginTop: 16, marginBottom: 24 }}
      />
      <View style={{
        flex: 1,
        justifyContent: 'flex-end',
      }}>
        <Button
          variant="primary"
          onPress={() => router.push('/preset/create/new')}
        >
          Next
        </Button>
      </View>
    </View>
  )
}