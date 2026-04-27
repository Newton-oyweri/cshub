import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PostCard from '../components/PostCard'; // Adjust path
import { scrollYValue } from '../../constants/Animation';
import { supabase } from '../../lib/supabase';

const SKYLA_CYAN = '#0DDDF0';
const SKYLA_ORANGE = '#FE9A0F';
const SKYLA_DARK = '#0F1C38';

export default function HomeScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [gitStats, setGitStats] = useState<Record<string, any>>({});

  const { data: posts = [], refetch, isRefetching, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`*, author:profiles!posts_profiles_fkey (*), comments_count:comments(count)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      data?.forEach(post => {
        if (post.github_url) fetchLiveGithubStats(post.id, post.github_url);
      });
      return data;
    },
  });

  const fetchLiveGithubStats = async (postId: string, githubUrl: string) => {
    try {
      const repoPath = githubUrl.replace('https://github.com/', '').split('/').slice(0, 2).join('/');
      const res = await fetch(`https://api.github.com/repos/${repoPath}`);
      const json = await res.json();
      setGitStats(prev => ({
        ...prev,
        [postId]: { stars: json.stargazers_count || 0, forks: json.forks_count || 0, watchers: json.subscribers_count || 0 }
      }));
    } catch (e) { console.log("Stats error", e); }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true, listener: (e: any) => scrollYValue.setValue(e.nativeEvent.contentOffset.y) }
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={SKYLA_CYAN} />}
      >
        {posts.length === 0 && !isLoading && <Text style={styles.empty}>No projects yet.</Text>}
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} gitStats={gitStats} onRefreshStats={fetchLiveGithubStats} />
        ))}
      </Animated.ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('./components/createpost')}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SKYLA_DARK },
  scrollContent: { paddingBottom: 120, paddingHorizontal: 10, paddingTop: 10 },
  empty: { color: '#666', textAlign: 'center', marginTop: 150 },
  fab: { position: 'absolute', bottom: 30, right: 25, width: 64, height: 64, borderRadius: 32, backgroundColor: SKYLA_ORANGE, justifyContent: 'center', alignItems: 'center', elevation: 8 }
});