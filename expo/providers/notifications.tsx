import { useAccount } from "@/lib/convex/auth";
import { api, useMutation, useQuery } from "@/lib/convex/client";
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Href, router } from "expo-router";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { Platform } from "react-native";

const triggeredAtom = atom(false);

// First, set the handler that will cause the notification
// to show the alert
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'web') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync("streak", {
      name: "Daily Streak Reminders",
      importance: Notifications.AndroidImportance.MAX,
    });
    await Notifications.setNotificationChannelAsync("generation_ready", {
      name: "Generation Ready",
      importance: Notifications.AndroidImportance.HIGH,
    });
    await Notifications.setNotificationChannelAsync("social", {
      name: "Likes, Tags & Followers",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') { return; }

  // Learn more about projectId:
  // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
  // EAS projectId is used here.
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error('Project ID not found');
    }
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch { }

  return token;
}

function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') {
        // ⚠️ Make sure to validate/sanitize the URL in a real app to avoid open redirect vulnerabilities
        router.push(url as Href);
      }
    }

    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      redirect(response.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [triggered, setTriggered] = useAtom(triggeredAtom);
  const { user } = useAccount();

  // Observe notifications to handle navigation when a notification is tapped
  useNotificationObserver();

  // Set the app badge count to the number of unread notifications
  const { data: unreadCount } = useQuery(api.router.notifications.getUnread.authed, user ? undefined : 'skip');
  useEffect(() => {
    if (unreadCount !== undefined) { Notifications.setBadgeCountAsync(unreadCount.length).catch(() => null); }
  }, [unreadCount]);

  // Register for push notifications and save the token in the database when the user logs in
  const { mutate: register } = useMutation(api.router.notifications.registerPushToken.authed);
  useEffect(() => {
    if (!user) return;
    if (triggered) return;

    registerForPushNotificationsAsync().then(token => {
      if (token) { register({ token }); }
    }).catch(() => null);

    setTriggered(true);
  }, [user, register, setTriggered, triggered])

  return children;
}