import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CommunityAPI, CommunityPost } from '@/lib/api';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PostComposer } from '@/components/community/PostComposer';
import { PostCard } from '@/components/community/PostCard';
import { CommentsSheet } from '@/components/community/CommentsSheet';

const Feed = () => {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ['posts'], queryFn: () => CommunityAPI.listPosts() });
  const sorted = [...posts].sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime());
  const [openComments, setOpenComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  const openFor = (post: CommunityPost) => {
    setSelectedPost(post);
    setOpenComments(true);
  };

  return (
    <MobileLayout title="Feed">
      <div className="p-4 space-y-4 pb-20">
        <PostComposer />
        {isLoading && <div className="text-sm text-muted-foreground">Carregando...</div>}
        {sorted.map((p: CommunityPost) => (
          <PostCard key={p.id} post={p} onOpenComments={openFor} />
        ))}
        {sorted.length === 0 && !isLoading && (
          <div className="text-center text-sm text-muted-foreground py-8">Sem publicações ainda</div>
        )}
      </div>
      <CommentsSheet post={selectedPost} open={openComments} onOpenChange={setOpenComments} />
    </MobileLayout>
  );
};

export default Feed;