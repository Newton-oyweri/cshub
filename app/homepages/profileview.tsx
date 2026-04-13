import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Profilerepoview from '../forumpages/profilereposview';
import UserComments from '../forumpages/UserComments.js';

export default function UserDetails() {
  const { name, email, avatar, username } = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} />

        {/* Profile Info */}
        <View style={styles.profileHeader}>
          
          {/* Avatar LEFT */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatar as string }} style={styles.avatar} />
            <View style={styles.onlineBadge} />
          </View>

          {/* Name + Email RIGHT */}
          <View style={styles.info}>
            <Text style={styles.name}>{name || 'Developer'}</Text>
            <Text style={styles.email}>{email || 'Private Email'}</Text>
          </View>

        </View>

        {/* Repositories */}
        {username && (
          <Profilerepoview
            session={{ user: { user_metadata: { preferred_username: username } } }}
          />
        )}

        <UserComments />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { paddingHorizontal: 25, paddingBottom: 40 },

  backBtn: { marginTop: 30, width: 40, padding: 5 },

  // CHANGED: row layout
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#38bdf8',
  },

  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#0f172a',
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },

  email: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
});