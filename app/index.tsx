import { Text, View } from "react-native";
import React from "react";

import useFirebaseMessaging from "../src/components/pushNotifications";

import AppNavigation from "../src/navigation/AppNavigatrion"; 

export default function Index() {
  useFirebaseMessaging();
  return (  
      <AppNavigation />
  );
}
