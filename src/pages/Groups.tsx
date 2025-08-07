import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CommunityAPI, CommunityGroup } from '@/lib/api';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { GroupCard } from '@/components/community/GroupCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Groups = () => {
  const { user } = useAuth();
  const { data: groups = [], isLoading } = useQuery({ queryKey: ['groups'], queryFn: () => CommunityAPI.listGroups() });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const create = async () => {
    if (!user || !name.trim()) return;
    setIsCreating(true);
    try {
      await CommunityAPI.createGroup({ name: name.trim(), description, ownerId: user.id, createdAt: new Date().toISOString() });
      setName('');
      setDescription('');
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <MobileLayout title="Grupos">
      <div className="p-4 space-y-4">
        <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-2">
          <Input placeholder="Nome do grupo" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex justify-end">
            <Button size="sm" onClick={create} disabled={!name.trim() || isCreating}>Criar grupo</Button>
          </div>
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">Carregando...</div>}
        <div className="grid grid-cols-1 gap-3">
          {groups.map((g: CommunityGroup) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
        {groups.length === 0 && !isLoading && (
          <div className="text-center text-sm text-muted-foreground py-8">Sem grupos ainda</div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Groups;