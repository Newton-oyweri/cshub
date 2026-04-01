import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
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
          tabBarStyle: {
            backgroundColor: '#1C3150',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Projects',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="folder-outline" color={color} size={size} />
            ),
          }}
        />
        {/* forumpages hidden */}
        <Tabs.Screen
          name="forumpages/Account"
          options={{
            href: null,
          }}
        />


        {/* end of forum pages  */}
        {/* "homepages" folder */}
        <Tabs.Screen
          name="homepages/courses"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="homepages/events"
          options={{
            href: null,
          }}
        />  
        <Tabs.Screen
          name="homepages/mentorship"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="homepages/opportunities"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="homepages/tutorials"
          options={{  
            href: null,
          }}
        />  


        {/* end of hidden pages */}

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
          name="codespace"
          options={{
            title: 'Collabs',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="laptop-outline" color={color} size={size} />
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
    backgroundColor:'#1C3150',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});