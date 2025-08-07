import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CommunityAPI, DirectMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: dms = [] } = useQuery({ queryKey: ['direct_messages'], queryFn: () => CommunityAPI.listDirectMessages() });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => CommunityAPI.listUsers() });

  const conversations = useMemo(() => {
    if (!user) return [] as { otherId: string; last?: DirectMessage }[];
    const myDms = (dms as DirectMessage[]).filter(dm => dm.senderId === user.id || dm.recipientId === user.id);
    const byOther = new Map<string, DirectMessage>();
    for (const dm of myDms) {
      const otherId = dm.senderId === user.id ? dm.recipientId : dm.senderId;
      const prev = byOther.get(otherId);
      if (!prev || new Date(dm.createdAt ?? '').getTime() > new Date(prev.createdAt ?? '').getTime()) {
        byOther.set(otherId, dm);
      }
    }
    return Array.from(byOther.entries()).map(([otherId, last]) => ({ otherId, last })).sort((a, b) => new Date(b.last?.createdAt ?? '').getTime() - new Date(a.last?.createdAt ?? '').getTime());
  }, [dms, user]);

  return (
    <MobileLayout title="Mensagens">
      <div className="p-4 space-y-2 pb-20">
        {conversations.map((c) => {
          const other = users.find((u: any) => u.id === c.otherId);
          return (
            <Card key={c.otherId} className="border-border/50">
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-sm">{other?.name || c.otherId}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{c.last?.content}</div>
                </div>
                <Button size="sm" onClick={() => navigate(`/messages/${c.otherId}`)}>Abrir</Button>
              </CardContent>
            </Card>
          );
        })}
        {conversations.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Sem conversas</div>}
      </div>
    </MobileLayout>
  );
};

export default Messages;