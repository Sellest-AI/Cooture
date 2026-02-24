import { api, useMutation, useQueryCachedData } from "@/lib/convex/client";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { QrCode } from "@ui/icons";
import { Image } from "@ui/image";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { View } from "react-native";
import { Colors } from "theme";
export default function Screen() {
  const [code, setCode] = useState("");

  const { data: stats } = useQueryCachedData(api.router.waitlist.getStatistics.anon, { key: 'waitlist-stats' });
  const { mutate: enterCode } = useMutation(api.router.waitlist.enterCode.authed);

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={require('assets/placeholders/can-model.png')}
        contentFit="cover"
        style={{
          position: 'absolute',
          inset: 0,
        }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 500
        }}
      />
      <View style={{
        justifyContent: 'flex-end',
        padding: 12,
        flex: 1,
      }}>
        <Block
          variant="blur"
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
            marginTop: 16,
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
            style={{ marginTop: 24, textAlign: 'center' }}>
            If you have a code to access the app, enter it bellow
          </Text.H4>
        </View>
        <TextInput
          style={{ marginTop: 36 }}
          startIcon={QrCode}
          placeholder="Code"
          value={code}
          onChangeText={setCode}
        />
        <Button
          style={{ marginTop: 8 }}
          variant="primary"
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
            <Text.Base color={Colors.neutral[50]} style={{ marginRight: 5 }}>
              {stats.numberOfUsers.toLocaleString("en")}
            </Text.Base>
            <Text.Base color={Colors.neutral[400]} >
              people are waiting
            </Text.Base>
          </View> : <Skeleton width={132} height={14} style={{ marginHorizontal: 'auto', marginTop: 8 }} />}
      </View>
    </View >
  )
}