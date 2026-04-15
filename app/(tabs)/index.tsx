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
  Alert,
  Dimensions
} from 'react-native';
import { scrollYValue } from '../constants/Animation';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const logo = require('../../assets/images/logo.png');

const SKYLA_ORANGE = '#FE9A0F';
const SKYLA_CYAN = '#0DDDF0';
const SKYLA_NAVY_MID = '#1C3150';
const SKYLA_DARK = '#0F1C38';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [gitStats, setGitStats] = useState<Record<string, any>>({});
  const scrollY = useRef(new Animated.Value(0)).current;
  const [imageHeights, setImageHeights] = useState<Record<string, number>>({});

  const fetchPosts = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_profiles_fkey (
            name,
            profilepic_url,
            institution,
            github_url,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);

      // Trigger live stat fetch for each repo
      data?.forEach(post => {
        if (post.github_url) fetchLiveGithubStats(post.id, post.github_url);
      });
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchLiveGithubStats = async (postId: string, githubUrl: string) => {
    try {
      const repoPath = githubUrl.replace('https://github.com/', '').split('/').slice(0, 2).join('/');
      const res = await fetch(`https://api.github.com/repos/${repoPath}`);
      const json = await res.json();
      
      setGitStats(prev => ({
        ...prev,
        [postId]: {
          stars: json.stargazers_count || 0,
          forks: json.forks_count || 0,
          watchers: json.subscribers_count || 0
        }
      }));
    } catch (e) {
      console.log("Stats fetch error", e);
    }
  };

  const handleGithubAction = async (post: any, action: 'star' | 'fork') => {
    // Pull session just like your account/profile views do
    const { data: { session } } = await supabase.auth.getSession();
    
    // In Supabase OAuth, the github token is often in provider_token
    const token = session?.provider_token; 

    if (!token) {
      Alert.alert("GitHub Login Required", "Please sign in with GitHub again to authorize Star/Fork actions.");
      return;
    }

    const repoPath = post.github_url.replace('https://github.com/', '').split('/').slice(0, 2).join('/');
    const url = action === 'star' 
      ? `https://api.github.com/user/starred/${repoPath}` 
      : `https://api.github.com/repos/${repoPath}/forks`;

    try {
      const res = await fetch(url, {
        method: action === 'star' ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      // status 204 = Star success | 201/202 = Fork success
      if (res.status === 204 || res.status === 201 || res.status === 202) {
        Alert.alert("Success!", `You ${action === 'star' ? 'starred' : 'forked'} ${post.title} on GitHub.`);
        fetchLiveGithubStats(post.id, post.github_url); 
      } else {
        const errJson = await res.json();
        Alert.alert("GitHub says:", errJson.message || "Action failed");
      }
    } catch (e) {
      Alert.alert("Error", "Check your connection or GitHub permissions.");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (e: any) => scrollYValue.setValue(e.nativeEvent.contentOffset.y),
    }
  );

  const handleImageLoad = (postId: string, event: any) => {
    const { width: imgWidth, height: imgHeight } = event.nativeEvent.source;
    const calculatedHeight = (SCREEN_WIDTH - 20) * (imgHeight / imgWidth);
    setImageHeights(prev => ({
      ...prev,
      [postId]: calculatedHeight
    }));
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPosts} tintColor={SKYLA_CYAN} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {posts.length === 0 && !refreshing && (
          <Text style={styles.empty}>No projects yet. Be the first to share!</Text>
        )}

        {posts.map((post: any) => {
          const profile = post.author;
          const displayName = profile?.name || "Skyla User";
          const displayAvatar = profile?.profilepic_url;
          const githubUsername = profile?.github_url?.split('/').pop() || "";
          
          const stats = gitStats[post.id] || { stars: '...', forks: '...', watchers: '...' };
          const hasImage = post.image_url && post.image_url.trim() !== '';

          return (
            <View key={post.id} style={styles.card}>
              {/* Header */}
              <TouchableOpacity 
                style={styles.header}
                onPress={() => router.push({
                  pathname: '../homepages/profileview',
                  params: { 
                    postId: post.id,
                    name: displayName, 
                    avatar: displayAvatar, 
                    username: githubUsername,
                    email: profile?.email
                  }
                })}
              >
                <Image 
                  source={displayAvatar ? { uri: displayAvatar } : logo} 
                  style={styles.avatar} 
                />
                <View style={styles.headerInfo}>
                  <Text style={styles.name}>{displayName}</Text>
                  <Text style={styles.institution}>{profile?.institution}</Text>
                </View>
                {post.language && (
                  <View style={styles.languageBadge}>
                    <Text style={styles.languageText}>{post.language}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Project Image - Enhanced display */}
              {hasImage && (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: post.image_url }} 
                    style={[
                      styles.image,
                      imageHeights[post.id] ? { height: imageHeights[post.id] } : undefined
                    ]}
                    resizeMode="contain"
                    onLoad={(event) => handleImageLoad(post.id, event)}
                  />
                </View>
              )}

              {/* Info */}
              <View style={[styles.postInfo, !hasImage && styles.postInfoNoImage]}>
                <Text style={styles.repoName}>{post.title}</Text>
                <Text style={styles.description} numberOfLines={3}>{post.description}</Text>
              </View>

              {/* Stats Row with Watchers */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons name="star" size={18} color={SKYLA_ORANGE} />
                  <Text style={styles.statText}>{stats.stars}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="git-branch" size={18} color={SKYLA_CYAN} />
                  <Text style={styles.statText}>{stats.forks}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="eye" size={18} color="#94a3b8" />
                  <Text style={styles.statText}>{stats.watchers}</Text>
                </View>
                <Text style={styles.lastUpdated}>{new Date(post.created_at).toLocaleDateString()}</Text>
              </View>

              {/* Actions Section */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push({ pathname: '../homepages/postview', params: { postId: post.id,
                    name: displayName, 
                    avatar: displayAvatar, 
                    username: githubUsername,
                    email: profile?.email
            
                   } })}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color="#ddd" />
                  <Text style={styles.actionText}  >Comment</Text>
                </TouchableOpacity>   

                {post.site_url && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push({ pathname: '../homepages/siteview', params: { url: post.site_url } })}
                  >
                    <Ionicons name="globe-outline" size={20} color="#fff" />
                    <Text style={styles.actionText}>Site</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push({ pathname: '../homepages/webview', params: { url: post.github_url } })}
                >
                  <Ionicons name="logo-github" size={20} color="#ddd" />
                  <Text style={styles.actionText}>Repo</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('./components/createpost')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SKYLA_DARK },
  scrollContent: { paddingBottom: 120, paddingHorizontal: 10, paddingTop: 10 },
  card: { 
    backgroundColor: SKYLA_NAVY_MID, 
    borderRadius: 18, 
    marginBottom: 16, 
    overflow: 'hidden', 
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(0,0,0,0.2)' },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12, borderWidth: 2, borderColor: SKYLA_CYAN },
  headerInfo: { flex: 1 },
  name: { color: '#fff', fontSize: 16, fontWeight: '700' },
  institution: { color: '#aaa', fontSize: 13 },
  languageBadge: { backgroundColor: SKYLA_ORANGE + '25', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 12 },
  languageText: { color: SKYLA_ORANGE, fontSize: 12, fontWeight: '700' },
  imageContainer: {
    backgroundColor: '#0a1525',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { 
    width: '100%', 
    minHeight: 200,
    backgroundColor: '#0a1525',
  },
  postInfo: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },
  postInfoNoImage: { paddingTop: 16 },
  repoName: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  description: { color: '#ddd', fontSize: 15, lineHeight: 22 },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 18 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { color: '#ccc', fontSize: 15, fontWeight: '600' },
  lastUpdated: { color: '#888', fontSize: 13, marginLeft: 'auto' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', padding: 10 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 6 },
  actionText: { color: '#ddd', fontWeight: '600' },
  empty: { color: '#666', textAlign: 'center', marginTop: 150 },
  fab: { position: 'absolute', bottom: 30, right: 25, width: 64, height: 64, borderRadius: 32, backgroundColor: SKYLA_ORANGE, justifyContent: 'center', alignItems: 'center', elevation: 8 }
});