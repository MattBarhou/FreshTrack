import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../db/firebase";
import {
  scheduleExpirationNotification,
  cancelNotification,
} from "./notifications";

// This function checks all items and schedules notifications for those without them
export async function checkItemsAndScheduleNotifications() {
  try {
    const querySnapshot = await getDocs(collection(db, "foodItems"));

    for (const docSnap of querySnapshot.docs) {
      const item = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      // Skip items that already have a notification scheduled
      if (item.notificationId) continue;

      // Skip items that are already expired
      if (item.daysLeft <= 0) continue;

      // Schedule notification for items without one
      const notificationId = await scheduleExpirationNotification(item);

      // Save notification ID to the item
      if (notificationId) {
        await updateDoc(doc(db, "foodItems", item.id), {
          notificationId: notificationId,
        });
      }
    }

    console.log("Finished checking items and scheduling notifications");
  } catch (error) {
    console.error("Error in checkItemsAndScheduleNotifications:", error);
  }
}

// This can be called when the app starts to ensure all items have notifications
export async function setupInitialNotifications() {
  await checkItemsAndScheduleNotifications();
}
