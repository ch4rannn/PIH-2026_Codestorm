const API_BASE = '/api';

export interface FeedPost {
    id: number;
    author_name: string;
    author_role: string;
    author_company: string;
    author_batch: string;
    type: 'achievement' | 'opportunity' | 'update' | 'article' | 'milestone';
    title: string;
    content: string;
    tags: string[];
    likes_count: number;
    comments_count: number;
    created_at: string;
}

export interface FeedResponse {
    posts: FeedPost[];
    stats: {
        total: number;
        achievements: number;
        opportunities: number;
        total_likes: number;
    };
}

export async function getFeed(filters: { type?: string; search?: string } = {}): Promise<FeedResponse> {
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'all') params.set('type', filters.type);
    if (filters.search) params.set('search', filters.search);
    const query = params.toString();
    const res = await fetch(`${API_BASE}/feed/${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error(`Failed to fetch feed: ${res.status}`);
    return res.json();
}

export async function createFeedPost(data: Partial<FeedPost>): Promise<{ id: number; success: boolean }> {
    const res = await fetch(`${API_BASE}/feed/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create post: ${res.status}`);
    return res.json();
}

export async function toggleLike(feedId: number, userIdentifier: string): Promise<{ liked: boolean }> {
    const res = await fetch(`${API_BASE}/feed/${feedId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_identifier: userIdentifier }),
    });
    if (!res.ok) throw new Error(`Failed to like: ${res.status}`);
    return res.json();
}
