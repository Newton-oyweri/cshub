import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { supabase } from '../../lib/supabase';

const WORKER_URL = 'https://posts-api.unscriptedusa.workers.dev';
const SKYLA_DARK = '#0F1C38';
const SKYLA_NAVY_MID = '#1C3150';
const SKYLA_ORANGE = '#FE9A0F';

export default function CreatePost() {
  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [repos, setRepos] = useState<any[]>([]);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [fetchingRepos, setFetchingRepos] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    
    const ghUsername = session?.user?.user_metadata?.preferred_username;
    if (ghUsername) {
      fetchGithubRepos(ghUsername);
    }
  };

  const fetchGithubRepos = async (username: string) => {
    setFetchingRepos(true);
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRepos(data);
      } else {
        console.error("GitHub Error:", data.message);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setFetchingRepos(false);
    }
  };

  const selectRepo = (repo: any) => {
    setGithubUrl(repo.html_url);
    setTitle(repo.name); 
    setDescription(repo.description || '');
    setShowRepoModal(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to gallery');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      allowsEditing: false, // Disabled cropping
      quality: 0.92,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !githubUrl) {
      Alert.alert('Missing Info', 'Repository is required.');
      return;
    }

    setLoading(true);

    try {
      let image_url = null;

      if (image) {
        const formData = new FormData();
        formData.append('file', { 
          uri: image, 
          name: `post_${Date.now()}.jpg`, 
          type: 'image/jpeg' 
        } as any);

        const uploadRes = await fetch(WORKER_URL, { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Image upload failed');
        const data = await uploadRes.json();
        image_url = data.image_url;
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        title,
        description,
        image_url,
        github_url: githubUrl,
        site_url: siteUrl.trim() || null,
      });

      if (error) throw error;

      Alert.alert('Success!', 'Your project is now live.', [
        { text: 'Awesome', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Post Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: SKYLA_DARK }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Share Build</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Image Preview */}
        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          {image ? (
            <Image 
              source={{ uri: image }} 
              style={styles.image} 
              resizeMode="cover" 
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={42} color={SKYLA_ORANGE} />
              <Text style={styles.placeholder}>Select Project Cover (Optional)</Text>
              <Text style={styles.placeholderSub}>Tap to select an image</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.repoBtn} onPress={() => setShowRepoModal(true)}>
          <Ionicons name="logo-github" size={22} color="#fff" />
          <Text style={styles.repoBtnText}>
            {githubUrl ? `Linked: ${title}` : 'Attach GitHub Repository *'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={SKYLA_ORANGE} />
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Repository Title</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={title}
            editable={false}
            placeholder="Title will auto-fill..."
            placeholderTextColor="#4b5563"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>GitHub URL</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={githubUrl}
            editable={false}
            placeholder="URL will auto-fill..."
            placeholderTextColor="#4b5563"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Live Demo URL (Optional)</Text>
          <TextInput
            style={styles.input}
            value={siteUrl}
            onChangeText={setSiteUrl}
            placeholder="https://your-project.vercel.app"
            placeholderTextColor="#8A94A6"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Project Story / Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="What did you build? What tech did you use?"
            placeholderTextColor="#8A94A6"
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity 
          style={[styles.publishBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.publishBtnText}>Publish Project</Text>}
        </TouchableOpacity>

      </ScrollView>

      {/* Repository Modal */}
      <Modal visible={showRepoModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Repo</Text>
              <TouchableOpacity onPress={() => setShowRepoModal(false)}>
                <Ionicons name="close-circle" size={30} color="#8A94A6" />
              </TouchableOpacity>
            </View>
            
            {fetchingRepos ? (
              <ActivityIndicator color={SKYLA_ORANGE} style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={repos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.repoItem} onPress={() => selectRepo(item)}>
                    <Text style={styles.repoItemName}>{item.name}</Text>
                    <View style={styles.repoItemMeta}>
                      <View style={[styles.langDot, { backgroundColor: item.language ? '#38bdf8' : '#475569' }]} />
                      <Text style={styles.repoItemLang}>{item.language || 'Documentation'}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 60 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25, 
    marginTop: 10 
  },
  headerText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  
  imageBox: {
    height: 220,
    backgroundColor: SKYLA_NAVY_MID,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff08',
  },
  image: { 
    width: '100%', 
    height: '100%', 
  },
  placeholderContainer: { alignItems: 'center' },
  placeholder: { color: '#fff', marginTop: 10, fontSize: 16, fontWeight: '600' },
  placeholderSub: { color: '#8A94A6', fontSize: 12, marginTop: 4 },

  repoBtn: {
    flexDirection: 'row',
    backgroundColor: SKYLA_NAVY_MID,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: SKYLA_ORANGE + '40',
  },
  repoBtnText: { color: '#fff', flex: 1, marginLeft: 12, fontWeight: '700', fontSize: 15 },

  inputGroup: { marginBottom: 18 },
  label: { color: SKYLA_ORANGE, fontSize: 11, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
  input: { 
    backgroundColor: SKYLA_NAVY_MID, 
    color: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 16 
  },
  disabledInput: { color: '#64748b', backgroundColor: '#0f172a' },
  textArea: { height: 120, textAlignVertical: 'top' },

  publishBtn: { 
    backgroundColor: SKYLA_ORANGE, 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10, 
    elevation: 5 
  },
  publishBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#1e293b', 
    height: '75%', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  repoItem: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  repoItemName: { color: '#fff', fontSize: 17, fontWeight: '600' },
  repoItemMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  langDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  repoItemLang: { color: '#94a3b8', fontSize: 13 },
});