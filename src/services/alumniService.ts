const API_BASE = '/api';

export interface AlumniData {
    id: number;
    name: string;
    email?: string;
    role: string;
    company: string;
    batch: string;
    department: string;
    location: string;
    experience: string;
    industry: string;
    skills: string[];
    available: boolean;
    linkedin: string;
    avatar?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AlumniListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: AlumniData[];
    filter_options: {
        batches: string[];
        departments: string[];
        companies: string[];
        industries: string[];
    };
    stats: {
        total: number;
        available_mentors: number;
        companies_count: number;
        industries_count: number;
    };
}

export interface AlumniFilters {
    search?: string;
    batch?: string;
    department?: string;
    company?: string;
    industry?: string;
    available?: boolean;
}

export async function getAlumni(filters: AlumniFilters = {}): Promise<AlumniListResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.batch) params.set('batch', filters.batch);
    if (filters.department) params.set('department', filters.department);
    if (filters.company) params.set('company', filters.company);
    if (filters.industry) params.set('industry', filters.industry);
    if (filters.available !== undefined) params.set('available', String(filters.available));

    const query = params.toString();
    const res = await fetch(`${API_BASE}/alumni/${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error(`Failed to fetch alumni: ${res.status}`);
    return res.json();
}

export async function getAlumniById(id: number): Promise<AlumniData> {
    const res = await fetch(`${API_BASE}/alumni/${id}/`);
    if (!res.ok) throw new Error(`Failed to fetch alumni: ${res.status}`);
    return res.json();
}

export async function createAlumni(data: Partial<AlumniData>): Promise<AlumniData> {
    const res = await fetch(`${API_BASE}/alumni/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create alumni: ${res.status}`);
    return res.json();
}

export async function updateAlumni(id: number, data: Partial<AlumniData>): Promise<AlumniData> {
    const res = await fetch(`${API_BASE}/alumni/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update alumni: ${res.status}`);
    return res.json();
}

export async function deleteAlumni(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/alumni/${id}/`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete alumni: ${res.status}`);
}
