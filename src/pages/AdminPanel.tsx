import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CommunityAPI } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/layout/MobileLayout';

const ListRow = ({ title, subtitle, onDelete }: { title: string; subtitle?: string; onDelete?: () => void }) => (
  <Card className="border-border/50">
    <CardContent className="p-3 flex items-center justify-between gap-3">
      <div>
        <div className="font-medium text-sm">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {onDelete && <Button variant="destructive" size="sm" onClick={onDelete}>Excluir</Button>}
    </CardContent>
  </Card>
);

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => CommunityAPI.apiGet?.('users') as any });
  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: () => CommunityAPI.listGroups() });
  const { data: posts = [] } = useQuery({ queryKey: ['posts'], queryFn: () => CommunityAPI.listPosts() });

  const deleteUser = async (id: string) => { await CommunityAPI.deleteUser(id); await queryClient.invalidateQueries({ queryKey: ['users'] }); };
  const deleteGroup = async (id: string) => { await CommunityAPI.deleteGroup(id); await queryClient.invalidateQueries({ queryKey: ['groups'] }); };
  const deletePost = async (id: string) => { await CommunityAPI.deletePost(id); await queryClient.invalidateQueries({ queryKey: ['posts'] }); };

  return (
    <MobileLayout title="Admin">
      <div className="p-4 pb-20">
        <Tabs defaultValue="users">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="space-y-2 pt-3">
            {users.map((u: any) => (
              <ListRow key={u.id} title={`${u.name} (${u.email})`} onDelete={() => deleteUser(u.id)} />
            ))}
            {users.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Sem usuários</div>}
          </TabsContent>
          <TabsContent value="groups" className="space-y-2 pt-3">
            {groups.map((g: any) => (
              <ListRow key={g.id} title={g.name} subtitle={g.description} onDelete={() => deleteGroup(g.id)} />
            ))}
            {groups.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Sem grupos</div>}
          </TabsContent>
          <TabsContent value="posts" className="space-y-2 pt-3">
            {posts.map((p: any) => (
              <ListRow key={p.id} title={p.userName} subtitle={p.content} onDelete={() => deletePost(p.id)} />
            ))}
            {posts.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Sem posts</div>}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default AdminPanel;