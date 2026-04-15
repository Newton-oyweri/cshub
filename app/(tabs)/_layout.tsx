import { Tabs } from 'expo-router';
import { StyleSheet, View, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { scrollYValue } from '../constants/Animation';


const SKYLA_DARK = '#0F1C38';

export default function Layout() {
  // Animation logic for hiding/showing the tab bar
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
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#8E8E93',
    tabBarStyle: {
      // 1. Set the background of the WHOLE bar to your line color
      backgroundColor: SKYLA_DARK,

      // 2. Add a top border to create the line effect
      borderTopColor: '#0DDDF0', // Line color
      borderTopWidth: 0.5,
      position: 'absolute',
      height: Platform.OS === 'ios' ? 90 : 85,
      
      // Animation properties
      transform: [{ translateY: tabBarTranslateY }],
      opacity: tabBarOpacity,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
    },
  }}
>
  <Tabs.Screen
    name="index"
    options={{
      title: 'Projects',
      tabBarIcon: ({ color, focused }) => (
        <Ionicons name={focused ? 'folder' : 'folder-outline'} color={color} size={24} />
      ),
    }}
  />
  <Tabs.Screen
    name="forum"
    options={{
      title: 'Forum',
      tabBarIcon: ({ color, focused }) => (
        <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} size={24} />
      ),
    }}
  />
  
  {/* Hidden Screens */}
  <Tabs.Screen name="forumpages/Account" options={{ href: null }} />
  <Tabs.Screen name="components/singleforumpage" options={{ href: null }} />
  <Tabs.Screen name="homepages/courses" options={{ href: null }} />
  <Tabs.Screen name="homepages/events" options={{ href: null }} />
  <Tabs.Screen name="homepages/mentorship" options={{ href: null }} />
  <Tabs.Screen name="homepages/opportunities" options={{ href: null }} />
  <Tabs.Screen name="homepages/tutorials" options={{ href: null }} />
</Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
});