import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AccountScreen() {
  const stats = [
    { id: 1, title: 'Posts', count: 24 },
    { id: 2, title: 'Questions', count: 12 },
    { id: 3, title: 'Schools', count: 5 },
    { id: 4, title: 'Challenges Completed', count: 7 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.cardsContainer}>
        {stats.map(stat => (
          <View key={stat.id} style={styles.card}>
            <Text style={styles.cardCount}>{stat.count}</Text>
            <Text style={styles.cardTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.accountInfo}>
        <Text style={styles.infoTitle}>Account Info</Text>
        <Text style={styles.info}>Username: JohnDoe</Text>
        <Text style={styles.info}>Email: johndoe@example.com</Text>
        <Text style={styles.info}>Member since: 2026</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  cardsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#0dddf0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  cardCount: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  cardTitle: { fontSize: 16, color: 'white' },
  accountInfo: {
    marginTop: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  info: { fontSize: 16, marginBottom: 10 },
});
