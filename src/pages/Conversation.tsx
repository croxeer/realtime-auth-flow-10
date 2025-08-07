import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CommunityAPI, DirectMessage } from '@/lib/api';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Conversation = () => {
  const { id: otherId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const { data: dms = [] } = useQuery({ queryKey: ['direct_messages'], queryFn: () => CommunityAPI.listDirectMessages() });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => CommunityAPI.listUsers() });

  const other = users.find((u: any) => u.id === otherId);
  const messages = useMemo(() => (dms as DirectMessage[])
    .filter(dm => (dm.senderId === user?.id && dm.recipientId === otherId) || (dm.senderId === otherId && dm.recipientId === user?.id))
    .sort((a, b) => new Date(a.createdAt ?? '').getTime() - new Date(b.createdAt ?? '').getTime())
  , [dms, user?.id, otherId]);

  const send = async () => {
    if (!user || !otherId || !content.trim()) return;
    await CommunityAPI.sendDirectMessage(user.id, user.name, otherId, content.trim());
    setContent('');
    await queryClient.invalidateQueries({ queryKey: ['direct_messages'] });
  };

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  return (
    <MobileLayout title={other?.name || 'Conversa'}>
      <div className="flex flex-col h-[calc(100vh-56px-56px)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[70%] rounded-2xl px-3 py-2 ${m.senderId === user?.id ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto bg-muted'}`}>
              <div className="text-xs text-muted-foreground">{new Date(m.createdAt ?? '').toLocaleTimeString()}</div>
              <div className="text-sm whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
          {messages.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Sem mensagens</div>}
          <div ref={endRef} />
        </div>
        <div className="border-t border-border/50 bg-card/50 p-3 flex gap-2">
          <Input placeholder="Mensagem..." value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
          <Button onClick={send} disabled={!content.trim()}>Enviar</Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Conversation;