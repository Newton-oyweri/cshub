import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef } from 'react';
import {
  Image,
  RefreshControl,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { scrollYValue } from './_layout';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase'; // Import your supabase client

const logo = require('../../assets/images/logo.png');
const { width } = Dimensions.get('window');

const WORKER_URL = 'https://posts-api.unscriptedusa.workers.dev';

const SKYLA_ORANGE = '#FE9A0F';
const SKYLA_CYAN = '#0DDDF0';
const SKYLA_NAVY_MID = '#1C3150';
const SKYLA_DARK = '#0F1C38';

export default function HomeScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null); // State for the logged-in user

  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchPosts = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(WORKER_URL);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (e: any) => scrollYValue.setValue(e.nativeEvent.contentOffset.y),
    }
  );

  useEffect(() => {
    fetchPosts();

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes (so the UI updates immediately after login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPosts} tintColor={SKYLA_CYAN} />
        }
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {posts.length === 0 && !refreshing && (
          <Text style={styles.empty}>No projects yet. Be the first to share!</Text>
        )}

        {posts.map((post: any) => {
          // Determine the user details to show on the card
          // If the post belongs to the current user, show their real info
          const displayName = user?.user_metadata?.full_name || "Skyla User";
          const displayAvatar = user?.user_metadata?.avatar_url ? { uri: user.user_metadata.avatar_url } : logo;

          return (
            <View key={post.id} style={styles.card}>
              <View style={styles.header}>
                <Image source={displayAvatar} style={styles.avatar} />

                <View style={styles.headerInfo}>
                  <Text style={styles.name}>{displayName}</Text>
                  <Text style={styles.institution}>University Student</Text>
                </View>

                {post.language && (
                  <View style={styles.languageBadge}>
                    <Text style={styles.languageText}>{post.language}</Text>
                  </View>
                )}
              </View>

              <Image 
                source={{ uri: post.source || post.image }} 
                style={styles.image} 
                resizeMode="cover"
              />

              <View style={styles.postInfo}>
                <Text style={styles.repoName}>{post.title || post.name}</Text>
                <Text style={styles.description} numberOfLines={3}>
                  {post.description || "No description provided."}
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons name="star" size={18} color={SKYLA_ORANGE} />
                  <Text style={styles.statText}>{post.stars?.toLocaleString() || 0}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="git-branch" size={18} color={SKYLA_CYAN} />
                  <Text style={styles.statText}>{post.forks?.toLocaleString() || 0}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="eye" size={18} color="#ddd" />
                  <Text style={styles.statText}>{post.watchers?.toLocaleString() || 0}</Text>
                </View>
                {post.lastCommit && (
                  <Text style={styles.lastUpdated}>Updated {post.lastCommit}</Text>
                )}
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="star-outline" size={22} color={SKYLA_ORANGE} />
                  <Text style={styles.actionText}>Star</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="git-branch-outline" size={22} color={SKYLA_CYAN} />
                  <Text style={styles.actionText}>Fork</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.viewButton]} 
                  onPress={() => {
                    const finalUrl = post.githubUrl || "https://github.com";
                    router.push({
                      pathname: '../homepages/webview',
                      params: { url: finalUrl }
                    });
                  }}
                >
                  <Ionicons name="open-outline" size={22} color="#000" />
                  <Text style={styles.viewButtonText}>View Project</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... Styles stay exactly the same as your provided code ...
  container: { flex: 1, backgroundColor: SKYLA_DARK },
  scrollContent: { paddingBottom: 100, paddingHorizontal: 10 },
  card: { backgroundColor: SKYLA_NAVY_MID, borderRadius: 18, marginBottom: 16, overflow: 'hidden', elevation: 6 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(0,0,0,0.25)' },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12, borderWidth: 2, borderColor: SKYLA_CYAN },
  headerInfo: { flex: 1 },
  name: { color: '#fff', fontSize: 16, fontWeight: '700' },
  institution: { color: '#aaa', fontSize: 13 },
  languageBadge: { backgroundColor: SKYLA_ORANGE + '25', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 12 },
  languageText: { color: SKYLA_ORANGE, fontSize: 12, fontWeight: '700' },
  image: { width: '100%', height: 230 },
  postInfo: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },
  repoName: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  description: { color: '#ddd', fontSize: 15, lineHeight: 22 },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 18 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { color: '#ccc', fontSize: 15, fontWeight: '600' },
  lastUpdated: { color: '#888', fontSize: 13, marginLeft: 'auto' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', padding: 10 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 6 },
  actionText: { color: '#ddd', fontWeight: '600' },
  viewButton: { backgroundColor: SKYLA_CYAN, borderRadius: 12, marginHorizontal: 6 },
  viewButtonText: { color: '#000', fontWeight: '700' },
  empty: { color: '#666', textAlign: 'center', marginTop: 120, fontSize: 16 },
});