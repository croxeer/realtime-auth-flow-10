import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CommunityAPI, CommunityComment, CommunityPost } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export const CommentsSheet = ({ post, open, onOpenChange }: { post: CommunityPost | null; open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', post?.id],
    queryFn: async () => {
      const all = await CommunityAPI.listComments();
      return all.filter((c) => c.postId === post?.id).sort((a, b) => new Date(a.createdAt ?? '').getTime() - new Date(b.createdAt ?? '').getTime());
    },
    enabled: Boolean(post?.id),
  });

  const submit = async () => {
    if (!user || !post || !content.trim()) return;
    await CommunityAPI.createComment({ content: content.trim(), postId: post.id, userId: user.id, userName: user.name, createdAt: new Date().toISOString() });
    setContent('');
    await queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Comentários</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-3">
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {comments.map((c: CommunityComment) => (
              <div key={c.id} className="rounded-lg border border-border/50 bg-card/50 p-2">
                <div className="text-xs text-muted-foreground">{c.userName}</div>
                <div className="text-sm whitespace-pre-wrap">{c.content}</div>
              </div>
            ))}
            {comments.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Sem comentários</div>}
          </div>
          <div className="flex gap-2 pt-1">
            <Input placeholder="Escreva um comentário..." value={content} onChange={(e) => setContent(e.target.value)} />
            <Button onClick={submit} disabled={!content.trim()}>Enviar</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};