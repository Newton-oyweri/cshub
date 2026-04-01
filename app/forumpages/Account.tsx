import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    // 2. Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) return Alert.alert('Error', 'Enter email and password');
    setLoading(true);
    
    const { error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) Alert.alert('Auth Error', error.message);
    else if (type === 'signup') Alert.alert('Success', 'Check your email for confirmation!');
    
    setLoading(false);
  };

  if (session) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.loggedInText}>Logged in as:</Text>
        <Text style={styles.email}>{session.user.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Account</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#666" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#666" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.loginButton} onPress={() => handleAuth('login')} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => handleAuth('signup')} disabled={loading}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>Direct Supabase Query Mode</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 25, justifyContent: 'center', backgroundColor: '#000' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 40, textAlign: 'center' },
  input: { backgroundColor: '#111', color: '#fff', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#0dddf0' },
  loginButton: { backgroundColor: '#0dddf0', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  logoutButton: { backgroundColor: '#ff4444', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 40 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loggedInText: { textAlign: 'center', color: '#888', fontSize: 14 },
  email: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#0dddf0', marginTop: 5 },
  note: { textAlign: 'center', color: '#444', fontSize: 12, marginTop: 20 }
});