import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';

const SKYLA_ORANGE = '#FE9A0F';
const SKYLA_CYAN = '#0DDDF0';

export default function UserActivity({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'projects' | 'forum'>('projects');
  const queryClient = useQueryClient();

  // 1. Fetch User Projects
  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['user-projects', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // 2. Fetch User Forum Posts
  const { data: forumPosts, isLoading: loadingForum } = useQuery({
    queryKey: ['user-forum', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forumposts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = (id: string, table: 'posts' | 'forumposts') => {
    Alert.alert(
      "Delete Post",
      "Are you sure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) {
              Alert.alert("Error", error.message);
            } else {
              // Refresh the specific query cache
              queryClient.invalidateQueries({ queryKey: [table === 'posts' ? 'user-projects' : 'user-forum', userId] });
              // Also refresh global feeds
              queryClient.invalidateQueries({ queryKey: ['posts'] });
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.activityCard}>
      <View style={styles.cardContent}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.thumbnail} />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.itemDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
          {activeTab === 'forum' && item.category && (
            <View style={styles.tagRow}>
              {item.category.slice(0, 2).map((cat: string) => (
                <Text key={cat} style={styles.tagText}>#{cat}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => handleDelete(item.id, activeTab === 'projects' ? 'posts' : 'forumposts')}
      >
        <Ionicons name="trash-outline" size={20} color="#f87171" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'projects' && styles.activeTab]} 
          onPress={() => setActiveTab('projects')}
        >
          <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'forum' && styles.activeTab]} 
          onPress={() => setActiveTab('forum')}
        >
          <Text style={[styles.tabText, activeTab === 'forum' && styles.activeTabText]}>Forum</Text>
        </TouchableOpacity>
      </View>

      {(loadingProjects || loadingForum) ? (
        <ActivityIndicator color={SKYLA_CYAN} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={activeTab === 'projects' ? projects : forumPosts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Since it's inside AccountPage ScrollView
          ListEmptyComponent={<Text style={styles.emptyText}>Nothing posted yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  tabBar: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#1e293b', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#334155' },
  tabText: { color: '#94a3b8', fontWeight: '600' },
  activeTabText: { color: SKYLA_CYAN },
  activityCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1e293b', 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  thumbnail: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  textContainer: { flex: 1 },
  itemTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  itemDate: { color: '#64748b', fontSize: 12, marginTop: 2 },
  tagRow: { flexDirection: 'row', marginTop: 4, gap: 6 },
  tagText: { color: SKYLA_ORANGE, fontSize: 11, fontWeight: 'bold' },
  deleteBtn: { padding: 8, marginLeft: 10 },
  emptyText: { color: '#475569', textAlign: 'center', marginTop: 20, fontSize: 14 }
});