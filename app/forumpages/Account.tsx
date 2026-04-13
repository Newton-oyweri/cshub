import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
  StatusBar,
  ScrollView // Added ScrollView
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import GithubRepos from './githubrepos';

WebBrowser.maybeCompleteAuthSession();

export default function AccountPage() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      const redirectTo = AuthSession.makeRedirectUri({ scheme: 'cshub' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === 'success' && result.url) {
          const params = new URL(result.url.replace('#', '?')).searchParams;
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) return (
    <View style={[styles.center, { backgroundColor: '#0f172a' }]}>
      <ActivityIndicator size="large" color="#38bdf8" />
    </View>
  );

  if (session) {
    const userMeta = session.user?.user_metadata;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        {/* Wrap content in ScrollView so Repos don't get cut off */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: userMeta?.avatar_url }} style={styles.avatar} />
              <View style={styles.onlineBadge} />
            </View>
            <Text style={styles.name}>{userMeta?.full_name || 'Developer'}</Text>
            <Text style={styles.email}>{session.user?.email}</Text>
          </View>

          {/* List of Repos */}
          <GithubRepos session={session} />

          <TouchableOpacity style={styles.logoutBtn} onPress={() => supabase.auth.signOut()}>
            <Ionicons name="log-out-outline" size={20} color="#f87171" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.authContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>CS</Text>
      </View>
      <Text style={styles.welcomeText}>Welcome to cshub</Text>
      <Text style={styles.subText}>Premium Student Resources & Dashboards</Text>

      <TouchableOpacity 
        style={styles.loginBtn} 
        onPress={handleGitHubLogin} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.btnInner}>
            <Ionicons name="logo-github" size={24} color="#fff" style={{ marginRight: 12 }} />
            <Text style={styles.loginBtnText}>Continue with GitHub</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 40 }, // Added padding for scroll
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 30 },
  
  logoCircle: { width: 80, height: 80, borderRadius: 25, backgroundColor: '#38bdf8', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#38bdf8', shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
  logoText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  welcomeText: { fontSize: 28, fontWeight: '800', color: '#f8fafc', marginBottom: 8 },
  subText: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 50 },
  loginBtn: { width: '100%', backgroundColor: '#1e293b', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  btnInner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  profileHeader: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  avatarContainer: { position: 'relative', marginBottom: 20 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#38bdf8' },
  onlineBadge: { position: 'absolute', bottom: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: '#22c55e', borderWidth: 3, borderColor: '#0f172a' },
  name: { fontSize: 26, fontWeight: '800', color: '#f8fafc' },
  email: { fontSize: 16, color: '#94a3b8', marginTop: 4 },

  statsCard: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 20, padding: 25, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  divider: { width: 1, height: '100%', backgroundColor: '#334155' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 25 },
  logoutText: { color: '#f87171', fontSize: 16, fontWeight: '700', marginLeft: 10 }
});