import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CommunityAPI, CommunityPost, GroupMembership } from '@/lib/api';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PostComposer } from '@/components/community/PostComposer';
import { PostCard } from '@/components/community/PostCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CommentsSheet } from '@/components/community/CommentsSheet';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: () => CommunityAPI.listGroups() });
  const { data: posts = [] } = useQuery({ queryKey: ['posts'], queryFn: () => CommunityAPI.listPosts() });
  const { data: memberships = [] } = useQuery({ queryKey: ['memberships'], queryFn: () => CommunityAPI.listMemberships() });

  const group = groups.find((g) => g.id === id);
  const groupPosts = posts.filter((p) => p.groupId === id).sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime());
  const groupMemberships = memberships.filter((m: GroupMembership) => m.groupId === id);
  const myMembership = groupMemberships.find((m: GroupMembership) => m.userId === user?.id);

  const toggleMembership = async () => {
    if (!id || !user) return;
    if (myMembership) {
      await CommunityAPI.leaveGroup(myMembership.id);
    } else {
      await CommunityAPI.joinGroup(id, user.id);
    }
    await queryClient.invalidateQueries({ queryKey: ['memberships'] });
  };

  const [openComments, setOpenComments] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState<CommunityPost | null>(null);
  const openFor = (post: CommunityPost) => { setSelectedPost(post); setOpenComments(true); };

  return (
    <MobileLayout title={group?.name || 'Grupo'}>
      <div className="p-4 space-y-4 pb-20">
        {group?.description && (
          <div className="text-sm text-muted-foreground">{group.description}</div>
        )}
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={toggleMembership} variant={myMembership ? 'secondary' : 'default'}>
            {myMembership ? 'Sair do grupo' : 'Participar do grupo'}
          </Button>
          <div className="text-sm text-muted-foreground">Membros: {groupMemberships.length}</div>
        </div>
        <PostComposer groupId={id} />
        {groupPosts.map((p: CommunityPost) => (
          <PostCard key={p.id} post={p} onOpenComments={openFor} />
        ))}
        {groupPosts.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">Seja o primeiro a publicar</div>
        )}
      </div>
      <CommentsSheet post={selectedPost} open={openComments} onOpenChange={setOpenComments} />
    </MobileLayout>
  );
};

export default GroupDetail;