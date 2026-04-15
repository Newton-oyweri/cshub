import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Image, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import UserComments from '../forumpages/UserComments';

export default function PostView() {
  const { postId, avatar, name } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_profiles_fkey (name, institution, github_url, email)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#0DDDF0" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* KeyboardAvoidingView handles the input lift */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header Bar */}
          <View style={[styles.headerBar, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Project Details</Text>
            <View style={{ width: 40 }} /> 
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled" // Allows clicking "Send" while keyboard is up
          >
            {/* Author Info */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: avatar as string }} style={styles.avatar} />
                <View style={styles.onlineBadge} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{name || post?.author?.name}</Text>
                <Text style={styles.institution}>{post?.author?.institution || 'Developer'}</Text>
              </View>
            </View>

            {/* Post Content Area */}
            <View style={styles.contentCard}>
              <Text style={styles.postTitle}>{post?.title}</Text>
              
              {post?.image_url && (
                // Added a container for proper centering and background
                <View style={styles.postImageContainer}>
                  <Image 
                    source={{ uri: post.image_url }} 
                    style={styles.postImage} 
                    resizeMode="contain" // Guaranteed to show the full image
                  />
                </View>
              )}

              <Text style={styles.description}>{post?.description}</Text>

              {/* Quick Links */}
              <View style={styles.linkRow}>
                {post?.github_url && (
                  <TouchableOpacity 
                    style={styles.linkButton} 
                    onPress={() => router.push({ pathname: '../homepages/webview', params: { url: post.github_url } })}
                  >
                    <Ionicons name="logo-github" size={18} color="#fff" />
                    <Text style={styles.linkText}>Source Code</Text>
                  </TouchableOpacity>
                )}
                {post?.site_url && (
                  <TouchableOpacity 
                    style={[styles.linkButton, { backgroundColor: '#0DDDF020', borderColor: '#0DDDF0' }]} 
                    onPress={() => router.push({ pathname: '../homepages/siteview', params: { url: post.site_url } })}
                  >
                    <Ionicons name="globe-outline" size={18} color="#0DDDF0" />
                    <Text style={[styles.linkText, { color: '#0DDDF0' }]}>Live Demo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Comments Section */}
            <UserComments postId={postId as string} />

          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1C38' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  iconBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 15,
  },
  avatarContainer: { position: 'relative', marginRight: 15 },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#0DDDF0' },
  onlineBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#0F1C38',
  },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: '#fff' },
  institution: { fontSize: 13, color: '#94a3b8' },

  contentCard: { marginBottom: 10 },
  postTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 15 },
  
  // New container style for centering and background
  postImageContainer: {
    width: '100%',
    height: 300, 
    borderRadius: 15,
    backgroundColor: '#1C3150', // Matching Skyla Navy Mid theme
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 15,
  },
  // Restored original style of the Image component within the container
  postImage: { 
    width: '100%', 
    height: '100%', 
  },
  description: { fontSize: 16, color: '#ccc', lineHeight: 24, marginBottom: 20 },
  
  linkRow: { flexDirection: 'row', gap: 12 },
  linkButton: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, 
    backgroundColor: '#1C3150', paddingHorizontal: 15, paddingVertical: 10, 
    borderRadius: 10, borderWidth: 1, borderColor: '#334155' 
  },
  linkText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 20 },
});