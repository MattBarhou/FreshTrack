import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import ScanScreen from "./screens/ScanScreen";
import { useState, useEffect } from "react";
import ItemDetailsScreen from "./screens/ItemDetailsScreen";
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from "./lib/notifications";
import Toast from "react-native-toast-message";
import { setupInitialNotifications } from "./lib/expiryChecker";

const Stack = createNativeStackNavigator();

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    const removeListeners = setupNotificationListeners(
      (notification) => {
        console.log("Notification Received:", notification);
      },
      (response) => {
        console.log("User responded to notification:", response);

        // // If the notification has itemId data, navigate to that item's details
        // const itemId = response.notification.request.content.data?.itemId;
        // if (itemId) {
        //
        // }
      }
    );

    // Set up initial notifications
    setupInitialNotifications();

    return removeListeners;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          options={{
            headerShown: false,
          }}
          component={HomeScreen}
        />
        <Stack.Screen
          name="Scan"
          options={{
            headerShown: false,
            headerBackVisible: false,
          }}
          component={ScanScreen}
        />
        <Stack.Screen
          name="ItemDetails"
          options={{
            headerShown: false,
          }}
          component={ItemDetailsScreen}
        />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
