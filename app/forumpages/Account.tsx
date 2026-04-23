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
  ScrollView
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import type { Session } from '@supabase/supabase-js';
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession: Session | null) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      const redirectTo = AuthSession.makeRedirectUri({ scheme: 'cshub' });
      
      // FIXED: Added 'public_repo' scope to allow Star/Fork actions
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { 
          redirectTo, 
          skipBrowserRedirect: true,
          scopes: 'public_repo read:user' 
        },
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
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Header: Updated to match your ProfileView structure */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: userMeta?.avatar_url }} style={styles.avatar} />
              <View style={styles.onlineBadge} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.name}>{userMeta?.full_name || userMeta?.user_name || 'Developer'}</Text>
              <Text style={styles.email}>{session.user?.email}</Text>
            </View>
          </View>

          {/* Repository Horizontal List */}
          <GithubRepos session={session} />

          {/* Logout Section */}
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={async () => await supabase.auth.signOut()}
          >
            <Ionicons name="log-out-outline" size={22} color="#f87171" />
            <Text style={styles.logoutText}>Sign Out from GitHub</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.authContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.heroSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>CS</Text>
        </View>
        <Text style={styles.welcomeText}>Welcome to cshub</Text>
        <Text style={styles.subText}>
          Connect your GitHub account to explore repositories, manage your profile, and engage with the community.
        </Text>
      </View>

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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Auth Styles
  authContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'space-between', padding: 30, paddingVertical: 80 },
  heroSection: { alignItems: 'center' },
  logoCircle: { width: 90, height: 90, borderRadius: 30, backgroundColor: '#38bdf8', justifyContent: 'center', alignItems: 'center', marginBottom: 25, shadowColor: '#38bdf8', shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 },
  logoText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  welcomeText: { fontSize: 30, fontWeight: '800', color: '#f8fafc', marginBottom: 10 },
  subText: { fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 24 },
  loginBtn: { width: '100%', backgroundColor: '#1e293b', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  btnInner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // Profile Styles (Horizontal Layout to match your profileview)
  profileHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 40, 
    marginBottom: 35,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155'
  },
  avatarContainer: { position: 'relative', marginRight: 18 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#38bdf8' },
  onlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#22c55e', borderWidth: 3, borderColor: '#1e293b' },
  headerTextContainer: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: '#f8fafc' },
  email: { fontSize: 14, color: '#94a3b8', marginTop: 4 },

  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)'
  },
  logoutText: { color: '#f87171', fontSize: 15, fontWeight: '700', marginLeft: 10 }
});