import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CommunityAPI, Friendship } from '@/lib/api';

export type FriendshipStatus = 'none' | 'pending_incoming' | 'pending_outgoing' | 'friends';

export function useFriendship(targetUserId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: friendships = [] } = useQuery({ queryKey: ['friendships'], queryFn: () => CommunityAPI.listFriendships() });

  const status: FriendshipStatus = (() => {
    if (!user || !targetUserId) return 'none';
    const f = friendships.find((fr: Friendship) =>
      (fr.requesterId === user.id && fr.addresseeId === targetUserId) ||
      (fr.addresseeId === user.id && fr.requesterId === targetUserId)
    );
    if (!f) return 'none';
    if (f.status === 'accepted') return 'friends';
    if (f.requesterId === user.id) return 'pending_outgoing';
    return 'pending_incoming';
  })();

  const currentFriendship: Friendship | undefined = friendships.find((fr: Friendship) =>
    (fr.requesterId === user?.id && fr.addresseeId === targetUserId) ||
    (fr.addresseeId === user?.id && fr.requesterId === targetUserId)
  );

  const sendRequest = async () => {
    if (!user || !targetUserId) return;
    await CommunityAPI.sendFriendRequest(user.id, targetUserId);
    await queryClient.invalidateQueries({ queryKey: ['friendships'] });
  };

  const accept = async () => {
    if (!currentFriendship) return;
    await CommunityAPI.acceptFriendRequest(currentFriendship.id);
    await queryClient.invalidateQueries({ queryKey: ['friendships'] });
  };

  const cancel = async () => {
    if (!currentFriendship) return;
    await CommunityAPI.cancelFriendship(currentFriendship.id);
    await queryClient.invalidateQueries({ queryKey: ['friendships'] });
  };

  const unfriend = cancel;

  return { status, currentFriendship, sendRequest, accept, cancel, unfriend };
}