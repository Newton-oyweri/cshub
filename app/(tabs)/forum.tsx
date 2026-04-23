import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useEffect, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  RefreshControl,
} from 'react-native';
import { scrollYValue } from '../../constants/Animation';
import { supabase } from '../../lib/supabase';

// Updated type to handle the count object from Supabase
type Post = {
  id: string;
  title: string;
  description: string;
  category: string[];
  created_at: string;
  profiles: {
    name: string | null;
    profilepic_url: string | null;
  } | null;
  forumdiscussions: { count: number }[]; // Raw count from join
  display_count?: number; // Formatted number for UI
};

const categoryColors: Record<string, readonly [string, string]> = {
  React: ['#61DAFB', '#0B1F2A'],
  'Next.js': ['#000000', '#333333'],
  TypeScript: ['#3178C6', '#0B1F2A'],
  Python: ['#3776AB', '#1C3150'],
  'React Native': ['#00D8FF', '#15202B'],
  'General': ['#FFA500', '#2A1F0B'],
};

export default function ForumScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch real data with joined discussion counts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forumposts')
        .select(`
          *,
          profiles (
            name,
            profilepic_url
          ),
          forumdiscussions(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data so 'discussions' is a direct number
      const formattedData = (data || []).map((post: Post) => ({
        ...post,
        display_count: post.forumdiscussions?.[0]?.count || 0
      }));

      setPosts(formattedData);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollYValue } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollYValue.setValue(event.nativeEvent.contentOffset.y);
      },
    }
  );

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: false }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: false }).start();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.gradient}>
        <Animated.ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchPosts} tintColor="#FFA500" />
          }
        >
          {posts.length === 0 && !loading ? (
            <View style={styles.emptyContainer}>
               <MaterialCommunityIcons name="comment-question-outline" size={80} color="#333" />
               <Text style={styles.emptyText}>No discussions found. Be the first to ask!</Text>
            </View>
          ) : (
            posts.map((post) => {
              const mainCategory = post.category?.[0] || 'General';
              const displayName = post.profiles?.name || 'Anonymous';
              const avatar = post.profiles?.profilepic_url;

              return (
                <Animated.View
                  key={post.id}
                  style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() =>
                      router.push({
                        pathname: '/components/singleforumpage',
                        params: {
                          id: post.id,
                          title: post.title,
                          author: displayName,
                          content: post.description,
                          category: mainCategory,
                          time: new Date(post.created_at).toLocaleDateString(),
                          discussions: String(post.display_count || 0),
                        },
                      })
                    }
                  >
                    <LinearGradient colors={['#22222E', '#1A1A2E']} style={styles.card}>
                      <View style={styles.header}>
                        <View style={styles.authorGroup}>
                          {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                          ) : (
                            <View style={styles.avatarFallback}>
                              <MaterialCommunityIcons name="account" size={16} color="#0DDDF0" />
                            </View>
                          )}
                          <Text style={styles.author}>{displayName}</Text>
                        </View>

                        <LinearGradient
                          colors={categoryColors[mainCategory] || ['#FFA500', '#FF6B6B']}
                          style={styles.badge}
                        >
                          <Text style={styles.badgeText}>{mainCategory}</Text>
                        </LinearGradient>
                      </View>

                      <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
                      <Text style={styles.contentText} numberOfLines={2}>{post.description}</Text>

                      <View style={styles.footer}>
                        <View style={styles.discussion}>
                          <MaterialCommunityIcons name="chat-outline" size={14} color="#FFA500" />
                          <Text style={styles.discussionText}>{post.display_count || 0}</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#FFA500" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          )}
        </Animated.ScrollView>
      </LinearGradient>

      {/* Floating Ask Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('../forumpages/postforum')}
      >
        <LinearGradient colors={['#FFA500', '#FF6B00']} style={styles.fabButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>ASK</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 120 },
  emptyContainer: { marginTop: 100, alignItems: 'center', opacity: 0.5 },
  emptyText: { color: '#AAA', textAlign: 'center', marginTop: 20, fontSize: 16 },
  cardWrapper: { marginBottom: 16 },
  card: { 
    borderRadius: 20, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  authorGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#444' },
  avatarFallback: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    backgroundColor: 'rgba(13, 221, 240, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(13, 221, 240, 0.3)'
  },
  author: { color: '#BBB', fontWeight: '600', fontSize: 13 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  contentText: { color: '#999', fontSize: 14, lineHeight: 20, marginBottom: 15 },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12
  },
  discussion: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 165, 0, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discussionText: { color: '#FFA500', marginLeft: 5, fontSize: 12, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 30, right: 25, zIndex: 20 },
  fabButton: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8, 
    shadowColor: '#f3f5ff', 
    shadowOpacity: 0.4, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 5 } 
  },
});