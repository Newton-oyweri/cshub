import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
// Card width is 80% of screen so the next one is visible
const CARD_WIDTH = width * 0.8; 

interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  watchers_count: number;
  forks_count: number;
  size: number;
  updated_at: string;
}

export default function GithubRepos({ session }: { session: any }) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const token = session?.provider_token;
      const username = session?.user?.user_metadata?.user_name || session?.user?.user_metadata?.preferred_username;

      let url = token 
        ? 'https://api.github.com/user/repos?sort=updated&per_page=6'
        : `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) setRepos(data);
    } catch (error) {
      console.error("Error fetching repos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (kb: number) => {
    if (kb > 1024) return `${(kb / 1024).toFixed(1)}MB`;
    return `${kb}KB`;
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays > 30) return `${Math.floor(diffInDays / 30)}mo`;
    return `${diffInDays}d`;
  };

  const renderRepo = ({ item }: { item: Repo }) => (
    <TouchableOpacity 
      style={styles.repoCard} 
      onPress={() => Linking.openURL(item.html_url)}
      activeOpacity={0.8}
    >
      <View style={styles.repoHeader}>
        <View style={styles.nameRow}>
          <Ionicons name="book-outline" size={18} color="#38bdf8" />
          <Text style={styles.repoName} numberOfLines={1}>{item.name}</Text>
        </View>
        <Text style={styles.activityText}>{getTimeAgo(item.updated_at)}</Text>
      </View>
      
      <Text style={styles.repoDesc} numberOfLines={2}>
        {item.description || "No description provided."}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="git-network-outline" size={14} color="#64748b" />
          <Text style={styles.metaText}>{item.forks_count}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="layers-outline" size={14} color="#64748b" />
          <Text style={styles.metaText}>{formatSize(item.size)}</Text>
        </View>
      </View>

      <View style={styles.repoFooter}>
        <View style={styles.statGroup}>
          <View style={[styles.langDot, { backgroundColor: getLangColor(item.language) }]} />
          <Text style={styles.statText}>{item.language || 'Plain'}</Text>
        </View>
        <View style={styles.statGroup}>
          <Ionicons name="star" size={14} color="#facc15" />
          <Text style={[styles.statText, {color: '#facc15'}]}>{item.stargazers_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator color="#38bdf8" style={{ marginVertical: 30 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Featured Repositories</Text>
        <Ionicons name="chevron-forward" size={18} color="#64748b" />
      </View>
      <FlatList
        data={repos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRepo}
        horizontal // Enables horizontal scrolling
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + 16} // Snaps to each card (+ margin)
        decelerationRate="fast"
      />
    </View>
  );
}

const getLangColor = (lang: string) => {
  const colors: any = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    React: '#61dbfb',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5'
  };
  return colors[lang] || '#94a3b8';
};

const styles = StyleSheet.create({
  container: { width: '100%', marginVertical: 15 },
  titleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 5,
    marginBottom: 12 
  },
  sectionTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  listContent: { paddingRight: 20 }, // Extra padding at the end
  repoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginRight: 16, // Space between cards
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: '#334155',
    // Elevation for Android
    elevation: 4,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  repoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  repoName: { color: '#f8fafc', fontSize: 16, fontWeight: '700', marginLeft: 8, flex: 1 },
  activityText: { color: '#64748b', fontSize: 11, fontWeight: '700' },
  repoDesc: { color: '#94a3b8', fontSize: 13, marginBottom: 15, lineHeight: 18, height: 36 },
  metaRow: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#0f172a80', padding: 10, borderRadius: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  metaText: { color: '#94a3b8', fontSize: 12, marginLeft: 5, fontWeight: '600' },
  repoFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statGroup: { flexDirection: 'row', alignItems: 'center' },
  statText: { color: '#f8fafc', fontSize: 12, marginLeft: 6, fontWeight: '700' },
  langDot: { width: 10, height: 10, borderRadius: 5 },
});