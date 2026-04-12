import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.container}>
      <Header />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF', // changed (clean white)
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            transform: [{ translateY: tabBarTranslateY }],
            opacity: tabBarOpacity,
            borderTopWidth: 0.5,
            borderTopColor: '#E6EAF0', // soft white border
          },
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    
    height: 60,
    backgroundColor: '#FFFFFF', // changed from dark → white
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  headerText: {
    color: '#1C3150', // keep brand dark blue (better contrast on white)
    fontSize: 20,
    fontWeight: 'bold',
  },
});