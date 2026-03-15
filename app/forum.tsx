import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const threads = [
  { id: 1, title: 'React vs React Native', replies: 12 },
  { id: 2, title: 'Best JavaScript Practices', replies: 8 },
  { id: 3, title: 'How to structure a CS project', replies: 15 },
  { id: 4, title: 'TypeScript or JS?', replies: 5 },
];

export default function ForumScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 10 }}>
      {threads.map(thread => (
        <View key={thread.id} style={styles.threadCard}>
          <Text style={styles.threadTitle}>{thread.title}</Text>
          <Text style={styles.replies}>{thread.replies} replies</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  threadCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  threadTitle: { fontSize: 16, fontWeight: 'bold' },
  replies: { fontSize: 12, color: '#777', marginTop: 5 },
});
