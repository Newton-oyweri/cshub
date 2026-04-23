import { Stack } from "expo-router";
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';

export default function RootLayout() {
  useEffect(() => {
    console.log("🚀 App Started: Checking Platform...");
    
    if (Platform.OS === 'android') {
      console.log("📱 Android detected. Initializing setup...");
      runInitialization();
    } else {
      console.log("🌐 Non-Android platform. Skipping native setup.");
    }
  }, []);

  async function runInitialization() {
    await setupNotifications();
    await checkUpdates();
  }

  async function setupNotifications() {
    console.log("🔔 Step 1: Requesting Notification Permissions...");
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log(`📊 Notification Status: ${status}`);

      if (status !== 'granted') {
        console.log("❌ Permission Denied by user.");
        return;
      }

      console.log("✅ Permission Granted. Scheduling Test Notification...");
      await Notifications.scheduleNotificationAsync({
        content: { title: "CSHub", body: "Notifications are active!" },
        trigger: null,
      });
    } catch (e) {
      console.log("🔥 Error in Notification Setup:", e);
    }
  }

  async function checkUpdates() {
    console.log("🔍 Step 2: Checking for Updates on GitHub...");
    try {
      const currentVersion = Constants.expoConfig?.version;
      console.log(`Current Local Version: ${currentVersion}`);

      const GITHUB_JSON_URL = "https://raw.githubusercontent.com/Newton-oyweri/cshub/main/version.json";
      const response = await fetch(GITHUB_JSON_URL);
      const remote = await response.json();
      
      console.log(`Remote Version Found: ${remote.version}`);

      if (remote.version !== currentVersion) {
        console.log("🆕 Update Found! Showing Alert to user...");
        Alert.alert(
          "Update Available",
          `Update CSHub to v${remote.version}?`,
          [{ text: "Later" }, { text: "Update", onPress: () => downloadUpdate(remote.url) }]
        );
      } else {
        console.log("✅ App is up to date.");
      }
    } catch (e) {
      console.log("⚠️ Update check failed (Likely network or missing version.json).");
    }
  }

  async function downloadUpdate(url: string) {
    console.log("⏳ Step 3: Starting APK Download...");
    const fileUri = `${FileSystem.documentDirectory}cshub-update.apk`;
    
    try {
      console.log(`Downloading from: ${url}`);
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      console.log(`✅ Download complete. Saved to: ${uri}`);

      console.log("🛠️ Step 4: Launching Android Intent Installer...");
      const contentUri = await FileSystem.getContentUriAsync(uri);
      
      await IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
        data: contentUri,
        flags: 1,
      });
      console.log("🚀 Installer UI opened.");
    } catch (err) {
      console.log("🔥 Critical Error during Update:", err);
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}