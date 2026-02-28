import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

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

const MOCK_USERS: Record<string, User> = {
    student: { id: '1', name: 'Rahul Kumar', email: 'rahul@university.edu', role: 'student', department: 'Computer Science', avatar: '' },
    faculty: { id: '2', name: 'Dr. Priya Sharma', email: 'priya@university.edu', role: 'faculty', department: 'Computer Science', avatar: '' },
    admin: { id: '3', name: 'Admin User', email: 'admin@university.edu', role: 'admin', avatar: '' },
    alumni: { id: '4', name: 'Ankit Verma', email: 'ankit@alumni.edu', role: 'alumni', department: 'Computer Science', avatar: '' },
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const savedToken = localStorage.getItem('uims_token')
        const savedUser = localStorage.getItem('uims_user')
        if (savedToken && savedUser) {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    const login = async (email: string, _password: string, role: UserRole) => {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))
        const mockUser = { ...MOCK_USERS[role], email }
        const mockToken = `mock_jwt_${role}_${Date.now()}`
        localStorage.setItem('uims_token', mockToken)
        localStorage.setItem('uims_user', JSON.stringify(mockUser))
        setUser(mockUser)
        setToken(mockToken)
        setLoading(false)
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

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
