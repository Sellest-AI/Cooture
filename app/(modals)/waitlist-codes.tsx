import { api, Doc, useMutation, useQueryCached } from "@/lib/convex/client";
import { Block } from "@ui/block";
import { Button, BUTTON_HEIGHT } from "@ui/button";
import { Copy, LogoLoading } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { setStringAsync } from 'expo-clipboard';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Colors } from "theme";

const CodeBlock = ({ ...code }: Doc<'waitlistCodes'>) => {
  const [copied, setCopied] = useState(false);

  return (
    <Block
      variant="blur"
      style={{
        paddingTop: 24,
        paddingBottom: 12,
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 32,
        marginBottom: 12,
      }}>
      <Text.H3 color={Colors.neutral[50]} style={{
        marginBottom: 16,
        opacity: code.usedById ? 0.5 : 1,
      }}>
        {code.code}
      </Text.H3>
      <Text.Base color={Colors.neutral[400]} style={{ marginBottom: 24, maxWidth: 212, textAlign: 'center' }}>
        Share your code with a friend ! Don&apos;t forget that this is a one time usage code
      </Text.Base>
      {code.usedById && <Text.Base weight={600} color={Colors.primary[500]} style={{ marginBottom: 12 }}>
        Already used
      </Text.Base>}
      {!code.usedById && <Button
        variant="primary"
        disabled={copied}
        startIcon={Copy}
        onPress={() => {
          setCopied(true);
          setStringAsync(code.code);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "Copied !" : "Copy code"}
      </Button>}
    </Block>
  )
}

export default function Screen() {
  const { data: codes, isPending } = useQueryCached(api.router.waitlist.getCodes.authed);
  const { mutate, isLoading, isSuccess } = useMutation(api.router.waitlist.generateCodes.authed);

  useEffect(() => {
    if (isSuccess) return;
    if (isLoading) return;
    if (isPending) return;
    if (codes && codes.length > 0) return;
    mutate().catch(() => null);
  }, [codes, isLoading, isPending, isSuccess, mutate])

  if (isPending || !codes)
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
      <LogoLoading size={128} />
    </View>

  return (
    <SafeAreaView
      edges={{ top: 'off' }}
      style={{
        flex: 1,
        padding: 12,
        paddingBottom: 0,
        justifyContent: 'space-between',
      }}
    >
      <ModalHeader
        title="Invite codes"
        onBack={router.canGoBack() ? router.back : undefined}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: BUTTON_HEIGHT + 12 }}
        showsVerticalScrollIndicator={false}
      >
        {codes.map((code) => (
          <CodeBlock
            {...code}
            key={code._id}
          />
        ))}
      </ScrollView>
      <Button
        variant="blur"
        onPress={router.canGoBack() ? router.back : undefined}
        style={{ position: 'absolute', bottom: 12, left: 0, right: 0 }}
      >
        Close
      </Button>
    </SafeAreaView>
  )
}