import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('uims_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('uims_token')
            localStorage.removeItem('uims_user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api

// Service stubs for API-ready integration
export const authService = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    register: (data: Record<string, unknown>) => api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
}

export const careerService = {
    getInternships: (params?: Record<string, unknown>) => api.get('/career/internships', { params }),
    getFreelanceGigs: () => api.get('/career/freelance'),
    getMicroTasks: () => api.get('/career/microtasks'),
    applyJob: (jobId: string) => api.post(`/career/apply/${jobId}`),
    saveJob: (jobId: string) => api.post(`/career/save/${jobId}`),
    getApplications: () => api.get('/career/applications'),
}

export const alumniService = {
    getDirectory: (params?: Record<string, unknown>) => api.get('/alumni/directory', { params }),
    requestMentorship: (alumniId: string) => api.post(`/alumni/mentorship/${alumniId}`),
    requestReferral: (alumniId: string) => api.post(`/alumni/referral/${alumniId}`),
    getMentorshipRequests: () => api.get('/alumni/mentorship-requests'),
}

export const studyService = {
    uploadPdf: (file: File) => { const fd = new FormData(); fd.append('file', file); return api.post('/study/upload', fd) },
    getFlashcards: (topicId: string) => api.get(`/study/flashcards/${topicId}`),
    getProgress: () => api.get('/study/progress'),
    getNotes: () => api.get('/study/notes'),
}

export const socialService = {
    getFeed: (params?: Record<string, unknown>) => api.get('/social/feed', { params }),
    createPost: (data: Record<string, unknown>) => api.post('/social/posts', data),
    likePost: (postId: string) => api.post(`/social/posts/${postId}/like`),
    commentPost: (postId: string, content: string) => api.post(`/social/posts/${postId}/comment`, { content }),
}

export const academicService = {
    getAttendance: () => api.get('/academic/attendance'),
    getResults: () => api.get('/academic/results'),
    submitAssignment: (data: FormData) => api.post('/academic/assignments', data),
    getFees: () => api.get('/academic/fees'),
    getNotices: () => api.get('/academic/notices'),
}

export const adminService = {
    getStudents: (params?: Record<string, unknown>) => api.get('/admin/students', { params }),
    getFaculty: (params?: Record<string, unknown>) => api.get('/admin/faculty', { params }),
    verifyContent: (id: string) => api.post(`/admin/verify/${id}`),
    getAnalytics: () => api.get('/admin/analytics'),
}
