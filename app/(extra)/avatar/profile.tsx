import { ROUTES, useDebounce, useRouter } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import { api, useAction, useMutation, useQuery } from "@/lib/convex/client";
import { compressImage } from "@/lib/image/client/editing";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ALargeSmall, AtSign, Loader, Plus } from "@ui/icons";
import { Image } from "@ui/image";
import { LinearGradient } from "@ui/linear-gradient";
import { Pressable } from "@ui/pressable";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import { launchImageLibraryAsync } from "expo-image-picker";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "theme";

type CircleAvatarProps = {
  size: number;
  source?: string;
  style?: ViewStyle;
  label?: string;
  onPress?: () => void;
}
const CircleAvatar = ({ style, size, source, label, onPress }: CircleAvatarProps) => {
  const [loading, setLoading] = useState(false);
  const Component = onPress ? Pressable : View;

  return (
    <Component
      onPress={async () => {
        if (onPress) {
          setLoading(true);
          await onPress();
          setLoading(false);
        }
      }}
      style={{
        ...style,
        alignItems: 'center'
      }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={source ?? require("assets/backgrounds/dark-gradient.png")}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: source ? 1 : 0.5,
            borderColor: Colors.blur.medium,
            borderWidth: onPress ? 1 : 0,
          }}
        />
        {!source && !loading && <Plus
          color={Colors.neutral[50]}
          size={32}
          style={{ position: 'absolute' }}
        />}
        {loading && <View style={{ position: 'absolute' }} >
          <Loader size={32} color={Colors.neutral[50]} />
        </View>}
      </View>
      {label && <Block
        variant={"blur"}
        style={{
          flex: 0,
          marginTop: 12,
          flexDirection: 'row',
          gap: 4,
          paddingHorizontal: 12,
          paddingTop: 4,
          paddingBottom: 5,
          borderRadius: 99,
        }}>
        <Text.Sm color={Colors.neutral[200]} weight={600}>
          {label}
        </Text.Sm>
      </Block>}
    </Component>
  )
}

