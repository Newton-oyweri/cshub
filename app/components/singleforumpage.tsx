import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function SingleForumPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock discussions data - in a real app, fetch this using params.id
  const MOCK_DISCUSSIONS = [
    { id: 1, user: 'DevGuy', text: 'Great point! I especially agree with the part about project structure.', time: '1H AGO' },
    { id: 2, user: 'CodeQueen', text: 'Does this apply to small projects as well?', time: '45M AGO' },
      { id: 3, user: 'Skyla', text: 'doing great share code please', time: 'Just now' },
    
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.gradient}>
        
        {/* Header / Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0DDDF0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thread Details</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Card Content */}
          <View style={styles.mainCard}>
            <View style={styles.metaRow}>
              <Text style={styles.categoryText}>{params.category}</Text>
              <Text style={styles.timeText}>{params.time}</Text>
            </View>
            
            <Text style={styles.titleText}>{params.title}</Text>
            
            <View style={styles.authorRow}>
              <Image source={require('../../assets/images/icon.png')} style={styles.avatar} />
              <Text style={styles.authorName}>By {params.author}</Text>
            </View>

            <Text style={styles.contentText}>{params.content}</Text>
          </View>

          {/* Discussion Section */}
          <View style={styles.discussionHeader}>
            <MaterialCommunityIcons name="chat-processing-outline" size={20} color="#FFA500" />
            <Text style={styles.discussionTitle}>DISCUSSIONS ({params.discussions})</Text>
          </View>

          {MOCK_DISCUSSIONS.map((chat) => (
            <View key={chat.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUser}>{chat.user}</Text>
                <Text style={styles.commentTime}>{chat.time}</Text>
              </View>
              <Text style={styles.commentText}>{chat.text}</Text>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20 },
  mainCard: {
    backgroundColor: 'rgba(34, 34, 46, 0.6)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(13, 221, 240, 0.3)',
    marginBottom: 30,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  categoryText: { color: '#0DDDF0', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  timeText: { color: '#888', fontSize: 12 },
  titleText: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 15 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  authorName: { color: '#AAA', fontSize: 14 },
  contentText: { color: '#DDD', fontSize: 16, lineHeight: 26 },
  discussionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  discussionTitle: { color: '#FFA500', fontWeight: 'bold', marginLeft: 10, fontSize: 14 },
  commentCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  commentUser: { color: '#0DDDF0', fontWeight: '600' },
  commentTime: { color: '#666', fontSize: 10 },
  commentText: { color: '#BBB', fontSize: 14 },
});