import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle } from 'lucide-react';
import { CommunityPost } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CommunityAPI, PostLike } from '@/lib/api';

export const PostCard = ({ post, onOpenComments }: { post: CommunityPost; onOpenComments?: (post: CommunityPost) => void }) => {
  const time = post.createdAt ? new Date(post.createdAt).toLocaleString() : '';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: likes = [] } = useQuery({ queryKey: ['likes', post.id], queryFn: async () => (await CommunityAPI.listLikes()).filter(l => l.postId === post.id) });
  const myLike = likes.find((l: PostLike) => l.userId === user?.id);

  const toggleLike = async () => {
    if (!user) return;
    if (myLike) {
      await CommunityAPI.unlikePost(myLike.id);
    } else {
      await CommunityAPI.likePost(post.id, user.id);
    }
    await queryClient.invalidateQueries({ queryKey: ['likes', post.id] });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4 space-y-2">
        <div className="text-sm text-muted-foreground">{time}</div>
        <div className="text-sm font-medium">{post.userName}</div>
        <div className="text-base whitespace-pre-wrap break-words">{post.content}</div>
        {post.imageUrl && (
          <img src={post.imageUrl} alt="post" className="rounded-lg w-full object-cover" />
        )}
        <div className="flex gap-6 pt-1 text-sm text-muted-foreground">
          <button className={`flex items-center gap-1 ${myLike ? 'text-primary' : ''}`} onClick={toggleLike}>
            <Heart className="h-4 w-4" /> {likes.length}
          </button>
          <button className="flex items-center gap-1" onClick={() => onOpenComments?.(post)}>
            <MessageCircle className="h-4 w-4" /> Comentários
          </button>
        </div>
      </CardContent>
    </Card>
  );
};