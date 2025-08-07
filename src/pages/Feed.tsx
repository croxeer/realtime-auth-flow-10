import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CommunityAPI, CommunityPost } from '@/lib/api';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PostComposer } from '@/components/community/PostComposer';
import { PostCard } from '@/components/community/PostCard';
import { ScrollArea } from '@/components/ui/scroll-area';

const Feed = () => {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ['posts'], queryFn: () => CommunityAPI.listPosts() });
  const sorted = [...posts].sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime());

  return (
    <MobileLayout title="Feed">
      <div className="p-4 space-y-4">
        <PostComposer />
        {isLoading && <div className="text-sm text-muted-foreground">Carregando...</div>}
        {sorted.map((p: CommunityPost) => (
          <PostCard key={p.id} post={p} />
        ))}
        {sorted.length === 0 && !isLoading && (
          <div className="text-center text-sm text-muted-foreground py-8">Sem publicações ainda</div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Feed;