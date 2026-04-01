import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const THREADS = [
  { 
    id: 1, 
    title: 'REACT VS REACT NATIVE: WHICH ONE SHOULD YOU LEARN IN 2024?', 
    author: 'Isack Skyla', 
    category: 'React', 
    time: '2H AGO', 
    discussions: 34,
    content: 'Both are great but depends on your goals...',
    image: null
  },
  { 
    id: 2, 
    title: 'BEST JAVASCRIPT PRACTICES FOR CLEAN CODE', 
    author: 'Sarah Johnson', 
    category: 'JavaScript', 
    time: '5H AGO', 
    discussions: 28,
    content: 'Learn about closures, promises, and async/await...',
    image: null
  },
  { 
    id: 3, 
    title: 'HOW TO STRUCTURE A CS PROJECT FOR MAXIMUM SCORE', 
    author: 'Michael Chen', 
    category: 'CS', 
    time: '1D AGO', 
    discussions: 45,
    content: 'Organization is key to success in CS projects...',
    image: require('../assets/images/logo.png') // placeholder image
  },
  { 
    id: 4, 
    title: 'TYPESCRIPT OR JAVASCRIPT: THE ULTIMATE SHOWDOWN', 
    author: 'Emily Rodriguez', 
    category: 'TypeScript', 
    time: '2D AGO', 
    discussions: 67,
    content: 'Type safety vs flexibility - let\'s discuss...',
    image: null
  },
  { 
    id: 5, 
    title: 'BEST RESOURCES TO LEARN PYTHON IN 2024', 
    author: 'David Kim', 
    category: 'Python', 
    time: '3D AGO', 
    discussions: 89,
    content: 'Free and paid resources for mastering Python...',
    image: require('../assets/images/icon.png') // placeholder image
  },
  { 
    id: 6, 
    title: 'HOW TO GET INTERNSHIPS AT TOP TECH COMPANIES', 
    author: 'Jessica Williams', 
    category: 'Career', 
    time: '4D AGO', 
    discussions: 56,
    content: 'Tips and tricks from someone who made it...',
    image: null
  },
  { 
    id: 7, 
    title: 'FRONTEND FRAMEWORKS IN 2024: REACT VS VUE VS ANGULAR', 
    author: 'Chris Martin', 
    category: 'Frontend', 
    time: '5D AGO', 
    discussions: 73,
    content: 'Which framework should you learn this year?...',
    image: require('../assets/images/logo.png') // placeholder image
  },
  { 
    id: 8, 
    title: 'UNDERSTANDING MACHINE LEARNING ALGORITHMS', 
    author: 'Dr. Patricia Lee', 
    category: 'AI/ML', 
    time: '6D AGO', 
    discussions: 42,
    content: 'Beginner-friendly explanation of ML concepts...',
    image: null
  },
  { 
    id: 9, 
    title: 'BUILDING YOUR FIRST MOBILE APP WITH REACT NATIVE', 
    author: 'Alex Thompson', 
    category: 'Mobile', 
    time: '1W AGO', 
    discussions: 91,
    content: 'Step-by-step guide for beginners...',
    image: require('../assets/images/logo.png') // placeholder image
  },
  { 
    id: 10, 
    title: 'DATABASE DESIGN BEST PRACTICES', 
    author: 'Maria Garcia', 
    category: 'Database', 
    time: '1W AGO', 
    discussions: 38,
    content: 'Normalization, indexing, and optimization tips...',
    image: null
  },
];

const categoryColors = {
  'React': ['#61DAFB', '#2C3E50'],
  'JavaScript': ['#F7DF1E', '#F5A623'],
  'CS': ['#6C5CE7', '#4834D4'],
  'TypeScript': ['#3178C6', '#2C3E50'],
  'Python': ['#3776AB', '#FFD43B'],
  'Career': ['#E67E22', '#D35400'],
  'Frontend': ['#E74C3C', '#C0392B'],
  'AI/ML': ['#9B59B6', '#8E44AD'],
  'Mobile': ['#2ECC71', '#27AE60'],
  'Database': ['#3498DB', '#2980B9'],
};

export default function ForumScreen() {
  const router = useRouter();
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      {/* Floating Account Icon */}
      <TouchableOpacity 
        onPress={() => router.push('/forumpages/Account')}
        style={styles.floatingAccount}
        activeOpacity={0.8}>
        <LinearGradient
          colors={['#0DDDF0', '#0A9BB0']}
          style={styles.accountGradient}>
          <Ionicons name="person" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        
        {THREADS.map((thread) => (
          <Animated.View
            key={thread.id}
            style={[
              styles.cardWrapper,
              { transform: [{ scale: scaleAnim }] }
            ]}>
            <TouchableOpacity 
              activeOpacity={0.9}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => {/* Handle navigation */}}>
              <LinearGradient
                colors={['rgba(34, 34, 46, 0.95)', 'rgba(26, 26, 46, 0.95)']}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                
                {/* Card Header with Image */}
                <View style={styles.cardHeader}>
                  <View style={styles.authorContainer}>
                    <Image
                      source={require('../assets/images/logo.png')}
                      style={styles.avatarImage}
                    />
                    <View style={styles.authorInfo}>
                      <Text style={styles.authorName}>{thread.author}</Text>
                      <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={10} color="#888" />
                        <Text style={styles.timeText}>{thread.time}</Text>
                      </View>
                    </View>
                  </View>
                  <LinearGradient
                    colors={categoryColors[thread.category] || ['#FFA500', '#FF6B6B']}
                    style={styles.categoryBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}>
                    <Text style={styles.categoryText}>{thread.category}</Text>
                  </LinearGradient>
                </View>

                {/* Thread Title */}
                <Text style={styles.titleText} numberOfLines={2}>
                  {thread.title}
                </Text>

                {/* Content Preview */}
                <Text style={styles.contentText} numberOfLines={2}>
                  {thread.content}
                </Text>

                {/* Post Image (if exists) */}
                {thread.image && (
                  <View style={styles.postImageContainer}>
                    <Image
                      source={thread.image}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                  <View style={styles.replyBadge}>
                    <MaterialCommunityIcons name="chat-outline" size={14} color="#FFA500" />
                    <Text style={styles.replyCount}>{thread.discussions} DISCUSSIONS</Text>
                  </View>
                </View>

                {/* Decorative Element */}
                <View style={styles.cardGlow} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingAccount: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#0DDDF0',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  accountGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingTop: 80,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(13, 221, 240, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  authorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  authorName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    color: '#888',
    fontSize: 10,
    marginLeft: 4,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  titleText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  contentText: {
    color: '#AAA',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    marginTop: 4,
  },
  replyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  replyCount: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  cardGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(13, 221, 240, 0.05)',
  },
});