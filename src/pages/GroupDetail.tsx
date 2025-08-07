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
import { Input } from '@/components/ui/input';

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

  const [editing, setEditing] = React.useState(false);
  const [groupName, setGroupName] = React.useState(group?.name || '');
  const [groupDesc, setGroupDesc] = React.useState(group?.description || '');
  const isOwner = user?.id && group?.ownerId === user.id;

  React.useEffect(() => {
    setGroupName(group?.name || '');
    setGroupDesc(group?.description || '');
  }, [group?.id]);

  const saveGroup = async () => {
    if (!group?.id) return;
    await CommunityAPI.editGroup(group.id, { name: groupName, description: groupDesc });
    await queryClient.invalidateQueries({ queryKey: ['groups'] });
    setEditing(false);
  };

  const { data: usersList = [] } = useQuery({ queryKey: ['users'], queryFn: () => CommunityAPI.listUsers() });
  const members = groupMemberships.map((m) => usersList.find((u: any) => u.id === m.userId) || { id: m.userId, name: m.userId });

  const pinToggle = async (postId: string, pinned: boolean) => {
    await CommunityAPI.updatePost(postId, { pinned: !pinned });
    await queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

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
          {isOwner && !editing && <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Editar</Button>}
        </div>
        {isOwner && editing && (
          <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-2">
            <Input placeholder="Nome do grupo" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            <Input placeholder="Descrição" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button size="sm" onClick={saveGroup}>Salvar</Button>
            </div>
          </div>
        )}
        <div className="rounded-xl border border-border/50 bg-card/50 p-3">
          <div className="font-semibold mb-2">Membros</div>
          <div className="space-y-1">
            {members.map((m: any) => (
              <div key={m.id} className="text-sm">{m.name || m.id}</div>
            ))}
            {members.length === 0 && <div className="text-sm text-muted-foreground">Sem membros</div>}
          </div>
        </div>
        <PostComposer groupId={id} />
        {groupPosts.map((p: CommunityPost) => (
          <div key={p.id} className="space-y-2">
            <PostCard post={p} onOpenComments={openFor} />
            {isOwner && (
              <div className="flex justify-end -mt-2">
                <Button size="xs" variant="ghost" onClick={() => pinToggle(p.id, (p as any).pinned)}> { (p as any).pinned ? 'Desafixar' : 'Fixar' } </Button>
              </div>
            )}
          </div>
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