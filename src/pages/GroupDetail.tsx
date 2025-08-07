import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CommunityAPI, CommunityGroup, CommunityPost } from '@/lib/api';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PostComposer } from '@/components/community/PostComposer';
import { PostCard } from '@/components/community/PostCard';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: () => CommunityAPI.listGroups() });
  const { data: posts = [] } = useQuery({ queryKey: ['posts'], queryFn: () => CommunityAPI.listPosts() });

  const group = groups.find((g) => g.id === id);
  const groupPosts = posts.filter((p) => p.groupId === id).sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime());

  return (
    <MobileLayout title={group?.name || 'Grupo'}>
      <div className="p-4 space-y-4">
        {group?.description && (
          <div className="text-sm text-muted-foreground">{group.description}</div>
        )}
        <PostComposer groupId={id} />
        {groupPosts.map((p: CommunityPost) => (
          <PostCard key={p.id} post={p} />
        ))}
        {groupPosts.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">Seja o primeiro a publicar</div>
        )}
      </div>
    </MobileLayout>
  );
};

export default GroupDetail;