import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

let supabaseClient: any = null;

// Create the real client only when running in the browser
const createRealClient = () => {
  if (supabaseClient) return supabaseClient;

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return supabaseClient;
};

// This is the magic part — safe for SSR and static export
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (typeof window === 'undefined') {
      // Return mock functions during server rendering
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: async () => ({}),
          getUser: async () => ({ data: { user: null } }),
          signInWithPassword: async () => ({}),
          // add more if you use them
        };
      }
      if (prop === 'from') {
        return () => ({
          select: () => Promise.resolve({ data: [], error: null }),
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => Promise.resolve({ data: null, error: null }),
          delete: () => Promise.resolve({ data: null, error: null }),
        });
      }
      return () => Promise.resolve({ data: null, error: null });
    }

    // On client → return real supabase
    const client = createRealClient();
    return client[prop];
  },
});