import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Courses() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the Courses page</Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 20, fontWeight: 'bold' },
  backBtn: { marginTop: 20, padding: 10, backgroundColor: '#0dddf0', borderRadius: 8 },
  backText: { color: '#fff', fontWeight: 'bold' },
});