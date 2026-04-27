import { StyleSheet, Text, View, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const SKYLA_DARK = '#0F1C38';
const SKYLA_CYAN = '#00B8D9';
const SKYLA_NAVY_MID = '#1C3150';

interface Profile {
  id: string;
  name: string;
  email: string;
  year_of_study: string | null;
  institution: string;
  profilepic_url: string | null;
  bio: string;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
}

export default function ProfileSearch() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const filtered = profiles.filter(profile =>
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProfiles(filtered);
    }
  }, [searchQuery, profiles]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      setProfiles(data || []);
      setFilteredProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfiles();
    setRefreshing(false);
  };

  const handleProfilePress = (profile: Profile) => {
    const githubUsername = profile.github_url?.split('/').pop() || "";
    router.push({
      pathname: '../homepages/profileview',
      params: { 
        postId: profile.id,  // Using id as postId to match your pattern
        name: profile.name, 
        avatar: profile.profilepic_url, 
        username: githubUsername,
        email: profile.email
      }
    });
  };

  const renderProfileCard = ({ item }: { item: Profile }) => (
    <TouchableOpacity 
      style={styles.profileCard} 
      onPress={() => handleProfilePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          {item.profilepic_url ? (
            <Image 
              source={{ uri: item.profilepic_url }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImageFallback}>
              <Ionicons name="person" size={30} color={SKYLA_CYAN} />
            </View>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{item.name || 'New User'}</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="school-outline" size={14} color="#AAA" />
            <Text style={styles.detailText}>
              {item.institution || 'University Student'}
            </Text>
          </View>

          {item.year_of_study && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#AAA" />
              <Text style={styles.detailText}>{item.year_of_study}</Text>
            </View>
          )}

          <View style={styles.socialLinks}>
            {item.github_url && (
              <Ionicons name="logo-github" size={16} color="#AAA" />
            )}
            {item.portfolio_url && (
              <Ionicons name="link-outline" size={16} color="#AAA" />
            )}
          </View>
        </View>

        {/* Arrow Icon */}
        <Ionicons name="chevron-forward" size={20} color="#AAA" />
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#333" />
      <Text style={styles.emptyStateTitle}>No Profiles Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'Try a different search term' : 'No user profiles available yet'}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={SKYLA_CYAN} />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, institution, or bio..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredProfiles.length} {filteredProfiles.length === 1 ? 'Profile' : 'Profiles'} Found
        </Text>
      </View>

      {/* Profiles List */}
      <FlatList
        data={filteredProfiles}
        renderItem={renderProfileCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={SKYLA_CYAN} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1D',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: Constants.statusBarHeight + 12,
    paddingBottom: 8,
    backgroundColor: SKYLA_DARK,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2A4A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
    padding: 0,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A0F1D',
  },
  resultsText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  profileCard: {
    backgroundColor: SKYLA_NAVY_MID,
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: SKYLA_CYAN,
  },
  profileImageFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E2A4A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: SKYLA_CYAN,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  detailText: {
    color: '#AAA',
    fontSize: 13,
    flex: 1,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#AAA',
    fontSize: 14,
    textAlign: 'center',
  },
});