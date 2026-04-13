// app/webview.tsx
import { View, StyleSheet, ActivityIndicator, Text, SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useState } from 'react';

const SKYLA_CYAN = '#0DDDF0';
const SKYLA_DARK = '#0F1C38';
const SKYLA_NAVY = '#1C3150';

export default function WebViewScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url: string }>();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  if (!url) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="link-outline" size={60} color="#ff6b6b" />
          <Text style={styles.errorText}>No URL provided</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={SKYLA_NAVY} />

      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          GitHub Repository
        </Text>
      </View>

      {/* Progress Bar */}
      {isLoading && (
        <View style={styles.progressBarContainer}>
          <View 
            style={[styles.progressBar, { width: `${loadingProgress * 100}%` }]} 
          />
        </View>
      )}

      {/* WebView */}
      <WebView
        source={{ uri: url as string }}
        style={styles.webview}
        startInLoadingState={true}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onLoadProgress={({ nativeEvent }) => setLoadingProgress(nativeEvent.progress)}
        allowsBackForwardNavigationGestures={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={SKYLA_CYAN} />
            <Text style={styles.loadingText}>Loading from GitHub...</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SKYLA_DARK,
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    height: 45,
    backgroundColor: SKYLA_NAVY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    marginRight: 14,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 40, // balance the close button
  },
  closeButton: {
    padding: 4,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: SKYLA_CYAN,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SKYLA_DARK,
  },
  loadingText: {
    color: '#aaa',
    marginTop: 14,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SKYLA_DARK,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    marginTop: 16,
  },
});