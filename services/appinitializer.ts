import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';

const GITHUB_JSON_URL = "https://raw.githubusercontent.com/Newton-oyweri/cshub/main/version.json";

// 1. This handler ensures the notification pops up even if the app is OPEN
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const welcomeMessages = [
  "Welcome to CSHub! Ready to code?",
  "Hello Dev! Why not make a post today?",
  "Create your profile and join the community!",
  "Check out the latest student resources!",
  "Stay updated with the local tech scene."
];

export async function setupNotifications() {
  if (Platform.OS !== 'android') return;

  try {
    // 2. Set up the mandatory Android Channel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status === 'granted') {
      const randomGreeting = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      
      // 3. Trigger immediate notification
      await Notifications.scheduleNotificationAsync({
        content: { 
          title: "CSHub", 
          body: randomGreeting,
          sound: true,
        },
        trigger: null, // null means "Right Now"
      });
      console.log("✅ Welcome notification triggered.");
    } else {
      console.log("❌ Notification permissions not granted.");
    }
  } catch (e) {
    console.log("🔥 Notification Error:", e);
  }
}

export async function checkUpdates() {
  if (Platform.OS !== 'android') return;

  try {
    const currentVersion = Constants.expoConfig?.version;
    const response = await fetch(GITHUB_JSON_URL);
    const remote = await response.json();

    if (remote.version !== currentVersion) {
      Alert.alert(
        "Update Available",
        `Update CSHub to v${remote.version}?`,
        [
          { text: "Later" }, 
          { text: "Update", onPress: () => downloadUpdate(remote.url) }
        ]
      );
    }
  } catch (e) {
    console.log("⚠️ Update check failed.");
  }
}

async function downloadUpdate(url: string) {
  const fileUri = `${FileSystem.documentDirectory}cshub-update.apk`;
  try {
    const { uri } = await FileSystem.downloadAsync(url, fileUri);
    const contentUri = await FileSystem.getContentUriAsync(uri);
    
    await IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
      data: contentUri,
      flags: 1 | 268435456, 
    });
  } catch (err) {
    console.log("🔥 Download Error:", err);
  }
}