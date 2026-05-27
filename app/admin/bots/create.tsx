import { compressImage } from "@/lib/image/client/editing";
import { useBot } from "@/modules/bots/_hooks/useBot";
import { Block } from "@ui/block";
import { Button, BUTTON_HEIGHT } from "@ui/button";
import { ALargeSmall, AtSign, Female, Gem, Loader, Mail, Male, Plus, User } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Slider } from "@ui/slider";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import { useToasts } from "@ui/toast";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ComponentProps, useEffect, useState } from "react";
import { ScrollView, View, ViewStyle } from "react-native";
import { Colors } from "theme";

type PlusImageProps = {
  children: string;
  onPress?: () => void;
}
const PlusImage = ({ children, onPress }: PlusImageProps) => {
  const [loading, setLoading] = useState(false);
  const Component = onPress ? Pressable : View;

  return (<Component style={{ height: '100%' }} onPress={async () => {
    setLoading(true);
    await onPress?.();
    setLoading(false);
  }}>
    <Block
      variant="blur"
      style={{
        height: '100%',
        paddingBottom: 16,
        paddingHorizontal: 32,
        paddingTop: 20,
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 32,
      }}
    >
      {loading ? <Loader size={32} color={Colors.neutral[50]} /> :
        <Plus size={32} color={Colors.neutral[50]} />}
      <Text.Base color={Colors.neutral[400]} weight={600}>
        {children}
      </Text.Base>
    </Block>
  </Component>)
}

type ContainerProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  style?: ViewStyle;
  headerStyle?: ViewStyle;
}
const Container = ({ title, subtitle, children, style, headerStyle }: ContainerProps) => {
  return (
    <View style={style}>
      <View style={headerStyle}>
        <Text.H4 color={Colors.neutral[50]} style={{ marginBottom: 8 }}>{title}</Text.H4>
        <Text.Base color={Colors.neutral[400]} style={{ marginBottom: 20 }}>{subtitle}</Text.Base>
      </View>
      {children}
    </View>
  )
}

const PressableButton = ({ startIcon, text, onPress, selected, style }: {
  onPress: () => void,
  selected?: boolean,
  startIcon?: ComponentProps<typeof Button>['startIcon'],
  text: string,
  style?: ViewStyle,
}) => {
  const StartIcon = startIcon;
  return (
    <Pressable style={{ flex: 1 }} onPress={onPress}>
      <Block
        variant={selected ? "primary" : "blur"}
        style={{ padding: 24, justifyContent: 'center', alignItems: 'center', gap: 12, ...style }}
      >
        {StartIcon && <StartIcon
          size={40}
          style={{ marginBottom: 8 }}
          color={selected ? Colors.primary[900] : Colors.neutral[50]}
        />}
        <Text.Base
          color={selected ? Colors.primary[900] : Colors.neutral[50]}
          weight={600}
        >
          {text}
        </Text.Base>
      </Block>
    </Pressable>
  )
}

