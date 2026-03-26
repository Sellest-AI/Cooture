import { useAuthActions } from "@/lib/convex/auth";
import { api, useMutation } from "@/lib/convex/client";
import { Button } from "@ui/button";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { WEBSITE } from "global";
import { useEffect, useState } from "react";
import { Linking, View } from "react-native";
import { Colors } from "theme";

export default function Screen() {
  const { signOut } = useAuthActions();

  const [countdown, setCountdown] = useState(10);
  useEffect(() => {
    if (countdown === 0) return;
    const timeout = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timeout);
  }, [countdown])

  const [confirm, setConfirm] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const { mutate: deleteAccount } = useMutation(api.router.users.deleteAccount.authed);

  return (
    <SafeAreaView
      edges={{ top: 'off' }}
      style={{
        padding: 12,
        flex: 1,
      }}>
      {requestSent ? <View style={{ alignSelf: 'center', maxWidth: 320 }}>
        <ModalHeader
          title="Request sent"
        />
        <Text.Base color={Colors.neutral[50]} style={{ textAlign: 'center' }}>
          Your account deletion request has been sent. Your account will be deleted within 30 days.
        </Text.Base>
        <Text.Base color={Colors.neutral[50]} style={{ textAlign: 'center', marginTop: 16 }}>
          If you change your mind, you can sign back in to cancel the deletion process.
        </Text.Base>
        <Text.Base color={Colors.neutral[50]} style={{ textAlign: 'center', marginTop: 16 }}>
          Sensitive and identifying data will be deleted. Shared content may be retained in anonymized form and will not be traceable back to you.
        </Text.Base>
        <Text.Base color={Colors.neutral[50]} style={{ textAlign: 'center', marginTop: 16 }}>
          If you have any questions or need assistance, please contact us at <Text.Base
            style={{ color: Colors.primary[500] }}
            onPress={() => Linking.openURL(`mailto:${WEBSITE.SUPPORT_EMAIL}`)}>{WEBSITE.SUPPORT_EMAIL}</Text.Base>.
        </Text.Base>
      </View>
        : <View style={{ alignSelf: 'center', maxWidth: 320 }}>
          <ModalHeader
            title="Account deletion"
          />
          <Text.Base color={Colors.neutral[50]} style={{ textAlign: 'center' }}>
            We are sorry to see you go! If you have any feedback or suggestions on how we can improve, please let us know at <Text.Base
              style={{ color: Colors.primary[500] }}
              onPress={() => Linking.openURL(`mailto:${WEBSITE.SUPPORT_EMAIL}`)}>{WEBSITE.SUPPORT_EMAIL}</Text.Base>.
          </Text.Base>
          <Text.Base color={Colors.destructive[500]} style={{ textAlign: 'center', marginTop: 24 }}>
            Once you delete your account, sensitive and identifying data will be permanently deleted and cannot be recovered. Other shared content may be retained only in anonymized form and cannot be traced back to you. This action cannot be undone.
          </Text.Base>
        </View>}
      <View style={{
        justifyContent: 'flex-end',
        marginTop: 48,
        gap: 12,
        flex: 1,
      }}>
        {!requestSent && <Button
          variant="destructive"
          disabled={countdown > 0}
          onPress={async () => {
            if (!confirm) {
              setConfirm(true);
              setCountdown(10);
              return;
            }

            await deleteAccount();

            setRequestSent(true);
          }}
        >
          {confirm ? `Are you sure?${countdown > 0 ? ` (${countdown})` : ''}` :
            `Delete my account${countdown > 0 ? ` (${countdown})` : ''}`}
        </Button>}
        {requestSent && <Button
          variant="primary"
          onPress={() => {
            signOut();
            router.replace('/');
          }}
        >
          Sign out
        </Button>}
        {!requestSent && <Button
          variant="blur"
          onPress={() => router.canGoBack() ? router.back() : router.dismissTo('/')}
        >
          Close
        </Button>}
      </View>
    </SafeAreaView >
  )
}