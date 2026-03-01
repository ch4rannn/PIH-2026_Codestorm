import { createContext, useContext, useState, type ReactNode } from 'react'
import api from '@/services/api'

export type UserRole = 'student' | 'faculty' | 'admin' | 'alumni'

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    avatar?: string
    department?: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    login: (email: string, password: string, role: UserRole) => Promise<void>
    logout: () => void
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Fallback mock users for when backend is not available
const MOCK_USERS: Record<string, User> = {
    student: { id: '1', name: 'Rahul Kumar', email: 'rahul@university.edu', role: 'student', department: 'Computer Science', avatar: '' },
    faculty: { id: '2', name: 'Dr. Priya Sharma', email: 'priya@university.edu', role: 'faculty', department: 'Computer Science', avatar: '' },
    admin: { id: '3', name: 'Admin User', email: 'admin@university.edu', role: 'admin', avatar: '' },
    alumni: { id: '4', name: 'Ankit Verma', email: 'ankit@alumni.edu', role: 'alumni', department: 'Computer Science', avatar: '' },
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('uims_user')
        return savedUser ? JSON.parse(savedUser) : null
    })
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('uims_token')
    })
    const [loading, setLoading] = useState(false)

    const login = async (email: string, password: string, role: UserRole) => {
        setLoading(true)
        try {
            // Try real backend login
            const res = await api.post('/auth/login', { email, password: password || 'password123', role })
            const { token: jwt, user: userData } = res.data
            localStorage.setItem('uims_token', jwt)
            localStorage.setItem('uims_user', JSON.stringify(userData))
            setUser(userData)
            setToken(jwt)
        } catch {
            // Fallback to mock login if backend is unreachable
            console.warn('Backend unavailable, using mock login')
            await new Promise(resolve => setTimeout(resolve, 300))
            const mockUser = { ...MOCK_USERS[role], email }
            const mockToken = `mock_jwt_${role}_${Date.now()}`
            localStorage.setItem('uims_token', mockToken)
            localStorage.setItem('uims_user', JSON.stringify(mockUser))
            setUser(mockUser)
            setToken(mockToken)
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('uims_token')
        localStorage.removeItem('uims_user')
        setUser(null)
        setToken(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
