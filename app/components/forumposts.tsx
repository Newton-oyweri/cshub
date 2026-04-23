// app/components/forumposts.tsx
import React, { useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Animated, TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';

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
  discussions?: number;
};

const categoryColors: Record<string, [string, string]> = {
  React: ['#61DAFB', '#1c2c4c'],
  'Next.js': ['#444444', '#000000'],
  TypeScript: ['#3178C6', '#1c2c4c'],
  Django: ['#092E20', '#1c2c4c'],
  Python: ['#3776AB', '#1c2c4c'],
  // Fallback for others
  Default: ['#FFA500', '#FF6B6B'],
};

export default function ForumPostCard({ post }: { post: Post }) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { 
      toValue: 0.97, 
      useNativeDriver: true,
      speed: 20 
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { 
      toValue: 1, 
      useNativeDriver: true,
      speed: 20 
    }).start();
  };

  const profile = post.profiles;
  const displayName = profile?.name || 'Anonymous';
  const avatarUrl = profile?.profilepic_url;
  const mainCategory = post.category?.[0] || 'General';

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
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
              discussions: String(post.discussions || 0),
            },
          })
        }
      >
        <LinearGradient colors={['#22222E', '#1A1A2E']} style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.authorContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <MaterialCommunityIcons name="account" size={18} color="#FFF" />
                </View>
              )}
              <Text style={styles.author}>{displayName}</Text>
            </View>

            <LinearGradient
              colors={categoryColors[mainCategory] || categoryColors.Default}
              style={styles.badge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.badgeText}>{mainCategory}</Text>
            </LinearGradient>
          </View>

          {/* Body */}
          <Text style={styles.title} numberOfLines={2}>
            {post.title}
          </Text>

          <Text style={styles.contentText} numberOfLines={2}>
            {post.description}
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.discussion}>
              <MaterialCommunityIcons name="chat-processing-outline" size={16} color="#FFA500" />
              <Text style={styles.discussionText}>
                {post.discussions || 0} discussions
              </Text>
            </View>

            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFA500" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: { marginBottom: 12 },
  card: { 
    borderRadius: 20, 
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  author: {
    color: '#E0E0E0',
    fontWeight: '500',
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 22,
  },
  contentText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  discussion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discussionText: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: '500',
  },
});