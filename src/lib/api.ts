export const API_BASE = 'https://skillzeer-realtime.hf.space';

export type ApiCollectionName = 'users' | 'groups' | 'posts' | 'comments' | 'profiles' | 'memberships' | 'likes';

export interface ApiListResponse<T> {
  collection?: string;
  count?: number;
  data?: T[];
}

export async function apiGet<T>(collection: ApiCollectionName): Promise<T[]> {
  const res = await fetch(`${API_BASE}/api/${collection}`);
  if (!res.ok) return [];
  const json: ApiListResponse<T> | T[] = await res.json();
  // Handle both list formats
  if (Array.isArray(json)) return json;
  return json.data ?? [];
}

export async function apiGetById<T>(collection: ApiCollectionName, id: string): Promise<T | null> {
  try {
    const items = await apiGet<T>(collection);
    // Backend may not support direct GET by id; filter locally
    // @ts-expect-error generic id access
    return items.find((it: any) => it.id === id) ?? null;
  } catch {
    return null;
  }
}

export async function apiCreate<T>(collection: ApiCollectionName, body: Record<string, any>): Promise<T | null> {
  const res = await fetch(`${API_BASE}/api/${collection}` ,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      ...body,
      createdAt: new Date().toISOString(),
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function apiUpdate<T>(collection: ApiCollectionName, id: string, body: Record<string, any>): Promise<T | null> {
  // Some backends may not support PUT/PATCH; attempt POST to collection with id field as fallback
  try {
    const res = await fetch(`${API_BASE}/api/${collection}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...body,
        updatedAt: new Date().toISOString(),
      }),
    });
    if (res.ok) return res.json();
  } catch {}

  // Fallback: create a new record with same id (if backend uses upsert semantics)
  const created = await apiCreate<T>(collection, { id, ...body });
  return created;
}

export async function apiDelete(collection: ApiCollectionName, id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/${collection}/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export interface CommunityGroup {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt?: string;
  coverUrl?: string;
}

export interface CommunityPost {
  id: string;
  content: string;
  imageUrl?: string;
  userId: string;
  userName: string;
  groupId?: string;
  createdAt?: string;
  likeCount?: number;
  commentCount?: number;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string; // same as auth user id
  bio?: string;
  avatarUrl?: string;
  displayName?: string; // defaults to auth name
  createdAt?: string;
}

export interface GroupMembership {
  id: string;
  groupId: string;
  userId: string;
  createdAt?: string;
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt?: string;
}

export const CommunityAPI = {
  async listGroups() {
    return apiGet<CommunityGroup>('groups');
  },
  async createGroup(input: Omit<CommunityGroup, 'id'>) {
    return apiCreate<CommunityGroup>('groups', input);
  },
  async listPosts() {
    return apiGet<CommunityPost>('posts');
  },
  async createPost(input: Omit<CommunityPost, 'id'>) {
    return apiCreate<CommunityPost>('posts', input);
  },
  async listComments() {
    return apiGet<CommunityComment>('comments');
  },
  async createComment(input: Omit<CommunityComment, 'id'>) {
    return apiCreate<CommunityComment>('comments', input);
  },
  async getProfile(userId: string) {
    return apiGetById<UserProfile>('profiles', userId);
  },
  async upsertProfile(userId: string, input: Omit<UserProfile, 'id'>) {
    return apiUpdate<UserProfile>('profiles', userId, { id: userId, ...input });
  },
  async listMemberships() {
    return apiGet<GroupMembership>('memberships');
  },
  async joinGroup(groupId: string, userId: string) {
    return apiCreate<GroupMembership>('memberships', { groupId, userId });
  },
  async leaveGroup(membershipId: string) {
    return apiDelete('memberships', membershipId);
  },
  async listLikes() {
    return apiGet<PostLike>('likes');
  },
  async likePost(postId: string, userId: string) {
    return apiCreate<PostLike>('likes', { postId, userId });
  },
  async unlikePost(likeId: string) {
    return apiDelete('likes', likeId);
  },
  async deletePost(id: string) {
    return apiDelete('posts', id);
  },
  async deleteGroup(id: string) {
    return apiDelete('groups', id);
  },
  async deleteUser(id: string) {
    return apiDelete('users', id);
  },
};