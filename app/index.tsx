import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const WORKER_URL = 'https://posts-api.unscriptedusa.workers.dev';
const { width } = Dimensions.get('window');

// 🎨 SKYLA BRAND PALETTE
const SKYLA_ORANGE = '#FE9A0F';
const SKYLA_CYAN = '#0DDDF0';
const SKYLA_NAVY_MID = '#1C3150'; 

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(WORKER_URL);
      if (!res.ok) throw new Error('Worker Error');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Fetch failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePost = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: false,
      quality: 0.5,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setLoading(true);
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName || `resource_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      const response = await fetch(WORKER_URL, { method: 'POST', body: formData });
      if (response.ok) fetchPosts();
    } catch (error) {
      Alert.alert('Error', 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteResource = (key: string) => {
    Alert.alert('Remove Content', 'This will delete this resource from the hub.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await fetch(`${WORKER_URL}?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
            fetchPosts();
          } catch (err) { console.log(err); }
      }},
    ]);
  };

  useEffect(() => { fetchPosts(); }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPosts} tintColor={SKYLA_CYAN} />}
      >
        {posts.length === 0 && !refreshing && (
           <Text style={styles.empty}>No learning resources available.</Text>
        )}

        {posts.map((post: any) => (
          <View key={post.id} style={styles.card}>
            {/* Header: Student Identity */}
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <Image source={{ uri: post.source }} style={styles.avatar} />
                <View>
                  <Text style={styles.userName}>Isack Skyla</Text>
                  <Text style={styles.userSub}>CS Student • Kibabii University</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteResource(post.id)}>
                <Ionicons name="trash-outline" size={18} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Content Image */}
            <Image source={{ uri: post.source }} style={styles.image} />

            {/* Learning Info & Actions */}
            <View style={styles.postInfo}>
              <Text style={styles.description}>
                <Text style={styles.descTitle}>{post.title}</Text>
                {" — "}Resource contribution for the CS curriculum. Review the logic and documentation attached.
              </Text>

              <View style={styles.actionRow}>
                {/* github start like */}
                <TouchableOpacity style={styles.actionBtn}>
                   <Ionicons name="star-outline" size={20} color={SKYLA_CYAN} />
                   <Text style={styles.actionText}>Star </Text>
                </TouchableOpacity>
                {/* github end like */}
                <TouchableOpacity style={styles.actionBtn}>
                   <Ionicons name="eye-outline" size={20} color={SKYLA_CYAN} />
                   <Text style={styles.actionText}>Watch</Text>
                </TouchableOpacity>
                {/* github link */}
                <TouchableOpacity style={styles.actionBtn}>
                   <Ionicons name="link-outline" size={20} color={SKYLA_CYAN} />
                   <Text style={styles.actionText}>Repo</Text>
                </TouchableOpacity>
                  {/* site link  */}
                <TouchableOpacity style={styles.actionBtn}>
                   <Ionicons name="globe-outline" size={20} color={SKYLA_CYAN} />
                   <Text style={styles.actionText}>Site</Text>
                </TouchableOpacity>
                {/* comments */}
                <TouchableOpacity style={styles.actionBtn}>
                   <Ionicons name="chatbubble-ellipses-outline" size={20} color={SKYLA_CYAN} />
                   <Text style={styles.actionText}>Comment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Upload FAB */}
      <TouchableOpacity style={styles.fab} onPress={handlePost} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="cloud-upload" size={26} color="#fff" />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  card: { 
    backgroundColor: SKYLA_NAVY_MID, 
    marginBottom: 1, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222'
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 15, 
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#000', marginRight: 12 },
  userName: { color: '#fff', fontWeight: '700', fontSize: 14 },
  userSub: { color: '#888', fontSize: 11, marginTop: 2 },
  image: { width: '100%', height: 280, backgroundColor: '#050505' },
  postInfo: { padding: 16 },
  description: { color: '#ddd', fontSize: 13, lineHeight: 20, marginBottom: 18 },
  descTitle: { fontWeight: 'bold', color: SKYLA_ORANGE }, // Using Orange for titles to stand out
  actionRow: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.08)', 
    paddingTop: 15 
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 30 },
  actionText: { color: '#fff', marginLeft: 8, fontSize: 13, fontWeight: '600' },
  empty: { color: '#444', textAlign: 'center', marginTop: 100 },
  fab: {
    position: 'absolute', bottom: 30, right: 25, backgroundColor: SKYLA_CYAN,
    width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    shadowColor: SKYLA_CYAN, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10
  }
});