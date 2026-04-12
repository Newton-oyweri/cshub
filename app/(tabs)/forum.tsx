import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { scrollYValue } from './_layout';

const THREADS = [
  {
    id: 1,
    title: 'React vs React Native',
    author: 'Newton',
    category: 'React',
    time: '2H AGO',
    discussions: 12,
    content: 'Which one should you learn first?'
  },
  {
    id: 2,
    title: 'TypeScript vs JavaScript',
    author: 'Skyla',
    category: 'TypeScript',
    time: '5H AGO',
    discussions: 20,
    content: 'Type safety vs flexibility'
  },
  {
    id: 3,
    title: 'Best way to learn Python',
    author: 'Alex',
    category: 'Python',
    time: '1H AGO',
    discussions: 8,
    content: 'Beginner roadmap discussion'
  },
  {
    id: 4,
    title: 'Frontend vs Backend Development',
    author: 'Grace',
    category: 'Web Dev',
    time: '3H AGO',
    discussions: 15,
    content: 'Which path pays more?'
  },
  {
    id: 5,
    title: 'AI replacing programmers?',
    author: 'Newton',
    category: 'AI',
    time: '6H AGO',
    discussions: 34,
    content: 'Future of software engineering'
  },
  {
    id: 6,
    title: 'Node.js performance tips',
    author: 'Brian',
    category: 'Backend',
    time: '4H AGO',
    discussions: 10,
    content: 'How to optimize APIs'
  },
  {
    id: 7,
    title: 'CSS Grid vs Flexbox',
    author: 'Mary',
    category: 'CSS',
    time: '2H AGO',
    discussions: 18,
    content: 'Layout system comparison'
  },
  {
    id: 8,
    title: 'Firebase vs Supabase',
    author: 'Skyla',
    category: 'Backend',
    time: '7H AGO',
    discussions: 22,
    content: 'Which backend is better?'
  },
  {
    id: 9,
    title: 'Best IDE for coding',
    author: 'John',
    category: 'Tools',
    time: '1D AGO',
    discussions: 11,
    content: 'VS Code vs others'
  },
  {
    id: 10,
    title: 'How to build a trading app',
    author: 'Newton',
    category: 'Startup',
    time: '3H AGO',
    discussions: 27,
    content: 'From idea to product'
  },
  {
    id: 11,
    title: 'Java vs Kotlin',
    author: 'David',
    category: 'Mobile',
    time: '8H AGO',
    discussions: 14,
    content: 'Android development choice'
  },
  {
    id: 12,
    title: 'Git best practices',
    author: 'Alice',
    category: 'DevOps',
    time: '5H AGO',
    discussions: 9,
    content: 'Clean commit history tips'
  },
  {
    id: 13,
    title: 'MongoDB vs PostgreSQL',
    author: 'Brian',
    category: 'Database',
    time: '9H AGO',
    discussions: 19,
    content: 'SQL vs NoSQL debate'
  },
  {
    id: 14,
    title: 'Freelancing as a developer',
    author: 'Grace',
    category: 'Career',
    time: '10H AGO',
    discussions: 25,
    content: 'Getting first clients'
  },
  {
    id: 15,
    title: 'Best programming habits',
    author: 'Newton',
    category: 'Python',
    time: '2D AGO',
    discussions: 30,
    content: 'How to code efficiently'
  }
];

