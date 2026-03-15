import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';

const posts = [
  {
    id: 1,
    user: 'Alice',
    title: 'React Native Tips',
    description: 'Learn how to structure your Expo app effectively.',
  },
  {
    id: 2,
    user: 'Bob',
    title: 'JavaScript Tricks',
    description: '5 tricks you didn’t know about JS arrays.',
  },
  {
    id: 3,
    user: 'Charlie',
    title: 'CSHub Launch',
    description: 'Our app is live! Start exploring tutorials and projects.',
  },
  {
    id: 4,
    user: 'Denise',
    title: 'TypeScript Basics',
    description: 'How to type your React Native components safely.',
  },
   {
    id: 5,
    user: 'Denise',
    title: 'TypeScript Basics',
    description: 'How to type your React Native components safely.',
  },
   {
    id: 6,
    user: 'Denise',
    title: 'TypeScript Basics',
    description: 'How to type your React Native components safely.',
  },
   {
    id: 7,
    user: 'Denise',
    title: 'TypeScript Basics',
    description: 'How to type your React Native components safely.',
  },
   {
    id: 8,
    user: 'Denise',
    title: 'TypeScript Basics',
    description: 'How to type your React Native components safely.',
  },
   {
    id: 9,
    user: 'Denise',
    title: 'TypeScript Basics',
    description: 'How to type your React Native components safely.',
  },
   {
    id: 10,
    user: 'Denise',
    title: 'TypeScript Basics',
    description: 'How to type your React Native components safely.',
  },
   {
    id: 11,
    user: 'Denise',
    title: 'TypeScript Basics',
    description: 'How to type your React Native components safely.',
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 10 }}>
      {posts.map(post => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.userRow}>
            <View style={styles.avatar} />
            <Text style={styles.userName}>{post.user}</Text>
          </View>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postDesc}>{post.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,backgroundColor: '#ffffff' },
  postCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // android shadow
  },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
    backgroundColor: '#0dddf0',
    marginRight: 10,
  },
  userName: { fontWeight: 'bold', fontSize: 16 },
  postTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  postDesc: { fontSize: 14, color: '#555' },
});