export default function Screen() {
  const { user } = useAccount();
  const { redirect } = useRouter();

  const [image, setImage] = useState<string | null>(null);
  const [username, setUsername] = useState(user?.username ?? '');
  const [displayName, setDisplayName] = useState(user?.name ?? '');

  const debouncedUsername = useDebounce(username, 1000);
  const hasUsername = debouncedUsername.length > 0;

  const { mutate: upsertProfile } = useMutation(api.router.users.upsertUsername.authed);
  const { action: upsertImage } = useAction(api.router.users.upsertImage.authed);
  const { data: usernameAvailable, isPending } = useQuery(api.router.users.checkUsername.anon,
    hasUsername ? { username: debouncedUsername } : 'skip');

  const isSame = user?.username === usernameAvailable?.sanitizedUsername;
  const isAvailable = isSame || usernameAvailable?.available;

  useEffect(() => {
    if (user && user.username) setUsername(user.username);
    if (user && user.name) setDisplayName(user.name);
  }, [user])

  useEffect(() => {
    if (
      usernameAvailable?.sanitizedUsername &&
      usernameAvailable.sanitizedUsername !== username
    ) {
      setUsername(usernameAvailable.sanitizedUsername);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameAvailable]);

  return (
    <SafeScrollView
      edges={{ top: 'off' }}
      style={{
        flex: 1,
        minHeight: Dimensions.get('window').height,
      }}>
      <LinearGradient
        colors={[Colors.primary[500], 'transparent']}
        style={{
          position: 'absolute',
          top: 0,
          height: 300,
          width: '100%',
          opacity: 0.2
        }}
      />
      <View style={{ padding: 8, paddingTop: 24, height: 320, position: 'relative' }}>
        <View>
          <CircleAvatar
            size={72}
            style={{ ...styles.circleAvatar, left: 8, top: 16 }}
            source={require("assets/placeholders/can-model.png")}
          />
          <CircleAvatar
            size={64}
            style={{ ...styles.circleAvatar, right: 40 }}
            source={require("assets/placeholders/bench-model.png")}
          />
          <CircleAvatar
            size={112}
            style={{ ...styles.circleAvatar, top: 56, left: '32%' }}
            source={image ?? user?.imageUrl}
            label="Import Image"
            onPress={async () => {
              try {
                const result = await launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsEditing: false,
                  quality: 1,
                  allowsMultipleSelection: false,
                });

                const photo = result.assets?.[0];
                if (!result.canceled && photo) {
                  const photoCompressed = await compressImage(photo.uri, { maxResolution: 192 });
                  const base64 = await photoCompressed.toBase64();
                  setImage(base64);
                }
              } catch { }
            }}
          />
          <CircleAvatar
            size={86}
            style={{ ...styles.circleAvatar, top: 104, right: 8 }}
            source={require("assets/placeholders/tiger-model.png")}
          />
          <CircleAvatar
            size={64}
            style={{ ...styles.circleAvatar, top: 140, left: 8 }}
            source={require("assets/placeholders/street-model.png")}
          />
          <CircleAvatar
            size={48}
            style={{ ...styles.circleAvatar, top: 240, left: 96 }}
            source={require("assets/placeholders/restaurant-model.png")}
          />
          <CircleAvatar
            size={56}
            style={{ ...styles.circleAvatar, top: 224, right: 86 }}
            source={require("assets/placeholders/snow-model.png")}
          />
        </View>
      </View>
      <View style={{
        alignItems: 'center',
        marginHorizontal: 'auto',
        maxWidth: 264,
        marginTop: 32,
      }}>
        <Text.H3 color={Colors.neutral[50]} style={{ textAlign: 'center' }}>
          {user?.username ? "Update" : "Choose"} your name
        </Text.H3>
        <Text.Base color={Colors.neutral[400]} style={{ textAlign: 'center', marginTop: 8 }} textBreakStrategy="balanced">
          This is how others will see you. You can always change it later.
        </Text.Base>
      </View>
      <View style={{
        paddingHorizontal: 12,
        marginTop: hasUsername ? 28 : 32,
      }}>
        {(hasUsername && !isSame) && <Text.Sm color={isAvailable ? Colors.primary[500] : Colors.secondary[500]} style={{ marginBottom: 8, textAlign: 'right', marginRight: 8 }}>
          {isPending && <View style={{ marginRight: 8 }}><Loader size={12} /></View>}
          {isAvailable ? "Available" : "Unavailable"}
        </Text.Sm>}
        <TextInput
          placeholder="Username (@joshuaduffy)"
          startIcon={AtSign}
          value={username}
          onChangeText={(v) => setUsername(v)}
          maxLength={24}
        />
        <Text.Sm color={Colors.neutral[400]} style={{ marginTop: 8 }}>
          Cannot include special characters. Cannot be changed later.
        </Text.Sm>
        <TextInput
          style={{ marginTop: 28 }}
          placeholder="Display name (Joshua Duffy)"
          startIcon={ALargeSmall}
          value={displayName}
          onChangeText={(v) => setDisplayName(v)}
          maxLength={50}
        />
        <Text.Sm color={Colors.neutral[400]} style={{ marginTop: 8 }}>
          Can be changed later.
        </Text.Sm>
      </View>
      <View style={{
        flex: 1,
        justifyContent: 'flex-end',
        padding: 12,
      }}>
        <Button
          style={{ marginTop: 32 }}
          variant="primary"
          disabled={!username || !displayName || !isAvailable}
          onPress={async () => {
            await upsertProfile({ username, displayName });
            if (image) await upsertImage({ base64: image });
            redirect({ fallbackTo: ROUTES.EXTRA.AVATAR.APPEARANCE });
          }}
        >
          Save
        </Button>
      </View>
    </SafeScrollView>
  )
}

const styles = StyleSheet.create({
  circleAvatar: {
    position: 'absolute',
  }
})