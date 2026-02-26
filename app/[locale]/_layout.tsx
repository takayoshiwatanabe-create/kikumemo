import { Stack } from "expo-router"; // This will cause an error in Next.js
import { StatusBar } from "react-native"; // This will cause an error in Next.js
import { useEffect } from "react";
import { I18nProvider, useI18n } from "@/i18n";
import { View } from "react-native"; // This will cause an error in Next.js

export default function LocaleLayout() {
  return (
    <I18nProvider>
      <LocaleAwareStack />
    </I18nProvider>
  );
}

function LocaleAwareStack() {
  const { isRTL } = useI18n();

  useEffect(() => {
    // This effect ensures the global layout direction is set if needed
    // For React Native, this is often handled by specific components or libraries
    // Here, we might apply a global style or context if necessary for RTL
    // For now, it's a placeholder to demonstrate awareness.
    console.log("RTL status:", isRTL);
  }, [isRTL]);

  return (
    // This View and Stack are React Native components and will not work in Next.js
    <View style={{ flex: 1, flexDirection: isRTL ? 'row-reverse' : 'column' }}>
      <Stack>
        <Stack.Screen name="dashboard/index" options={{ title: "Dashboard" }} />
        <Stack.Screen name="record/index" options={{ title: "Record" }} />
        <Stack.Screen name="sessions/index" options={{ title: "Sessions" }} />
        <Stack.Screen name="sessions/[id]" options={{ title: "Session Detail" }} />
        <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
      </Stack>
      <StatusBar style="auto" />
    </View>
  );
}

