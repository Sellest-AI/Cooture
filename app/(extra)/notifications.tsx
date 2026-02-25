import { api, Id } from "@/lib/convex/api";
import { useMutation, usePaginatedQueryCached, useQueryCached } from "@/lib/convex/client";
import { EmptyBlock } from "@ui/block.empty";
import { Notification } from "@ui/cards";
import { Bell } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { router } from "expo-router";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const GenerationNotification = ({ generationId, onPress }: { generationId: Id<'generations'>; onPress?: () => void }) => {
  const { data: generation } = useQueryCached(api.router.generations.getOne.authed, { generationId: generationId });

  const presetId = generation?.presetId;
  const { data: preset } = useQueryCached(api.router.presets.getOne.anon, presetId ? { presetId } : 'skip');

  const imageIds = generation?.predictions.map((p) => p.imageId).filter(notEmpty);
  const { data: images } = useQueryCached(api.router.storage.images.getMany.anon, imageIds ? { imageIds } : 'skip')

  const completed = generation?.status === 'COMPLETED';

  const imagesLoaded = !imageIds || (images && (imageIds ?? []).length > 0);
  if (!preset || !generation || !imagesLoaded) return <Notification.Skeleton />

  return (
    <Notification
      read={completed}
      onPress={() => {
        onPress?.();
        router.push(ROUTES.PHOTOSHOOT.GENERATIONS.ID(generationId));
      }}
      leftImage={preset?.cover?.sizes.thumbnail.url}
      rightImage={{ url: images?.[0]?.sizes.thumbnail.url }}
      date={generation.completedAt ?? generation._creationTime}
    >
      {(DateComponent) => <Text.Base color={Colors.neutral[50]}>
        {"Your photoshoot"}
        <Text.Base color={Colors.foreground} weight={600}> {`"${preset.name}" `}</Text.Base>
        {completed ? "is ready!" : "is being generated."}
        <DateComponent style={{ marginLeft: 6 }} />
      </Text.Base>}
    </Notification>
  )
}

type GenereticNotificationProps = {
  id: Id<'notifications'>;
  onPress?: () => void;
  read?: boolean;
}
const GenericNotification = ({ id, onPress, read }: GenereticNotificationProps) => {
  const _unread = useQueryCached(api.router.notifications.getUnread.authed);
  const unread = (_unread?.data ?? []);
  const notification = unread.find((n) => n._id === id);

  const rightImageId = notification?.generation?.coverId ?? notification?.outfit?.coverId;
  const { data: rightImage } = useQueryCached(api.router.storage.images.getOne.anon, rightImageId ? { id: rightImageId } : 'skip');

  const TextComponent = useCallback(() => {
    if (!notification) return null;

    const aggregationCount = notification.aggregationCount ?? 1;

    if (notification.type === "new_like") {
      return <>
        <Text.Base color={Colors.foreground} weight={600}>{notification.actor?.name} </Text.Base>
        {aggregationCount > 1 ? `${aggregationCount} people liked your post.` : "liked your post."}
      </>
    }

    if (notification.type === "new_follower")
      return <>
        <Text.Base color={Colors.foreground} weight={600}>{notification.actor?.name} </Text.Base>
        started following you.
      </>

  }, [notification])

  if (!notification) return null;

  return (
    <Notification
      read={read}
      onPress={() => {
        onPress?.()
        requestAnimationFrame(() => {
          if (notification.type === "new_like") {
            if (notification.outfitId) router.push(ROUTES.OUTFIT.ID(notification.outfitId));
            if (notification.generation) router.push(ROUTES.POST.ID(notification.generation.firstPredictionId));
          }
          if (notification.type === "new_follower") {
            if (notification.actor) router.push(ROUTES.USER.ID(notification.actor._id));
          }
          if (notification.type === "tagged_in_generation") {
            if (notification.generation) router.push(ROUTES.POST.ID(notification.generation.firstPredictionId));
          }
        });
      }}
      leftImage={notification.actor?.image}
      rightImage={rightImageId ? {
        url: rightImage?.sizes.thumbnail.url,
        backgroundColor: notification.outfit?.backgroundColor
      } : undefined}
      date={notification._creationTime}
    >
      {(DateComponent) => <Text.Base color={Colors.neutral[50]}>
        <TextComponent />
        <DateComponent style={{ marginLeft: 6 }} />
      </Text.Base>}
    </Notification>
  )
}

