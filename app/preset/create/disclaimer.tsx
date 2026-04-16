import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { Credits, TriangleAlert, User } from "@ui/icons";
import { LinearGradient } from "@ui/linear-gradient";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Platform, ScrollView, View, ViewStyle } from "react-native";
import { Colors } from "theme";

type InformationProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  style?: ViewStyle;
  variant?: "blur" | "primary" | "destructive";
}
const Information = ({ icon, title, subtitle, style, variant = 'blur' }: InformationProps) => {
  const showGradient = variant !== 'blur';
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
        alignItems: "center",
        gap: 16,
        flex: 0,
        ...style,
      }}
    >
      {showGradient && <LinearGradient
        colors={[variant === 'primary' ? Colors.primary[500] : Colors.destructive[500], 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: Platform.OS === 'android' ? 200 : 400,
          opacity: Platform.OS === 'android' ? 0.1 : 0.15
        }}
      />}
      <Block
        variant={showGradient ? variant : "blur"}
        style={{
          maxWidth: 64,
          flexGrow: 1,
          alignSelf: "stretch",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 22,
          minHeight: 68,
          flex: 1,
        }}
      >
        {icon}
      </Block>
      <View style={{ flex: 1, gap: 8, flexShrink: 1 }}>
        <Text.Base color={variant === 'primary' ?
          Colors.primary[500] : variant === "blur" ? Colors.neutral[50] :
            Colors.destructive[500]}
          weight={600}
        >
          {title}
        </Text.Base>
        <Text.Sm color={variant === 'primary' ? Colors.primary[200] : Colors.neutral[200]}>
          {subtitle}
        </Text.Sm>
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
      <Information
        style={{ marginTop: 12, marginBottom: 32 }}
        icon={<Credits size={28} />}
        title="Win credits"
        subtitle="When others use your preset, you earn credits! Spread the word and watch your earnings grow."
        variant="primary"
      />
      <View style={{ marginBottom: 32 }}>
        <Text.H4 color={Colors.neutral[50]} style={{ marginHorizontal: 'auto', marginBottom: 20 }}>
          How it works 🤔
        </Text.H4>
        <Information
          icon={<Text.H3 color={Colors.neutral[400]} style={{ lineHeight: 32 }}>1</Text.H3>}
          title="Upload a reference"
          subtitle="Choose a photo from your gallery. We will extract its core style to build your custom preset."
        />
        <Information
          icon={<Text.H3 color={Colors.neutral[400]} style={{ lineHeight: 32 }}>2</Text.H3>}
          title="Credit usage"
          subtitle="Creating a preset costs credits. These are deducted upon upload and are non-refundable if you cancel."
          style={{ marginTop: 12 }}
        />
        <Information
          icon={<Text.H3 color={Colors.primary[900]} style={{ lineHeight: 32 }}>3</Text.H3>}
          title="Earn from your style"
          subtitle="Every time someone uses your preset, you earn credits! The more your preset is used, the more you earn."
          style={{ marginTop: 12 }}
          variant="primary"
        />
      </View>
      <View style={{ marginBottom: 32 }}>
        <Text.H4 color={Colors.neutral[50]} style={{ marginHorizontal: 'auto', marginBottom: 20 }}>
          Important guidelines 📍
        </Text.H4>
        <Information
          icon={<User size={28} color={Colors.neutral[400]} />}
          title="Single subject only"
          subtitle="Your reference image must feature exactly one person. Group photos are not supported."
        />
        <Information
          icon={<TriangleAlert size={28} color={Colors.destructive[50]} />}
          title="Content moderation"
          subtitle="NSFW or provocative images will be rejected automatically. Credits spent here are non-refundable."
          style={{ marginTop: 12 }}
          variant="destructive"
        />
      </View>
      <SafeAreaView
        edges={{ top: 'off', bottom: 'maximum' }}
      >
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