import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { scrollYValue } from '../../constants/Animation';
import Header from '../components/Header';

const SKYLA_NAVY_MID = 'rgb(28, 49, 80, 0.8)';
export default function Layout() {

useEffect(() => {
  if (Platform.OS === 'android') {
    NavigationBar.setButtonStyleAsync('light');
  }
}, []);

  // Animation for hiding tab bar on scroll
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
            backgroundColor: SKYLA_NAVY_MID,
            borderTopColor: '#0DDDF0',
            borderTopWidth: 0.5,
            height: Platform.OS === 'ios' ? 90 : 94,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12, // Better spacing
            position: 'absolute',
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

      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: SKYLA_NAVY_MID,   // Important: This helps with safe areas
  },
});