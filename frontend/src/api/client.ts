const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; phone: string; password: string }) =>
      request<{ id: number; name: string; email: string; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ id: number; name: string; email: string; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },
  categories: {
    list: () => request<{ categories: Array<{ id: number; name: string; slug: string; icon: string | null; itemCount: number }> }>('/categories'),
  },
  items: {
    list: (params?: { categoryId?: number; search?: string; sort?: string; page?: number; pageSize?: number }) => {
      const sp = new URLSearchParams();
      if (params?.categoryId != null) sp.set('categoryId', String(params.categoryId));
      if (params?.search) sp.set('search', params.search);
      if (params?.sort) sp.set('sort', params.sort);
      if (params?.page) sp.set('page', String(params.page));
      if (params?.pageSize) sp.set('pageSize', String(params.pageSize));
      return request<Array<ItemSummary>>(`/items?${sp}`);
    },
    get: (id: number) => request<ItemDetail>(`/items/${id}`),
    create: (data: { name: string; description?: string; imageUrl?: string; categoryId: number }) =>
      request<ItemDetail>('/items', { method: 'POST', body: JSON.stringify(data) }),
  },
  reviews: {
    list: (itemId: number, params?: { sort?: string; page?: number; pageSize?: number }) => {
      const sp = new URLSearchParams({ itemId: String(itemId) });
      if (params?.sort) sp.set('sort', params.sort);
      if (params?.page) sp.set('page', String(params.page));
      if (params?.pageSize) sp.set('pageSize', String(params.pageSize));
      return request<Array<ReviewCard>>(`/reviews?${sp}`);
    },
    create: (data: { itemId: number; stars: number; content: string }) =>
      request<ReviewCard>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    reaction: (reviewId: number, isUp: boolean) =>
      request<{ thumbsUp: number; thumbsDown: number; removed: boolean }>('/reviews/reaction', { method: 'POST', body: JSON.stringify({ reviewId, isUp }) }),
  },
  comments: {
    list: (reviewId: number) => request<Array<Comment>>(`/comments/review/${reviewId}`),
    create: (reviewId: number, content: string) =>
      request<Comment>('/comments', { method: 'POST', body: JSON.stringify({ reviewId, content }) }),
  },
  notifications: {
    list: (unreadOnly?: boolean) =>
      request<Array<Notification>>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),
    markRead: (id: number) => request<void>(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request<void>('/notifications/read-all', { method: 'PUT' }),
  },
};

export interface ItemSummary {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categoryName: string;
  averageStars: number;
  reviewCount: number;
  mostPopularReviewSnippet: string | null;
  createdAt: string;
}

export interface ItemDetail {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categoryName: string;
  categoryId: number;
  averageStars: number;
  reviewCount: number;
  createdByUserName: string;
  createdAt: string;
}

export interface ReviewCard {
  id: number;
  itemId: number;
  userId: number;
  userName: string;
  stars: number;
  content: string;
  createdAt: string;
  thumbsUp: number;
  thumbsDown: number;
  commentCount: number;
  currentUserReaction: number | null;
}

export interface Comment {
  id: number;
  reviewId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: string;
  relatedReviewId: number | null;
  relatedItemId: number | null;
  fromUserName: string | null;
  isRead: boolean;
  createdAt: string;
}
