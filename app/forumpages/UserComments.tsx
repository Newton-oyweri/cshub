import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase'; // Adjust path to your supabase config

interface UserCommentsProps {
  postId: string;
}

export default function UserComments({ postId }: UserCommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          author:profiles!comments_user_fkey (
            name,
            profilepic_url,
            github_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        Alert.alert("Authentication Required", "Please log in to post a comment.");
        return;
      }

      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            user_id: session.user.id,
            content: commentText.trim(),
          },
        ]);

      if (error) throw error;

      setCommentText('');
      fetchComments(); // Refresh list
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format time (e.g., "2h")
  const formatTime = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#0DDDF0" />
        <Text style={styles.sectionTitle}>{comments.length}</Text>
      </View>

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor="#666"
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !commentText.trim() && { opacity: 0.5 }]} 
          onPress={handlePostComment}
          disabled={isSubmitting || !commentText.trim()}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#0DDDF0" />
          ) : (
            <Ionicons name="send" size={20} color="#0DDDF0" />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#0DDDF0" style={{ marginTop: 20 }} />
      ) : (
        comments.map((item) => (
          <View key={item.id} style={styles.commentCard}>
            <View style={styles.leftColumn}>
              <Image 
                source={item.author?.profilepic_url ? { uri: item.author.profilepic_url } : require('../../assets/images/logo.png')} 
                style={styles.avatar} 
              />
              <View style={styles.threadLine} />
            </View>

            <View style={styles.rightColumn}>
              <View style={styles.commentHeader}>
                <View>
                  <Text style={styles.userName}>{item.author?.name || 'Anonymous'}</Text>
                  <Text style={styles.userHandle}>
                    @{item.author?.github_url?.split('/').pop() || 'user'} • {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>

              <Text style={styles.commentText}>{item.content}</Text>
            </View>
          </View>
        ))
      )}

      {comments.length === 0 && !loading && (
        <Text style={styles.emptyText}>No comments yet. Start the conversation!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, width: '100%', paddingHorizontal: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  
  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F1C38',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(13, 221, 240, 0.2)',
  },
  input: { flex: 1, color: '#fff', fontSize: 14, maxHeight: 100, paddingRight: 10 },
  sendBtn: { padding: 5 },

  // List Styles
  commentCard: { flexDirection: 'row', marginBottom: 5 },
  leftColumn: { alignItems: 'center', marginRight: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1C3150' },
  threadLine: { flex: 1, width: 2, backgroundColor: '#1C3150', marginTop: 4, marginBottom: 4 },
  rightColumn: { flex: 1, paddingBottom: 15 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  userName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  userHandle: { color: '#666', fontSize: 11, marginTop: 1 },
  commentText: { color: '#ccc', fontSize: 14, lineHeight: 20 },
  emptyText: { color: '#555', textAlign: 'center', marginTop: 10, fontSize: 14 },
});