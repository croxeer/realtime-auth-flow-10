import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle } from 'lucide-react';
import { CommunityComment, CommunityPost } from '@/lib/api';

export const PostCard = ({ post, onOpenComments }: { post: CommunityPost; onOpenComments?: (post: CommunityPost) => void }) => {
  const time = post.createdAt ? new Date(post.createdAt).toLocaleString() : '';
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-2">
        <div className="text-sm text-muted-foreground">{time}</div>
        <div className="text-sm font-medium">{post.userName}</div>
        <div className="text-base whitespace-pre-wrap break-words">{post.content}</div>
        {post.imageUrl && (
          <img src={post.imageUrl} alt="post" className="rounded-lg w-full object-cover" />
        )}
        <div className="flex gap-6 pt-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" /> {post.likeCount ?? 0}
          </div>
          <button className="flex items-center gap-1" onClick={() => onOpenComments?.(post)}>
            <MessageCircle className="h-4 w-4" /> {post.commentCount ?? 0}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};