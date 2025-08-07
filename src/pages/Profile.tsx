import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityAPI, UserProfile } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useFriendship } from '@/hooks/use-friendship';

const Profile = () => {
  const { id: routeId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const userId = routeId === 'me' ? user?.id : routeId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profiles', userId],
    queryFn: async () => (userId ? await CommunityAPI.getProfile(userId) : null),
    enabled: Boolean(userId),
  });

  const { status, sendRequest, accept, cancel, unfriend } = useFriendship(userId);

  const { data: friendships = [] } = useQuery({ queryKey: ['friendships'], queryFn: () => CommunityAPI.listFriendships() });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => CommunityAPI.listUsers() });
  const friendsOfUser = useMemo(() => friendships.filter((f: any) => f.status === 'accepted' && (f.requesterId === userId || f.addresseeId === userId)), [friendships, userId]);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName || users.find((u: any) => u.id === userId)?.name || '');
    setBio(profile?.bio || '');
    setAvatarUrl(profile?.avatarUrl || '');
  }, [profile, users, userId]);

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

  const goToMessages = () => {
    if (!userId) return;
    navigate(`/messages/${userId}`);
  };

  const isMe = user?.id === userId;

  return (
    <MobileLayout title="Perfil">
      <div className="p-4 space-y-4 pb-20">
        {isLoading && <div className="text-sm text-muted-foreground">Carregando...</div>}
        <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-2">
          <div className="flex items-center gap-3">
            <img src={avatarUrl || 'https://avatars.githubusercontent.com/u/0?v=4'} alt="avatar" className="h-14 w-14 rounded-full object-cover" />
            <div>
              <div className="text-lg font-semibold">{displayName || 'Usuário'}</div>
              {!isMe && (
                <div className="flex gap-2 mt-2">
                  {status === 'none' && <Button size="sm" onClick={sendRequest}>Adicionar amigo</Button>}
                  {status === 'pending_outgoing' && <Button size="sm" variant="secondary" onClick={cancel}>Cancelar solicitação</Button>}
                  {status === 'pending_incoming' && <Button size="sm" onClick={accept}>Aceitar</Button>}
                  {status === 'friends' && <Button size="sm" variant="secondary" onClick={unfriend}>Remover amigo</Button>}
                  <Button size="sm" onClick={goToMessages}>Enviar mensagem</Button>
                </div>
              )}
            </div>
          </div>

          {isMe && (
            <div className="space-y-2 pt-2">
              <Input placeholder="Nome de exibição" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <Input placeholder="URL do avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
              <Textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
              <div className="flex justify-end"><Button size="sm" onClick={save} disabled={saving}>Salvar</Button></div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-3">
          <div className="font-semibold mb-2">Amigos</div>
          <div className="space-y-2">
            {friendsOfUser.map((f: any) => {
              const friendId = f.requesterId === userId ? f.addresseeId : f.requesterId;
              const friend = users.find((u: any) => u.id === friendId);
              return (
                <div key={f.id} className="flex items-center justify-between">
                  <div className="text-sm">{friend?.name || friendId}</div>
                  {!isMe && user?.id === friendId ? null : <Button size="sm" variant="ghost" onClick={() => navigate(`/profile/${friendId}`)}>Ver perfil</Button>}
                </div>
              );
            })}
            {friendsOfUser.length === 0 && <div className="text-sm text-muted-foreground text-center">Sem amigos</div>}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;