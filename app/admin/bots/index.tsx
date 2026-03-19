import { ROUTES, useRouter } from "@/hooks";
import { api, useQuery } from "@/lib/convex/client";
import { Badge } from "@ui/badge";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { FlashList } from "@ui/flat-list";
import { ArrowUpRight, Camera, Loader, TShirt, User } from "@ui/icons";
import { Image } from "@ui/image";
import { Modal, ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { useState } from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";

type SharedProps = { style?: ViewStyle }

export const PendingBots = (props: SharedProps) => {
  const { data: pendingBots } = useQuery(api.router.admin.bots.getWaiting.admin);
  const results = (pendingBots?.filter((p) => p.latestGeneration)
    .filter((p) => p.latestGeneration?.status !== 'COMPLETED')) || [];

  if (results.length === 0) return null;

  return (
    <View style={props.style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <Text.H4 color={Colors.neutral[50]}>Pending</Text.H4>
        <Text.Base color={Colors.neutral[400]}>({results.length})</Text.Base>
      </View>
      {results
        .sort((a, b) => (a.lastGeneratedAt || 0) - (b.lastGeneratedAt || 0))
        .slice(0, 3).map((i) => {
          const isLoading = i.latestGeneration?.status === 'LOADING';
          return (
            <Pressable
              style={{ width: '100%', marginBottom: 8 }}
              key={i.latestGeneration?._id ?? i._id}
              onPress={() => i.latestGeneration ?
                router.push(`/admin/bots/generations/${i.latestGeneration?._id}`) : null}
            >
              <Block
                variant="blur"
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingLeft: 20,
                  paddingRight: 24,
                  borderRadius: 28,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <Image
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 99,
                    borderTopWidth: 1,
                    borderColor: Colors.blur.medium,
                  }}
                  source={i.user?.image ?? require('assets/backgrounds/dark-gradient.png')}
                />
                <View style={{ flex: 1 }}>
                  <Text.Sm color={Colors.neutral[400]} style={{ marginBottom: 2 }}>
                    @{i.user?.username}
                  </Text.Sm>
                  {isLoading ? (
                    <Text.Base color={Colors.neutral[400]}>
                      Generating...
                    </Text.Base>
                  ) : (
                    <Text.Base color={Colors.primary[500]}>
                      Waiting for review
                    </Text.Base>
                  )}
                </View>
                {isLoading ? <Loader size={20} color={Colors.neutral[400]} /> : <ArrowUpRight size={20} color={Colors.primary[500]} />}
              </Block>
            </Pressable>
          )
        })}
      {(results.length - 3 > 0) && (
        <Text.Sm color={Colors.neutral[400]} style={{ marginHorizontal: 'auto', marginTop: 6 }}>
          {results.length - 3} more to show...
        </Text.Sm>
      )}
    </View>
  )
}

export const WaitingBots = (props: SharedProps) => {
  const { push } = useRouter();
  const { data: waitingBots } = useQuery(api.router.admin.bots.getWaiting.admin);
  const results = waitingBots || [];

  if (results.length === 0) return null;

  return (
    <View style={props.style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <Text.H4 color={Colors.neutral[50]}>Waiting</Text.H4>
        <Text.Base color={Colors.neutral[400]}>({results.length})</Text.Base>
      </View>
      {results
        .sort((a, b) => (a.lastGeneratedAt || 0) - (b.lastGeneratedAt || 0))
        .slice(0, 3).map((i) => {
          return (
            <Pressable
              onPress={() => push(`/admin/bots/generate`, { params: { userId: i.userId } })}
              style={{ width: '100%', marginBottom: 8 }}
              key={i._id}
            >
              <Block
                variant="blur"
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingLeft: 20,
                  paddingRight: 24,
                  borderRadius: 28,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <Image
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 99,
                    borderTopWidth: 1,
                    borderColor: Colors.blur.medium,
                  }}
                  source={i.user?.image ?? require('assets/backgrounds/dark-gradient.png')}
                />
                <View style={{ flex: 1 }}>
                  <Text.Sm color={Colors.neutral[400]} style={{ marginBottom: 2 }}>
                    @{i.user?.username}
                  </Text.Sm>
                  <Text.Base color={Colors.neutral[50]}>
                    Last posted {i.lastGeneratedAt > 0 ? Math.floor((Date.now() - i.lastGeneratedAt) / (1000 * 60 * 60 * 24)) : 999} days ago
                  </Text.Base>
                </View>
                <ArrowUpRight size={20} color={Colors.primary[500]} />
              </Block>
            </Pressable>
          )
        })}
      {(results.length - 3 > 0) && (
        <Text.Sm color={Colors.neutral[400]} style={{ marginHorizontal: 'auto', marginTop: 6 }}>
          {results.length - 3} more to show...
        </Text.Sm>
      )}
    </View>
  )
}

export const Bots = (props: SharedProps) => {
  const { push } = useRouter();
  const { data: bots } = useQuery(api.router.admin.bots.getAll.admin);

  const [modal, setModal] = useState<string | null>(null);

  return (
    <View style={props.style}>
      <Text.H4 color={Colors.neutral[50]}>Bots</Text.H4>
      <FlashList
        data={bots}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={false}
        style={{ marginTop: 20 }}
        numColumns={3}
        renderItem={({ item }) => (
          <>
            <Pressable
              onLongPress={() => push(ROUTES.USER.PATH, { pathParams: { id: item._id } })}
              // onPress={() => push(`/admin/bots/generate`, { params: { userId: item._id } })}
              onPress={() => setModal(item._id)}
              style={{
                marginHorizontal: 12,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
                flex: 1,
              }}
            >
              <Badge
                source={item.image ?? require('assets/backgrounds/dark-gradient.png')}
                style={{ width: 86, height: 86, marginBottom: 16 }}
              />
              <Text.Sm
                numberOfLines={1}
                color={Colors.neutral[400]}
                style={{ textAlign: 'center' }}
                weight={600}
              >
                @{item.username}
              </Text.Sm>
            </Pressable>
            <Modal
              open={modal === item._id}
              onOpenChange={(v) => setModal(v ? item._id : null)}
              header={{
                title: item.name,
              }}
            >
              <View style={{ padding: 12, paddingTop: 0, gap: 12 }}>
                <Button
                  variant="blur"
                  onPress={() => { push(ROUTES.USER.PATH, { pathParams: { id: item._id } }); setModal(null); }}
                  startIcon={User}
                >
                  View profile
                </Button>
                <Button
                  variant="blur"
                  onPress={() => { push('/admin/bots/generate', { params: { userId: item._id } }); setModal(null); }}
                  startIcon={Camera}
                >
                  Generate Photoshoot
                </Button>
                <Button
                  variant="blur"
                  onPress={() => { push(ROUTES.ADMIN.BOTS.OUTFITS.EXTRACTOR, { params: { userId: item._id } }); setModal(null); }}
                  startIcon={TShirt}
                >
                  Extract Outfits
                </Button>
              </View>
            </Modal>
          </>
        )}
      />
      <Button
        variant="blur"
        style={{ marginBottom: 12 }}
        onPress={() => router.push('/admin/bots/create')}>
        Create one
      </Button>
    </View>
  )
}


export default function Screen() {
  return (
    <SafeScrollView contentContainerStyle={{ padding: 12 }}>
      <ModalHeader
        title="Bots"
        onBack={router.canGoBack() ? router.back : undefined}
      />
      <PendingBots style={{ marginBottom: 28 }} />
      <WaitingBots style={{ marginBottom: 28 }} />
      <Bots />
    </SafeScrollView>
  )
}