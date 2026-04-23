import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions
} from 'react-native';
import { supabase } from '../../lib/supabase';

// Recursive Comment Component for "Looped" Discussions
const DiscussionThread = ({ item, onReply, isReplyMode, onCancelReply, replyText, setReplyText, onSubmitReply }: { 
  item: any, 
  onReply: (id: string, name: string) => void,
  isReplyMode: boolean,
  onCancelReply: () => void,
  replyText: string,
  setReplyText: (text: string) => void,
  onSubmitReply: (parentId: string) => void
}) => (
  <View style={styles.threadedWrapper}>
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.commentUserRow}>
          {item.profiles?.profilepic_url ? (
            <Image source={{ uri: item.profiles.profilepic_url }} style={styles.commentAvatar} />
          ) : (
            <View style={styles.avatarPlaceholder}><MaterialCommunityIcons name="account" size={12} color="#0DDDF0" /></View>
          )}
          <Text style={styles.commentUser}>{item.profiles?.name || 'Anonymous'}</Text>
        </View>
        <Text style={styles.commentTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
      
      {/* Reply Trigger */}
      <TouchableOpacity onPress={() => onReply(item.id, item.profiles?.name || 'Anonymous')}>
        <Text style={styles.replyBtn}>Reply</Text>
      </TouchableOpacity>
    </View>

    {/* Inline Reply Input for this specific comment */}
    {isReplyMode && (
      <View style={styles.inlineReplyContainer}>
        <View style={styles.replyBanner}>
          <Text style={styles.replyText}>Replying to {item.profiles?.name || 'Anonymous'}</Text>
          <TouchableOpacity onPress={onCancelReply}><Ionicons name="close-circle" size={18} color="#AAA" /></TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write a reply..."
            placeholderTextColor="#666"
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity onPress={() => onSubmitReply(item.id)} style={styles.sendButton}>
            <Ionicons name="send" size={22} color="#FFA500" />
          </TouchableOpacity>
        </View>
      </View>
    )}

    {/* Recursive Render for Nested Replies */}
    {item.replies && item.replies.map((reply: any) => (
      <View key={reply.id} style={styles.replyBranch}>
        <DiscussionThread 
          item={reply} 
          onReply={onReply}
          isReplyMode={false}
          onCancelReply={() => {}}
          replyText=""
          setReplyText={() => {}}
          onSubmitReply={() => {}}
        />
      </View>
    ))}
  </View>
);

export default function SingleForumPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{id: string, name: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState('');

  useEffect(() => { fetchDiscussions(); }, [params.id]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forumdiscussions')
        .select(`*, profiles(name, profilepic_url)`)
        .eq('post_id', params.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Organize into threads (Parent-Child)
      const threadMap: any = {};
      const roots: any[] = [];
      data.forEach(item => {
        item.replies = [];
        threadMap[item.id] = item;
        if (item.parent_id) {
          threadMap[item.parent_id]?.replies.push(item);
        } else {
          roots.push(item);
        }
      });
      setDiscussions(roots);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleNewDiscussion = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('forumdiscussions').insert([{
      post_id: params.id,
      user_id: user?.id,
      comment: newComment.trim(),
      parent_id: null
    }]);

    if (!error) {
      setNewComment('');
      fetchDiscussions();
    }
    setIsSubmitting(false);
  };

  const handleReply = async (parentId: string) => {
    if (!replyComment.trim()) return;
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('forumdiscussions').insert([{
      post_id: params.id,
      user_id: user?.id,
      comment: replyComment.trim(),
      parent_id: parentId
    }]);

    if (!error) {
      setReplyComment('');
      setActiveReplyId(null);
      setReplyingTo(null);
      fetchDiscussions();
    }
    setIsSubmitting(false);
  };

  const handleReplyClick = (id: string, name: string) => {
    setActiveReplyId(id);
    setReplyingTo({ id, name });
  };

  const cancelReply = () => {
    setActiveReplyId(null);
    setReplyingTo(null);
    setReplyComment('');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.gradient}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0DDDF0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{params.title}</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainCard}>
            <Text style={styles.titleText}>{params.title}</Text>
            <Text style={styles.contentText}>{params.content}</Text>
          </View>

          {/* New Discussion Input - Beside the Discussion Header */}
          <View style={styles.discussionHeaderContainer}>
            <View style={styles.discussionHeader}>
              <MaterialCommunityIcons name="chat-processing-outline" size={20} color="#FFA500" />
              <Text style={styles.discussionTitle}>DISCUSSIONS ({discussions.length})</Text>
            </View>
            
            {/* Input for new discussion */}
            <View style={styles.newDiscussionContainer}>
              <TextInput
                style={styles.newDiscussionInput}
                placeholder="Start a new discussion..."
                placeholderTextColor="#666"
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity onPress={handleNewDiscussion} style={styles.postButton}>
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? <ActivityIndicator color="#0DDDF0" /> : discussions.map(item => (
            <DiscussionThread 
              key={item.id} 
              item={item} 
              onReply={handleReplyClick}
              isReplyMode={activeReplyId === item.id}
              onCancelReply={cancelReply}
              replyText={replyComment}
              setReplyText={setReplyComment}
              onSubmitReply={handleReply}
            />
          ))}
          
          {/* Extra bottom padding for smooth scrolling */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  gradient: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingHorizontal: 20, 
    paddingBottom: 15,
    backgroundColor: 'rgba(15, 15, 26, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', flex: 1 },
  scrollContent: { 
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  mainCard: { 
    backgroundColor: 'rgba(34, 34, 46, 0.6)', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  titleText: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 15 },
  contentText: { color: '#DDD', fontSize: 16, lineHeight: 24 },
  
  // Discussion Header with input beside
  discussionHeaderContainer: { 
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 12,
  },
  discussionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  discussionTitle: { 
    color: '#FFA500', 
    fontWeight: 'bold', 
    marginLeft: 10, 
    fontSize: 14 
  },
  newDiscussionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  newDiscussionInput: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 14,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  postButton: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    color: '#1A1A2E',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Threading Styles
  threadedWrapper: { width: '100%', marginBottom: 8 },
  commentCard: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  replyBranch: { marginLeft: 20, borderLeftWidth: 1, borderLeftColor: '#333', paddingLeft: 10 },
  replyBtn: { color: '#0DDDF0', fontSize: 12, marginTop: 5, fontWeight: '600' },
  
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  commentUserRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentAvatar: { width: 20, height: 20, borderRadius: 10 },
  avatarPlaceholder: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#1E2A4A', justifyContent: 'center', alignItems: 'center' },
  commentUser: { color: '#0DDDF0', fontWeight: '600', fontSize: 12 },
  commentTime: { color: '#666', fontSize: 9 },
  commentText: { color: '#BBB', fontSize: 14, lineHeight: 20 },
  
  // Inline reply styles
  inlineReplyContainer: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 10,
  },
  replyBanner: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8, 
    backgroundColor: '#0F0F1A', 
    padding: 8, 
    borderRadius: 8 
  },
  replyText: { color: '#AAA', fontSize: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { 
    flex: 1, 
    backgroundColor: '#0F0F1A', 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sendButton: { 
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 40,
  }
});