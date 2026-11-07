import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import ProfileImage from '@/components/ui/ProfileImage';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import { usePostActions } from '@/hooks/post/usePostActions';
import { Post } from '@/types/postTypes';

export default function PostCard({ post }: { post: Post }) {
  const [commentText, setCommentText] = useState('');
  const accentColor = useThemeColor({}, 'accent');
  const actions = usePostActions(post.id);
  const comments = actions.comments.data ?? [];
  const author = post.user;

  const submitComment = () => {
    if (!commentText.trim()) return;
    actions.comment.mutate(commentText.trim());
    setCommentText('');
  };

  return (
    <TView color="primary" style={styles.card}>
      <View style={styles.author}>
        <View style={styles.avatar}><ProfileImage imagePath={author?.profileImage} /></View>
        <View style={{ flex: 1 }}>
          <TText style={styles.name}>{author ? `${author.fname} ${author.lname ?? ''}`.trim() : 'Traveler'}</TText>
          {author?.username ? <TText style={styles.username}>@{author.username}</TText> : null}
        </View>
      </View>
      {post.text ? <TText style={styles.text}>{post.text}</TText> : null}
      {post.itineraryId ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="View attached itinerary"
          onPress={() => router.push(`/itinerary/${post.itineraryId}`)}
          style={styles.itineraryAttachment}
        >
          <TIcon name="map-marker-path" size={19} color={accentColor} />
          <TText style={styles.itineraryText}>View attached itinerary</TText>
          <TIcon name="chevron-right" size={18} color={accentColor} />
        </TouchableOpacity>
      ) : null}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => actions.like.mutate()} style={styles.action}>
          <TIcon name={actions.isLiked ? 'heart' : 'heart-outline'} size={19} color={accentColor} />
          <TText>{actions.likeCount}</TText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <TIcon name="comment-outline" size={19} color={accentColor} />
          <TText>{actions.reaction.data?.commentCount ?? comments.length}</TText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => actions.repost.mutate()}
          disabled={actions.isReposted || actions.repost.isPending}
          style={[styles.action, (actions.isReposted || actions.repost.isPending) && styles.disabledAction]}
        >
          <TIcon name="repeat" size={19} color={accentColor} />
          <TText>{actions.repostCount}</TText>
        </TouchableOpacity>
      </View>
      <View style={styles.comments}>
          {comments.map((comment) => <TText key={comment.id} style={styles.comment}><TText style={{ fontWeight: '700' }}>{comment.user?.username ?? 'User'}: </TText>{comment.text}</TText>)}
          <View style={styles.commentInput}>
            <TextInput value={commentText} onChangeText={setCommentText} placeholder="Write a comment..." style={{ flex: 1 }} />
            <TouchableOpacity onPress={submitComment}><TIcon name="send" size={19} color={accentColor} /></TouchableOpacity>
          </View>
      </View>
    </TView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 14, marginBottom: 10 },
  author: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden' },
  name: { fontWeight: '700' },
  username: { fontSize: 11, opacity: 0.65 },
  text: { marginTop: 12, lineHeight: 20 },
  itineraryAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  itineraryText: { flex: 1, fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 22, marginTop: 14 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  disabledAction: { opacity: 0.55 },
  comments: { marginTop: 12, gap: 8 },
  comment: { fontSize: 12 },
  commentInput: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
});
