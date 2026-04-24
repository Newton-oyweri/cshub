import { Stack } from "expo-router";
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { setupNotifications, checkUpdates } from '../services/appinitializer';

export default function RootLayout() {
  useEffect(() => {
    // Run initialization logic
    const init = async () => {
      if (Platform.OS === 'android') {
        // Run these in parallel to speed up app launch
        await Promise.all([
          setupNotifications(),
          checkUpdates()
        ]);
      }
    };

    init();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}