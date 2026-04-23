import { StyleSheet, Text, View, Platform, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

const SKYLA_DARK = '#0F1C38';
const SKYLA_CYAN = '#00B8D9';

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, currentSession: any) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleProfilePress = () => {
    router.push('/forumpages/Account');
  };

  return (
    <View style={styles.headerContainer}>
      <StatusBar style="light" backgroundColor={SKYLA_DARK} />

      {/* Logo */}
      <Text style={styles.headerText}>
        cs<Text style={{ color: SKYLA_CYAN }}>hub</Text>
      </Text>

      {/* Right Side - Profile / Account */}
      <View style={styles.rightSection}>
        {!loading && session ? (
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            {session.user?.user_metadata?.avatar_url ? (
              <Image
                source={{ uri: session.user.user_metadata.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={22} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.push('/forumpages/Account')}>
            <Ionicons name="person-outline" size={26} color="#AAA" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: SKYLA_DARK,
    paddingTop: Constants.statusBarHeight,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    height: 56 + Constants.statusBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.8,
    textTransform: 'lowercase',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-condensed',
      },
    }),
  },
  rightSection: {
    justifyContent: 'center',
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: SKYLA_CYAN,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E2A4A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: SKYLA_CYAN,
  },
});