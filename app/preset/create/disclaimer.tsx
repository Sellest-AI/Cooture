import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { TriangleAlert, User } from "@ui/icons";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { ReactNode } from "react";
import { ScrollView, View, ViewStyle } from "react-native";
import { Colors } from "theme";

const Information = ({ icon, title, subtitle, style }: { icon: ReactNode, title: string, subtitle: string, style?: ViewStyle }) => {
  return (
    <Block
      variant="blur"
      style={{
        borderRadius: 28,
        paddingLeft: 12,
        paddingRight: 20,
        paddingBottom: 16,
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 16,
        flex: 0,
        ...style,
      }}
    >
      <Block
        variant="blur"
        style={{
          maxWidth: 64,
          width: '100%',
          height: '100%',
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 22,
          flex: 1,
        }}
      >
        {icon}
      </Block>
      <View style={{ flex: 1, gap: 8, flexShrink: 1 }}>
        <Text.Base color={Colors.primary[500]} weight={600}>{title}</Text.Base>
        <Text.Base color={Colors.neutral[200]}>{subtitle}</Text.Base>
      </View>
    </Block>
  )
}


export default function Screen() {
  return (
    <ScrollView
      style={{ paddingHorizontal: 12, marginTop: 8 }}
      contentContainerStyle={{ paddingBottom: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: 32 }}>
        <Text.H4 color={Colors.neutral[50]} style={{ marginHorizontal: 'auto', marginBottom: 20 }}>
          How it works
        </Text.H4>
        <Information
          icon={<Text.H3 color={Colors.neutral[400]} style={{ lineHeight: 32 }}>1</Text.H3>}
          title="Upload a reference"
          subtitle="Choose a photo from your gallery. We'll extract its core style to build your custom preset."
        />
        <Information
          icon={<Text.H3 color={Colors.neutral[400]} style={{ lineHeight: 32 }}>2</Text.H3>}
          title="Credit usage"
          subtitle="Creating a preset costs credits. These are deducted upon upload and are non-refundable if you cancel."
          style={{ marginTop: 12 }}
        />
      </View>
      <View style={{ marginBottom: 32 }}>
        <Text.H4 color={Colors.neutral[50]} style={{ marginHorizontal: 'auto', marginBottom: 20 }}>
          Important guidelines
        </Text.H4>
        <Information
          icon={<User size={28} color={Colors.neutral[400]} />}
          title="Single subject only"
          subtitle="Your reference image must feature exactly one person. Group photos are not supported."
        />
        <Information
          icon={<TriangleAlert size={28} color={Colors.neutral[400]} />}
          title="Content moderation"
          subtitle="NSFW or provocative images will be rejected automatically. Credits spent here are non-refundable."
          style={{ marginTop: 12 }}
        />
      </View>
      <SafeAreaView
        edges={{ top: 'off', bottom: 'maximum' }}
        style={{
          marginTop: 16,
        }}>
        <Button
          variant="primary"
          onPress={() => router.push('/preset/create/new')}
        >
          I understand, continue
        </Button>
      </SafeAreaView>
    </ScrollView>
  )
}