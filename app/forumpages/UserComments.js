import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock Data for your Import
const MOCK_COMMENTS = [
  {
    id: '1',
    user: 'Sarah Drasner',
    handle: 'sdras',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    comment: 'The repository structure is incredibly clean. Love how you handled the state management here! 🚀',
    time: '2h',
    likes: 24,
  },
  {
    id: '2',
    user: 'Guillermo Rauch',
    handle: 'rauchg',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guillermo',
    comment: 'The performance on the animated transitions is buttery smooth. Is this using Reanimated?',
    time: '5h',
    likes: 12,
  },
];

export default function UserComments() {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#007AFF" />
        <Text style={styles.sectionTitle}>Recent Activity</Text>
      </View>

      {MOCK_COMMENTS.map((item) => (
        <View key={item.id} style={styles.commentCard}>
          {/* Left: Avatar & Thread Line */}
          <View style={styles.leftColumn}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.threadLine} />
          </View>

          {/* Right: Content */}
          <View style={styles.rightColumn}>
            <View style={styles.commentHeader}>
              <View>
                <Text style={styles.userName}>{item.user}</Text>
                <Text style={styles.userHandle}>@{item.handle} • {item.time}</Text>
              </View>
            </View>

            <Text style={styles.commentText}>{item.comment}</Text>

            {/* Interactions */}
            <View style={styles.interactions}>
              <TouchableOpacity style={styles.statBtn}>
                <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                <Text style={styles.statText}>{item.likes}</Text>
              </TouchableOpacity>
            
            </View>
          </View>
        </View>
      ))}

      {/* View All Button */}
      <TouchableOpacity style={styles.viewAllBtn}>
        <Text style={styles.viewAllText}>View all 12 comments</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  commentCard: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  threadLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#1A1A1A', // The vertical line connecting comments
    marginTop: 4,
    marginBottom: 4,
  },
  rightColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  userName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  userHandle: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  commentText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  interactions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 20,
  },
  statBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllBtn: {
    backgroundColor: '#111',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  viewAllText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
});