const Appearance = () => {
  const { appearance, setAppearance } = useBot.New();
  const { ages, sizes, heights, sexes, skinTones } = useBot.Config;

  if (!appearance) return null;

  return (
    <Container
      title="Appearance"
      subtitle="Generate a personality & appearance"
      style={{ paddingHorizontal: 8, marginTop: 36 }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {sexes.map((sex) => (
          <PressableButton
            key={sex}
            startIcon={sex === "female" ? Female : Male}
            text={`${sex}`}
            onPress={() => setAppearance((p) => p ? ({ ...p, gender: sex }) : null)}
            selected={appearance.gender === sex}
          />
        ))}
      </View>
      <Text.Base color={Colors.neutral[400]} style={{ marginTop: 12, marginBottom: 8 }} weight={600}>
        Age
      </Text.Base>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {ages.map((age) => (
          <PressableButton
            key={age}
            text={`${age}`}
            onPress={() => setAppearance((p) => p ? ({ ...p, age: age }) : null)}
            selected={appearance.age === age}
            style={{ paddingHorizontal: 8 }}
          />
        ))}
      </View>
      <Slider
        style={{ marginTop: 16 }}
        value={appearance.heightCm}
        onValueChange={(v) => setAppearance(p => p ? ({ ...p, heightCm: v }) : null)}
        label="Height"
        labels={heights.map(h => ({ value: h, label: `${h}cm` }))}
      />
      <Slider
        style={{ marginTop: 16 }}
        value={sizes.findIndex(s => s === appearance.size)}
        onValueChange={(v) =>
          setAppearance(p => p ? ({ ...p, size: sizes[v] }) : null)}
        label="Size"
        labels={sizes.map(s => ({ value: sizes.findIndex(s2 => s2 === s), label: s }))}
      />
      <Text.Base color={Colors.neutral[400]} style={{ marginTop: 20, marginBottom: 8 }} weight={600}>
        Skin Tone
      </Text.Base>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {skinTones.map((skinTone) => (
          <PressableButton
            key={skinTone}
            text={skinTone}
            onPress={() => setAppearance((p) => p ? ({ ...p, skinTone }) : null)}
            selected={appearance.skinTone === skinTone}
          />
        ))}
      </View>
    </Container>
  )
}

const Images = () => {
  const { generateFace, images, setImages } = useBot.New();

  const buttonText = images ? "Re-Generate Face" : "Generate Face";

  const handlePickImage = async (type: 'side' | 'front' | 'smiling' | 'profilePicture') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const image = await compressImage(result.assets[0].uri, { maxResolution: 2048 });
        const base64 = await image.toBase64();
        setImages((p) => ({ ...p, [type]: { base64 } }));
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  return (
    <Container
      title="Images"
      subtitle="Import your Avatar"
      style={{ marginTop: 36 }}
      headerStyle={{ paddingHorizontal: 8 }}
    >
      <ScrollView
        contentContainerStyle={{ flexDirection: 'row', gap: 8, height: 156, paddingHorizontal: 8 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <Pressable onPress={() => handlePickImage('front')}>
          {images?.front ? <Image
            style={{ height: '100%', aspectRatio: 0.9, borderRadius: 32 }}
            source={images.front.url ?? images.front.base64}
          /> : <PlusImage>Front Image</PlusImage>}
        </Pressable>
        <Pressable onPress={() => handlePickImage('smiling')}>
          {images?.smiling ? <Image
            style={{ height: '100%', aspectRatio: 0.9, borderRadius: 32 }}
            source={images.smiling.url ?? images.smiling.base64}
          /> : <PlusImage>Smile Image</PlusImage>}
        </Pressable>
        <Pressable onPress={() => handlePickImage('side')}>
          {images?.side ? <Image
            style={{ height: '100%', aspectRatio: 0.9, borderRadius: 32 }}
            source={images.side.url ?? images.side.base64}
          /> : <PlusImage >Side Image</PlusImage>}
        </Pressable>
        <Pressable onPress={() => handlePickImage('profilePicture')}>
          {images?.profilePicture ? <Image
            style={{ height: '100%', aspectRatio: 0.9, borderRadius: 32 }}
            source={images.profilePicture.url ?? images.profilePicture.base64}
          /> : <PlusImage>Profile Picture</PlusImage>}
        </Pressable>
      </ScrollView>
      <Button
        startIcon={Gem}
        variant="secondary"
        style={{ marginTop: 12, marginHorizontal: 8 }}
        onPress={async () => await generateFace()}
      >
        {buttonText}
      </Button>
    </Container>
  )
}

export default function Screen() {
  const { identity, appearance, setIdentity, generateIdentity, hasAllImages, createOne, reset } = useBot.New();
  const { addToast } = useToasts();

  useEffect(() => {
    if (!identity) { generateIdentity(); }
  }, [generateIdentity, identity])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: BUTTON_HEIGHT + 24 }}
      >
        <ModalHeader
          title="Create bot"
          onBack={() => router.dismissTo('/admin/bots')}
          style={{ marginTop: 12, marginHorizontal: 12 }}
        />
        <Button
          startIcon={User}
          variant="secondary"
          style={{ marginHorizontal: 8 }}
          onPress={async () => await generateIdentity()}
        >
          Fill Avatar Details
        </Button>
        {identity && <Container
          title="Identity"
          subtitle="Generate username and details for your bot"
          style={{ paddingHorizontal: 8, marginTop: 28 }}
        >
          <TextInput
            startIcon={Mail}
            placeholder="Email"
            value={identity?.email}
            onChangeText={(v) => setIdentity(p => p ? ({ ...p, email: v }) : null)}
          />
          <TextInput
            startIcon={AtSign}
            placeholder="Username"
            value={identity?.username}
            onChangeText={(v) => setIdentity(p => p ? ({ ...p, username: v }) : null)}
            style={{ marginTop: 8 }}
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput
              startIcon={ALargeSmall}
              placeholder="First name"
              style={{ flexShrink: 1 }}
              value={identity?.firstName}
              onChangeText={(v) => setIdentity(p => p ? ({ ...p, firstName: v, name: `${v} ${identity?.lastName ?? ''}` }) : null)}
            />
            <TextInput
              startIcon={ALargeSmall}
              placeholder="Last name"
              style={{ flexShrink: 1 }}
              value={identity?.lastName}
              onChangeText={(v) => setIdentity(p => p ? ({ ...p, lastName: v, name: `${identity?.firstName ?? ''} ${v}` }) : null)}
            />
          </View>
          <TextInput
            startIcon={ALargeSmall}
            placeholder="Name"
            value={identity?.displayName}
            onChangeText={(v) => setIdentity(p => p ? ({ ...p, displayName: v }) : null)}
            style={{ marginTop: 8 }}
          />
        </Container>}
        <Appearance />
        <Images />
      </ScrollView>
      <View style={{
        position: 'absolute',
        bottom: 12,
        left: 8,
        right: 8,
      }}
      >
        <Button
          variant="primary"
          disabled={!hasAllImages || !identity || !appearance}
          onPress={async () => {
            try {
              await createOne();
              router.back();
              reset();
            } catch (error) {
              addToast({
                type: "error",
                title: "Create bot failed",
                description: error instanceof Error ? error.message : "Unknown error",
              });
            }
          }}
        >
          Save
        </Button>
      </View>
    </SafeAreaView>
  )
}