const readAtoms = atom(new Set<Id<'notifications'>>());

export default function Screen() {
  // Mark notifications as read when leaving the screen
  const [notificationsRead, setNotificationsRead] = useAtom(readAtoms);
  const { mutate: readNotifications } = useMutation(api.router.notifications.readNotifications.authed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => { readNotifications({ notificationIds: Array.from(notificationsRead) }) }, [])

  const _generations = usePaginatedQueryCached(api.router.generations.getPaginated.authed, {}, { initialNumItems: 12 });
  const generations = (_generations.results ?? []);

  const _notifications = usePaginatedQueryCached(api.router.notifications.getPaginated.authed, {}, { initialNumItems: 12 });
  const notifications = (_notifications.results ?? []);

  const _unread = useQueryCached(api.router.notifications.getUnread.authed);
  const unread = (_unread?.data ?? []);

  const isEmpty = !_generations.isLoading && generations.length === 0
    && !_notifications.isLoading && notifications.length === 0
    && !_unread.isPending && unread.length === 0;

  const canLoadMore = _generations.status === "CanLoadMore"
    || _notifications.status === "CanLoadMore";

  const pendingGenerations = generations.filter((g) => g.status !== 'COMPLETED');

  const Component = isEmpty ? View : SafeScrollView;

  return (
    <Component
      style={{
        padding: 12,
        paddingHorizontal: 8,
        paddingTop: 0,
        flex: isEmpty ? 1 : undefined
      }}
      stickyHeaderIndices={[0]}
      onReachEnd={() => { if (canLoadMore) _generations.loadMore(12); }}
    >
      <ModalHeader
        style={{ backgroundColor: Colors.background, paddingTop: 12, paddingHorizontal: 4 }}
        onBack={() => router.canGoBack() ? router.back() : router.dismissTo(ROUTES.TABS.FEED)}
        title="Notifications"
        type="alt"
      />
      {isEmpty && <EmptyBlock
        style={{ marginTop: -52 }}
        icon={Bell}
        title="Notifications"
        description="You have no notifications at the moment. When you generate new images, you'll see them here."
        cta={{
          onPress: () => router.replace(ROUTES.PHOTOSHOOT.NEW),
          label: "New Photoshoot"
        }}
      />}
      {pendingGenerations.map((generation) => (
        <GenerationNotification
          key={generation._id}
          generationId={generation._id}
          onPress={() => {
            const notification = unread.find((u) => u.generationId === generation._id);
            if (notification) setNotificationsRead((s) => new Set(s).add(notification._id));
          }}
        />
      ))}
      {unread.filter((n) => n.type !== 'generation_ready').map((notification) => (
        <GenericNotification
          key={notification._id}
          id={notification._id}
          onPress={() => { setNotificationsRead((s) => new Set(s).add(notification._id)) }}
          read={notificationsRead.has(notification._id)}
        />
      ))}
      {pendingGenerations.length > 0 &&
        <Text.Base color={Colors.foreground} weight={600} style={{ marginBottom: 8, marginLeft: 4 }}>
          Earlier
        </Text.Base>}
      {[
        ...generations.filter((g) => g.status === 'COMPLETED').map((g) => ({ ...g, type: 'GENERATION' as const })),
        ...notifications.filter((g) => g.type !== 'generation_ready').map((n) => ({ ...n, type: 'NOTIFICATION' as const }))
      ]
        .sort((a, b) => new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime())
        .map((notification) => {
          if (notification.type === "GENERATION") {
            return <GenerationNotification
              key={notification._id}
              generationId={notification._id}
              onPress={() => {
                const notif = unread.find((u) => u.generationId === notification._id);
                if (notif) setNotificationsRead((s) => new Set(s).add(notif._id));
              }}
            />
          }

          return (
            <GenericNotification
              key={notification._id}
              id={notification._id}
              onPress={() => { setNotificationsRead((s) => new Set(s).add(notification._id)) }}
              read={notificationsRead.has(notification._id)}
            />
          )
        })}
      {(canLoadMore || _generations.isLoading || _notifications.isLoading) && <>
        <Notification.Skeleton />
        <Notification.Skeleton />
        <Notification.Skeleton />
        <Notification.Skeleton />
      </>}
    </Component>
  )
}