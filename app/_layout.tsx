import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>cshub</Text>
    </View>
  );
}

export default function Layout() {
  return (
    <View style={styles.container}>
    <Header />

      {/* Tabs act as the body + bottom navigation */}
      <Tabs 
       screenOptions={{
    headerShown: false,
   
  }}
      >
       <Tabs.Screen
  name="index"
  options={{
    title: 'Home',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="home-outline" color={color} size={size} />
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
<Tabs.Screen
  name="account"
  options={{
    title: 'Account',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="person-outline" color={color} size={size} />
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
    backgroundColor: '#0dddf0',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});
