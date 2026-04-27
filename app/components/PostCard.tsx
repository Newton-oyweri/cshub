import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const logo = require('../../assets/images/logo.png');

const SKYLA_ORANGE = '#FE9A0F';
const SKYLA_CYAN = '#0DDDF0';
const SKYLA_NAVY_MID = '#1C3150';

export default function PostCard({ post, gitStats, onRefreshStats }: any) {
  const router = useRouter();
  const [imgHeight, setImgHeight] = useState(250);
  
  const profile = post.author;
  const displayName = profile?.name || "Skyla User";
  const displayAvatar = profile?.profilepic_url;
  const githubUsername = profile?.github_url?.split('/').pop() || "";
  const stats = gitStats[post.id] || { stars: '...', forks: '...', watchers: '...' };
  const hasImage = !!(post.image_url && post.image_url.trim() !== '');
  const commentCount = post.comments_count?.[0]?.count || 0;

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    const calculated = (SCREEN_WIDTH - 20) * (height / width);
    setImgHeight(Math.min(calculated, 450)); // Cap height for sleekness
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity 
        style={styles.header}
        onPress={() => router.push({
          pathname: '../homepages/profileview',
          params: { postId: post.id, name: displayName, avatar: displayAvatar, username: githubUsername, email: profile?.email }
        })}
      >
        <Image source={displayAvatar ? { uri: displayAvatar } : logo} style={styles.avatar} />
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

      {/* Project Image - Centered & Enhanced */}
      {hasImage && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: post.image_url }} 
            style={[styles.image, { height: imgHeight }]}
            resizeMode="contain"
            onLoad={handleImageLoad}
          />
        </View>
      )}

      {/* Info */}
      <View style={[styles.postInfo, !hasImage && styles.postInfoNoImage]}>
        <Text style={styles.repoName}>{post.title}</Text>
        <Text style={styles.description} numberOfLines={3}>{post.description}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}><Ionicons name="star" size={18} color={SKYLA_ORANGE} /><Text style={styles.statText}>{stats.stars}</Text></View>
        <View style={styles.stat}><Ionicons name="git-branch" size={18} color={SKYLA_CYAN} /><Text style={styles.statText}>{stats.forks}</Text></View>
        <View style={styles.stat}><Ionicons name="eye" size={18} color="#94a3b8" /><Text style={styles.statText}>{stats.watchers}</Text></View>
        <Text style={styles.lastUpdated}>{new Date(post.created_at).toLocaleDateString()}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: '../homepages/postview', params: { postId: post.id, name: displayName, avatar: displayAvatar, username: githubUsername, email: profile?.email } })}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#ddd" />
          <Text style={styles.statText}>{commentCount}</Text>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        {post.site_url && (
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: '../homepages/siteview', params: { url: post.site_url } })}>
            <Ionicons name="globe-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>Site</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: '../homepages/webview', params: { url: post.github_url } })}>
          <Ionicons name="logo-github" size={20} color="#ddd" /><Text style={styles.actionText}>Repo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: SKYLA_NAVY_MID, borderRadius: 18, marginBottom: 16, overflow: 'hidden', elevation: 6 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(0,0,0,0.2)' },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12, borderWidth: 2, borderColor: SKYLA_CYAN },
  headerInfo: { flex: 1 },
  name: { color: '#fff', fontSize: 16, fontWeight: '700' },
  institution: { color: '#aaa', fontSize: 13 },
  languageBadge: { backgroundColor: SKYLA_ORANGE + '25', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 12 },
  languageText: { color: SKYLA_ORANGE, fontSize: 12, fontWeight: '700' },
  imageContainer: { backgroundColor: '#050a12', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden' },
  image: { width: '100%' },
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
});