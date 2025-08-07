import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/authz';

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return isAdminEmail(user?.email);
}