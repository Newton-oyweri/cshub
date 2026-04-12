import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function AccountPage() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    console.log("--- APP MOUNT: Checking initial session ---");
    
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("GetSession Error:", error.message);
      console.log("Initial Session Found:", !!session);
      setSession(session);
      setInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("--- AUTH STATE CHANGE ---");
      console.log("Event Type:", event);
      console.log("Session Active:", !!currentSession);
      setSession(currentSession);
    });

    return () => {
      console.log("--- Unsubscribing Auth Listener ---");
      subscription.unsubscribe();
    };
  }, []);

  const handleGitHubLogin = async () => {
    console.log("--- START: GitHub Login Flow ---");
    setLoading(true);
    
    try {
      const redirectTo = AuthSession.makeRedirectUri({
        scheme: 'cshub',
      });
      console.log("Redirect URI generated:", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { 
          redirectTo, 
          skipBrowserRedirect: true 
        },
      });

      if (error) {
        console.error("Supabase OAuth Error:", error.message);
        throw error;
      }

      if (data?.url) {
        console.log("Opening WebBrowser with URL:", data.url);
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        
        console.log("WebBrowser closed. Result Type:", result.type);

        if (result.type === 'success' && result.url) {
          console.log("Success! Full Redirect URL received:", result.url);

          // Robust parsing
          const formattedUrl = result.url.replace('#', '?');
          const params = new URL(formattedUrl).searchParams;
          
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          console.log("Access Token extracted:", !!access_token);
          console.log("Refresh Token extracted:", !!refresh_token);

          if (access_token && refresh_token) {
            console.log("Attempting to set Supabase session...");
            const { error: sessionError } = await supabase.auth.setSession({ 
              access_token, 
              refresh_token 
            });

            if (sessionError) {
              console.error("setSession Error:", sessionError.message);
              throw sessionError;
            }
            console.log("setSession successful! onAuthStateChange should trigger now.");
          } else {
            console.warn("Tokens missing from URL. Check your Supabase Redirect settings.");
          }
        } else {
          console.log("Login cancelled or failed. Result:", result);
        }
      } else {
        console.error("No data.url returned from signInWithOAuth");
      }
    } catch (error: any) {
      console.error("CATCH: Login Exception:", error);
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
      console.log("--- END: GitHub Login Flow ---");
    }
  };

  const handleLogout = async () => {
    console.log("--- Logging Out ---");
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout Error:", error.message);
  };

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Checking Session...</Text>
      </View>
    );
  }

  if (session) {
    const userMeta = session.user?.user_metadata;
    console.log("Rendering UI for User:", session.user?.email);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image source={{ uri: userMeta?.avatar_url }} style={styles.avatar} />
          <Text style={styles.name}>{userMeta?.full_name || 'User'}</Text>
          <Text style={styles.email}>{session.user?.email}</Text>
          
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.authContainer}>
      <Text style={styles.logo}>cshub</Text>
      <TouchableOpacity 
        style={styles.loginBtn} 
        onPress={handleGitHubLogin} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>Continue with GitHub</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 30 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { fontSize: 42, fontWeight: '900', textAlign: 'center', marginBottom: 60 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20, backgroundColor: '#eee' },
  name: { fontSize: 24, fontWeight: '800' },
  email: { fontSize: 16, color: '#666', marginBottom: 40 },
  loginBtn: { backgroundColor: '#24292e', padding: 18, borderRadius: 12, alignItems: 'center' },
  loginText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  logoutBtn: { padding: 15 },
  logoutText: { color: '#ff4444', fontWeight: '600' }
});