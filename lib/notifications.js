import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}

export function setupNotificationListeners(onReceive, onRespond) {
  const subscriptionReceived =
    Notifications.addNotificationReceivedListener(onReceive);
  const subscriptionResponse =
    Notifications.addNotificationResponseReceivedListener(onRespond);

  return () => {
    subscriptionReceived.remove();
    subscriptionResponse.remove();
  };
}

// Schedule a notification for a food item
export async function scheduleExpirationNotification(item) {
  try {
    if (!item.expiryDate) return null;

    // Convert Firestore timestamp to JavaScript Date
    const expiryDate =
      item.expiryDate instanceof Date
        ? item.expiryDate
        : item.expiryDate.toDate();

    // Calculate when to send the notification (7 days before expiry)
    const notificationDate = new Date(expiryDate);
    notificationDate.setDate(notificationDate.getDate() - 7);

    // Don't schedule if the notification date is in the past
    if (notificationDate < new Date()) {
      console.log(
        `Not scheduling notification for ${item.name} - would be in the past`
      );
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🍎 Food Expiring Soon!",
        body: `${
          item.name
        } will expire in 7 days on ${expiryDate.toLocaleDateString()}`,
        data: { itemId: item.id },
      },
      trigger: notificationDate,
    });

    console.log(
      `Scheduled notification ${notificationId} for ${
        item.name
      } on ${notificationDate.toLocaleString()}`
    );
    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

// Cancel a scheduled notification
export async function cancelNotification(notificationId) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
