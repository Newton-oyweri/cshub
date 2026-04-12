import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View, StatusBar, SafeAreaView } from 'react-native';
import { Animated } from 'react-native';

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>cshub</Text>
    </View>
  );
}

export const scrollYValue = new Animated.Value(0);

export default function Layout() {
  const tabBarOpacity = scrollYValue.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const tabBarTranslateY = scrollYValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Force Dark Status Bar Content (Important for White Header) */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF" 
        translucent={false}
      />

      <Header />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            transform: [{ translateY: tabBarTranslateY }],
            opacity: tabBarOpacity,
            borderTopWidth: 0.5,
            borderTopColor: '#E6EAF0',
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#0DDDF0',   // Skyla Cyan
          tabBarInactiveTintColor: '#666',
        }}
      >
        {/* HIDDEN SCREENS */}
        <Tabs.Screen name="forumpages/Account" options={{ href: null }} />
        <Tabs.Screen name="components/singleforumpage" options={{ href: null }} />
        <Tabs.Screen name="homepages/courses" options={{ href: null }} />
        <Tabs.Screen name="homepages/events" options={{ href: null }} />
        <Tabs.Screen name="homepages/mentorship" options={{ href: null }} />
        <Tabs.Screen name="homepages/opportunities" options={{ href: null }} />
        <Tabs.Screen name="homepages/tutorials" options={{ href: null }} />

        {/* VISIBLE TABS */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Projects',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="folder-outline" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="forum"
          options={{
            title: 'Forum',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles-outline" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },

  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',        // Changed to center for better look
    borderBottomWidth: 1,
    borderBottomColor: '#E6EAF0',
    // shadow for premium feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },

  headerText: {
    color: '#1C3150',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});