const categoryColors: Record<string, readonly [string, string]> = {
  React: ['#61DAFB', '#0B1F2A'],
  ReactNative: ['#61DAFB', '#132B3A'],
  TypeScript: ['#3178C6', '#0B1F2A'],
  JavaScript: ['#F7DF1E', '#1F1F1F'],
  Python: ['#3776AB', '#0B1F2A'],
  Java: ['#ED8B00', '#1B1B1B'],
  Kotlin: ['#7F52FF', '#1C1C2E'],
  Swift: ['#FA7343', '#1A1A1A'],

  Node: ['#3C873A', '#0B1F2A'],
  Express: ['#FFFFFF', '#1F1F1F'],
  NextJS: ['#FFFFFF', '#000000'],

  HTML: ['#E34F26', '#1A1A1A'],
  CSS: ['#1572B6', '#0B1F2A'],
  Tailwind: ['#38BDF8', '#0B1F2A'],

  MongoDB: ['#4DB33D', '#0B1F2A'],
  PostgreSQL: ['#336791', '#0B1F2A'],
  MySQL: ['#00758F', '#0B1F2A'],

  Firebase: ['#FFCA28', '#1F1F1F'],
  Supabase: ['#3ECF8E', '#0B1F2A'],

  AI: ['#8E44AD', '#0B1F2A'],
  MachineLearning: ['#9B59B6', '#0B1F2A'],

  DevOps: ['#F1502F', '#1A1A1A'],
  Docker: ['#2496ED', '#0B1F2A'],
  Kubernetes: ['#326CE5', '#0B1F2A'],

  Git: ['#F05032', '#1A1A1A'],
  GitHub: ['#FFFFFF', '#0B1F2A'],

  Backend: ['#2ECC71', '#0B1F2A'],
  Frontend: ['#E67E22', '#0B1F2A'],

  Database: ['#1ABC9C', '#0B1F2A'],
  Cloud: ['#3498DB', '#0B1F2A'],

  Security: ['#E74C3C', '#1A1A1A'],
  Career: ['#9B59B6', '#0B1F2A'],
  Startup: ['#F39C12', '#1A1A1A'],

  Tools: ['#95A5A6', '#0B1F2A'],
  Productivity: ['#16A085', '#0B1F2A'],
};

export default function ForumScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollYValue } } }],
    {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollYValue.setValue(event.nativeEvent.contentOffset.y);
      }
    }
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.gradient}>

        {/* Floating Account Button */}
        <TouchableOpacity
          onPress={() => router.push('/forumpages/Account')}
          style={styles.floatingAccount}>
          <Ionicons name="person" size={24} color="#FFF" />
        </TouchableOpacity>

        <Animated.ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >

          {THREADS.map((thread) => (
            <Animated.View
              key={thread.id}
              style={[
                styles.cardWrapper,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >

              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() =>
                  router.push({
                    pathname: '/components/singleforumpage',
                    params: {
                      id: String(thread.id),
                      title: thread.title,
                      author: thread.author,
                      content: thread.content,
                      category: thread.category,
                      time: thread.time,
                      discussions: String(thread.discussions),
                    }
                  })
                }
              >

                <LinearGradient
                  colors={['#22222E', '#1A1A2E']}
                  style={styles.card}
                >

                  {/* Header */}
                  <View style={styles.header}>
                    <Text style={styles.author}>{thread.author}</Text>

                    <LinearGradient
                      colors={categoryColors[thread.category] || ['#FFA500', '#FF6B6B']}
                      style={styles.badge}
                    >
                      <Text style={styles.badgeText}>{thread.category}</Text>
                    </LinearGradient>
                  </View>

                  {/* Title */}
                  <Text style={styles.title} numberOfLines={2}>
                    {thread.title}
                  </Text>

                  {/* Content */}
                  <Text style={styles.contentText} numberOfLines={2}>
                    {thread.content}
                  </Text>

                  {/* Footer */}
                  <View style={styles.footer}>
                    <View style={styles.discussion}>
                      <MaterialCommunityIcons name="chat-outline" size={14} color="#FFA500" />
                      <Text style={styles.discussionText}>
                        {thread.discussions}
                      </Text>
                    </View>

                    <MaterialCommunityIcons name="chevron-right" size={20} color="#FFA500" />
                  </View>

                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}

        </Animated.ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  gradient: { flex: 1 },

  floatingAccount: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
    backgroundColor: '#0DDDF0',
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    paddingTop: 80,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  cardWrapper: {
    marginBottom: 16,
  },

  card: {
    borderRadius: 16,
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  author: {
    color: '#FFF',
    fontWeight: '600',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    color: '#FFF',
    fontSize: 10,
  },

  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },

  contentText: {
    color: '#AAA',
    fontSize: 13,
    marginBottom: 10,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  discussion: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  discussionText: {
    color: '#FFA500',
    marginLeft: 5,
  },
});