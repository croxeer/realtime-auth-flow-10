import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityAPI, UserProfile } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const { id: routeId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const userId = routeId === 'me' ? user?.id : routeId;
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profiles', userId],
    queryFn: async () => (userId ? await CommunityAPI.getProfile(userId) : null),
    enabled: Boolean(userId),
  });

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName || user?.name || '');
    setBio(profile?.bio || '');
    setAvatarUrl(profile?.avatarUrl || '');
  }, [profile, user?.name]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await CommunityAPI.upsertProfile(userId, { displayName, bio, avatarUrl });
      await queryClient.invalidateQueries({ queryKey: ['profiles', userId] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout title="Perfil">
      <div className="p-4 space-y-4">
        {isLoading && <div className="text-sm text-muted-foreground">Carregando...</div>}
        <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-2">
          <Input placeholder="Nome de exibição" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input placeholder="URL do avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          <Textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <div className="flex justify-end"><Button size="sm" onClick={save} disabled={saving}>Salvar</Button></div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;