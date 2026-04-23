import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const CATEGORIES = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Solid.js',
  'Django', 'Flask', 'FastAPI', 'Node.js', 'Express.js',
  'Spring Boot', 'Laravel', 'Ruby on Rails', 'ASP.NET Core',
  'Flutter', 'React Native', 'Swift', 'Kotlin', 'Java',
  'Python', 'TypeScript', 'JavaScript', 'Go', 'Rust',
  'Tailwind CSS', 'Bootstrap', 'Material UI', 'PostgreSQL', 
  'MySQL', 'MongoDB', 'Firebase', 'Docker', 'Kubernetes', 'AWS'
];

export default function PostForum() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter categories based on small search input
  const filteredCategories = useMemo(() => {
    return CATEGORIES.filter(cat => 
      cat.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handlePost = async () => {
    if (!title || !description || !selectedCategory) {
      Alert.alert('Missing fields', 'Please provide a title, description, and pick a category.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('forumposts').insert([
        {
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category: [selectedCategory], // Matches text[] constraint
        },
      ]);

      if (error) throw error;
      router.back();
    } catch (err: any) {
      Alert.alert('Post Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={15}>
            <Ionicons name="chevron-back" size={28} color="#0DDDF0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ask the Community</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <Text style={styles.label}>Topic Title</Text>
          <TextInput
            placeholder="What is on your mind?"
            placeholderTextColor="#555"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          {/* Category Section with Small Search */}
          <View style={styles.categoryHeader}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.searchMiniContainer}>
              <Ionicons name="search" size={14} color="#555" />
              <TextInput 
                placeholder="Find..."
                placeholderTextColor="#444"
                style={styles.miniSearchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.chipWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
              {filteredCategories.length === 0 && (
                <Text style={styles.noResultText}>No tech found</Text>
              )}
            </ScrollView>
          </View>

          {/* Description Input */}
          <Text style={styles.label}>Details</Text>
          <TextInput
            placeholder="Explain your issue or share your thoughts..."
            placeholderTextColor="#555"
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handlePost} 
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#FFA500', '#FF7F00']} style={styles.button}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Post Question</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { 
    flex: 1, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  scrollContent: { padding: 20 },
  label: {
    color: '#0DDDF0',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
    opacity: 0.8
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: '#FFF',
    padding: 16,
    borderRadius: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20,
  },
  textArea: { height: 150, textAlignVertical: 'top' },
  categoryHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10 
  },
  searchMiniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    borderRadius: 10,
    width: 100,
  },
  miniSearchInput: {
    color: '#FFF',
    fontSize: 12,
    paddingVertical: 4,
    marginLeft: 5,
    flex: 1
  },
  chipWrapper: { marginBottom: 25, marginHorizontal: -20, paddingHorizontal: 20 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  chipActive: { backgroundColor: '#FFA500', borderColor: '#FFA500' },
  chipText: { color: '#888', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  noResultText: { color: '#444', fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FFA500',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});