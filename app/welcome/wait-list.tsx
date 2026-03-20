import { ROUTES, useRouter } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import { api, useMutation, useQueryCachedData } from "@/lib/convex/client";
import { Block } from "@ui/block";
import { BlurKeys, BlurTargetView } from "@ui/blur-view";
import { Button } from "@ui/button";
import { QrCode } from "@ui/icons";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import { VideoView } from "@ui/video-view";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { View } from "react-native";
import { Colors } from "theme";

export default function Screen() {
  const { push } = useRouter(ROUTES.WELCOME.WAIT_LIST);
  const [code, setCode] = useState("");

  const { data: stats } = useQueryCachedData(api.router.waitlist.getStatistics.anon, { key: 'waitlist-stats' });
  const { mutate: enterCode } = useMutation(api.router.waitlist.enterCode.authed);

  const { user } = useAccount();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <BlurTargetView blurKey={BlurKeys.WAITLIST_BACKGROUND}
        style={{
          position: 'absolute',
          inset: 0,
          bottom: 128
        }}
      >
        <VideoView
          source={require('assets/backgrounds/main_video.mp4')}
          contentFit="cover"
          style={{ width: '100%', height: '100%' }}
        />
      </BlurTargetView>
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 200
        }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)', Colors.background]}
        style={{
          position: 'absolute',
          bottom: 128,
          left: 0,
          right: 0,
          height: 400
        }}
      />
      <View style={{
        justifyContent: 'flex-end',
        padding: 12,
        flex: 1,
      }}>
        <Block
          variant="blur"
          blurKey={BlurKeys.WAITLIST_BACKGROUND}
          style={{
            alignSelf: 'center',
            width: 'auto',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 99
          }}
        >
          <Text.Sm color={Colors.neutral[400]} weight={600}>Closed Beta</Text.Sm>
        </Block>
        <View
          style={{
            marginTop: 12,
            marginHorizontal: 'auto',
            width: '95%'
          }}
        >
          <Text.H1
            color={Colors.neutral[50]}
            style={{ textAlign: 'center' }}
            textBreakStrategy="balanced"
          >
            You have joined the waitlist
          </Text.H1>
          <Text.H4
            color={Colors.neutral[200]}
            textBreakStrategy="balanced"
            style={{ marginTop: 16, textAlign: 'center' }}>
            If you have a code to access the app, enter it bellow
          </Text.H4>
        </View>
        <TextInput
          style={{ marginTop: 24 }}
          startIcon={QrCode}
          placeholder="Code"
          value={code}
          onChangeText={setCode}
        />
        <Button
          style={{ marginTop: 8 }}
          variant="blur"
          disabled={code.length < 7}
          onPress={async () => {
            // Fake 1000ms
            await new Promise(resolve => setTimeout(resolve, 1000));
            await enterCode({ code });
          }}
        >
          Discover the future
        </Button>
        {stats ?
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8, alignItems: 'center' }}>
            <Text.Base color={Colors.neutral[50]} style={{ marginRight: 3 }}>
              {stats.numberOfUsers.toLocaleString("en")}
            </Text.Base>
            <Text.Base color={Colors.neutral[400]} >
              people are waiting
            </Text.Base>
          </View> : <Skeleton width={132} height={14} style={{ marginHorizontal: 'auto', marginTop: 8 }} />}

        <Button
          style={{ marginTop: 32 }}
          variant="primary"
          onPress={async () => {
            push(ROUTES.EXTRA.AVATAR.PROFILE, { redirectTo: ROUTES.EXTRA.AVATAR.APPEARANCE });
          }}
        >
          {user?.username ? "Edit profile" : "Claim my username"}
        </Button>
      </View>
    </View>
  )
}