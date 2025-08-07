import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityAPI } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export const PostComposer = ({ groupId }: { groupId?: string }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const submit = async () => {
    if (!user || !content.trim()) return;
    setIsLoading(true);
    try {
      await CommunityAPI.createPost({
        content: content.trim(),
        userId: user.id,
        userName: user.name,
        groupId,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
      });
      setContent('');
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3">
      <Textarea
        placeholder="Compartilhe algo com a comunidade..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[80px] resize-y"
      />
      <div className="flex justify-end pt-2">
        <Button size="sm" onClick={submit} disabled={!content.trim() || isLoading}>Publicar</Button>
      </div>
    </div>
  );
};