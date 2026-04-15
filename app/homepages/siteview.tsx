import { View, StyleSheet, ActivityIndicator, Text, SafeAreaView, StatusBar, Share, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useState, useMemo } from 'react';

const SKYLA_CYAN = '#0DDDF0';
const SKYLA_DARK = '#0F1C38';
const SKYLA_NAVY = '#1C3150';

export default function WebViewScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url: string }>();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const displayTitle = useMemo(() => {
    if (!url) return "Web Browser";
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return "Live Site";
    }
  }, [url]);

  const onShare = async () => {
    try {
      await Share.share({ message: url });
    } catch (error) {
      console.log(error);
    }
  };

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
    <View style={styles.container}>
      {/* Ensure StatusBar is visible but translucent */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* The Header now has safe padding to avoid collision */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Ionicons name="lock-closed" size={12} color={SKYLA_CYAN} style={{ marginRight: 4 }} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {displayTitle}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={onShare}
        >
          <Ionicons name="share-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar shifted below the dynamic header */}
      {isLoading && (
        <View style={styles.progressBarContainer}>
          <View 
            style={[styles.progressBar, { width: `${loadingProgress * 100}%` }]} 
          />
        </View>
      )}

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
          </View>
        )}
      />

      <View style={styles.bottomBar}>
  </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SKYLA_DARK,
  },
  header: {
    // Dynamic padding: uses StatusBar height for Android, fixed safe margin for iOS
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 80,
    paddingBottom: 10,
    backgroundColor: SKYLA_NAVY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  headerTitle: {
    color: '#eee',
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '85%',
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: 'transparent',
    width: '100%',
    zIndex: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: SKYLA_CYAN,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SKYLA_DARK,
  },
  bottomBar: {
    paddingBottom: Platform.OS === 'ios' ? 35 : 30, // Safe area for iOS home bar
    paddingTop: 10,
    backgroundColor: SKYLA_NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secureNote: {
    color: '#667',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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