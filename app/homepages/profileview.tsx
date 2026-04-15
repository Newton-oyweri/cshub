import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform, 
  StatusBar 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import Profilerepoview from '../forumpages/profilereposview';

const SKYLA_CYAN = '#0DDDF0';
const SKYLA_DARK = '#0F1C38';
const SKYLA_NAVY = '#1C3150';

export default function UserDetails() {
  const { name, email, avatar, username } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  
  // State for GitHub Profile Details
  const [githubDetails, setGithubDetails] = useState<any>(null);

  useEffect(() => {
    if (email) fetchUserPosts();
    if (username) fetchGithubProfile();
  }, [email, username]);

  const fetchGithubProfile = async () => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      const data = await response.json();
      setGithubDetails(data);
    } catch (error) {
      console.error("Error fetching GitHub details:", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileData) {
        const { data: posts, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUserPosts(posts || []);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <TouchableOpacity 
        style={[styles.backBtn, { top: insets.top + 10 }]} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 60 }]}
      >
        {/* Profile Info Container */}
        <View style={styles.profileHeader}>
          <View style={styles.topRow}>
            {/* Tapping avatar routes to github link */}
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => router.push({
                pathname: './siteview',
                params: { url: `https://github.com/${username}` }
              })}
            >
              <Image source={{ uri: avatar as string }} style={styles.avatar} />
            </TouchableOpacity>

            <View style={styles.info}>
              <Text style={styles.name}>{name || 'Developer'}</Text>
              <Text style={styles.email}>{email || 'Private Email'}</Text>
              {githubDetails?.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-sharp" size={12} color={SKYLA_CYAN} />
                  <Text style={styles.locationText}>{githubDetails.location}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Bio Section */}
          {githubDetails?.bio && (
            <Text style={styles.bioText}>{githubDetails.bio}</Text>
          )}

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{githubDetails?.public_repos || '0'}</Text>
              <Text style={styles.statLabel}>Repos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{githubDetails?.followers || '0'}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{githubDetails?.following || '0'}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* Repositories Section */}
        {username && (
          <View style={styles.section}>
            <Profilerepoview
              session={{ user: { user_metadata: { preferred_username: username } } }}
            />
          </View>
        )}

        {/* Users Posts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={SKYLA_CYAN} />
            <Text style={styles.sectionTitle}>Project Posts</Text>
          </View>

          {loadingPosts ? (
            <ActivityIndicator color={SKYLA_CYAN} style={{ marginTop: 20 }} />
          ) : userPosts.length > 0 ? (
            userPosts.map((post) => (
              <TouchableOpacity 
                key={post.id} 
                style={styles.postCard}
                onPress={() => router.push({
                  pathname: '../homepages/postview',
                  params: { postId: post.id, avatar, name }
                })}
              >
                {post.image_url && (
                  <Image source={{ uri: post.image_url }} style={styles.postImage} resizeMode="cover" />
                )}
                <View style={styles.postContent}>
                  <Text style={styles.postTitle} numberOfLines={1}>{post.title}</Text>
                  <Text style={styles.postDesc} numberOfLines={2}>{post.description}</Text>
                  <View style={styles.postFooter}>
                    <Text style={styles.postDate}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={SKYLA_CYAN} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No posts shared yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* --- REFINED BOTTOM CONTAINER --- */}
      <View style={styles.bottomBar}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SKYLA_DARK },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  backBtn: { 
    position: 'absolute', left: 20, zIndex: 10, width: 40, height: 40,
    borderRadius: 20, backgroundColor: 'rgba(28, 49, 80, 0.9)', 
    justifyContent: 'center', alignItems: 'center',
  },

  // Profile Header Expansion
  profileHeader: {
    marginBottom: 30,
    backgroundColor: SKYLA_NAVY,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(13, 221, 240, 0.15)',
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 15 },
  avatar: { width: 75, height: 75, borderRadius: 37.5, borderWidth: 2, borderColor: SKYLA_CYAN },
  info: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: '#f8fafc' },
  email: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 4 },
  locationText: { color: SKYLA_CYAN, fontSize: 12, fontWeight: '600' },
  
  bioText: { color: '#cbd5e1', fontSize: 14, lineHeight: 20, marginTop: 15, fontStyle: 'italic' },
  
  statsBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center',
    marginTop: 20, 
    paddingTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.05)' 
  },
  statItem: { alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statLabel: { color: '#64748b', fontSize: 11, textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' },

  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  postCard: {
    backgroundColor: SKYLA_NAVY, borderRadius: 15, marginBottom: 15,
    overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(13, 221, 240, 0.1)',
  },
  postImage: { width: '100%', height: 160, backgroundColor: SKYLA_DARK },
  postContent: { padding: 15 },
  postTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 5 },
  postDesc: { color: '#94a3b8', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postDate: { color: '#666', fontSize: 12 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },

  bottomBar: {
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    paddingTop: 15,
    backgroundColor: SKYLA_NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  }
});