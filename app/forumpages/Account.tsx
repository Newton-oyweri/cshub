import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../lib/supabase';

// Handle browser session cleanup
WebBrowser.maybeCompleteAuthSession();

export default function AccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    name: '',
    year_of_study: '',
    institution: '',
    bio: '',
    github_url: '',
    portfolio_url: ''
  });
  const [saving, setSaving] = useState(false);

  // --- AUTH INITIALIZATION ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- PROFILE LOADER ---
  useEffect(() => {
    if (!session) return;
    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Profile fetch error:', error.message);
        return;
      }
      if (data) setProfile(data);
    };
    loadProfile();
  }, [session]);

  // --- GITHUB OAUTH FLOW ---
  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      // Correctly generates: exp://exp.host/@isackskyla/cshub/--/auth-callback 
      // or cshub://auth-callback in production
      const redirectTo = Linking.createURL('auth-callback');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        
        // If the browser returns a success URL containing tokens
        if (result.type === 'success' && result.url) {
          const { access_token, refresh_token } = extractTokensFromUrl(result.url);
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      }
    } catch (error: any) {
      Alert.alert('GitHub Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const extractTokensFromUrl = (url: string) => {
    const params = new URLSearchParams(url.split('#')[1]);
    return {
      access_token: params.get('access_token'),
      refresh_token: params.get('refresh_token'),
    };
  };

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) return Alert.alert('Error', 'Enter email and password');
    setLoading(true);
    const { error } = type === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    
    if (error) Alert.alert('Auth Error', error.message);
    else if (type === 'signup') Alert.alert('Success', 'Check your email!');
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!session) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      ...profile,
      email: session.user.email,
      updated_at: new Date(),
    });
    setSaving(false);
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Success', 'Profile updated!');
  };

  // --- UI RENDERING (LOGGED IN) ---
  if (session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerArea}>
            <Text style={styles.title}>Account</Text>
            <Text style={styles.subtitle}>{session.user.email}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Profile Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={profile?.name}
              onChangeText={(t) => setProfile({ ...profile, name: t })}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Year"
                value={profile?.year_of_study}
                onChangeText={(t) => setProfile({ ...profile, year_of_study: t })}
              />
              <TextInput
                style={[styles.input, { flex: 2 }]}
                placeholder="Institution"
                value={profile?.institution}
                onChangeText={(t) => setProfile({ ...profile, institution: t })}
              />
            </View>
            <TextInput
              style={[styles.input, styles.bio]}
              placeholder="Tell us about yourself..."
              multiline
              value={profile?.bio}
              onChangeText={(t) => setProfile({ ...profile, bio: t })}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>External Links</Text>
            <TextInput
              style={styles.input}
              placeholder="GitHub Profile URL"
              value={profile?.github_url}
              onChangeText={(t) => setProfile({ ...profile, github_url: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Portfolio URL"
              value={profile?.portfolio_url}
              onChangeText={(t) => setProfile({ ...profile, portfolio_url: t })}
            />
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={saveProfile} disabled={saving}>
            <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : 'Update Profile'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn} onPress={() => supabase.auth.signOut()}>
            <Text style={styles.outlineBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- UI RENDERING (LOGIN) ---
  return (
    <View style={styles.authContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.loginCard}>
          <Text style={styles.authTitle}>Welcome</Text>
          <Text style={styles.authSubtitle}>Sign in to cshub</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={() => handleAuth('login')} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Log In</Text>}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} /><Text style={styles.dividerText}>OR</Text><View style={styles.line} />
          </View>

          <TouchableOpacity style={[styles.primaryBtn, styles.githubBtn]} onPress={handleGitHubLogin}>
            <Text style={styles.primaryBtnText}>Continue with GitHub</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.textBtn} onPress={() => handleAuth('signup')}>
            <Text style={styles.textBtnText}>Don't have an account? <Text style={{fontWeight: '700'}}>Sign Up</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  authContainer: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', padding: 24 },
  loginCard: { width: '100%' },
  scrollContainer: { flexGrow: 1, padding: 20 },
  authTitle: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  authSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
  headerArea: { marginVertical: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 16, textTransform: 'uppercase' },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, elevation: 3 },
  row: { flexDirection: 'row', gap: 12 },
  input: { backgroundColor: '#F1F3F5', padding: 16, borderRadius: 14, marginBottom: 12 },
  bio: { height: 100, textAlignVertical: 'top' },
  primaryBtn: { backgroundColor: '#1A1A1A', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  githubBtn: { backgroundColor: '#24292e' },
  primaryBtnText: { color: '#FFF', fontWeight: '700' },
  outlineBtn: { padding: 18, alignItems: 'center', marginTop: 10, borderRadius: 16, borderWidth: 1, borderColor: '#E9ECEF' },
  outlineBtnText: { color: '#FF3B30', fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#E9ECEF' },
  dividerText: { marginHorizontal: 10, color: '#999', fontSize: 12 },
  textBtn: { marginTop: 20, alignItems: 'center' },
  textBtnText: { color: '#666' }
});