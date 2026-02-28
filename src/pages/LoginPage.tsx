import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, type UserRole } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'

const roles: { value: UserRole; label: string; desc: string }[] = [
    { value: 'student', label: '🎓 Student', desc: 'Access academics, career hub & study tools' },
    { value: 'faculty', label: '👨‍🏫 Faculty', desc: 'Manage classes, attendance & posts' },
    { value: 'admin', label: '🛡️ Admin', desc: 'Full system control & analytics' },
    { value: 'alumni', label: '🤝 Alumni', desc: 'Mentorship & referral network' },
]

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<UserRole>('student')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) { setError('Please fill in all fields'); return }
        setLoading(true); setError('')
        try {
            await login(email, password, role)
            navigate('/dashboard')
        } catch {
            setError('Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left side - decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/5 to-background items-center justify-center p-12">
                <div className="max-w-md space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h2 className="text-3xl font-bold">Welcome to UIMS 2.0</h2>
                    <p className="text-muted-foreground text-lg">Your comprehensive university management ecosystem. Access academics, career opportunities, study tools, and connect with alumni — all in one place.</p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {['📚 Smart Study', '💼 Career Hub', '🤝 Alumni Network', '📊 Analytics'].map(item => (
                            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 rounded-lg p-3 border">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side - login form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-xl">UIMS 2.0</span>
                        </Link>
                        <h1 className="text-2xl font-bold">Sign in to your account</h1>
                        <p className="text-muted-foreground mt-2">Select your role and enter credentials</p>
                    </div>

                    {/* Role selector */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {roles.map(r => (
                            <button
                                key={r.value}
                                onClick={() => setRole(r.value)}
                                className={`p-3 rounded-lg border text-left transition-all ${role === r.value
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                        : 'border-border hover:border-primary/30 hover:bg-accent/50'
                                    }`}
                            >
                                <div className="text-sm font-medium">{r.label}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</div>
                            </button>
                        ))}
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Password</label>
                                    <div className="relative">
                                        <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" /> Signing in...</span>
                                    ) : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                                </Button>
                            </form>
                            <p className="text-center text-xs text-muted-foreground mt-4">
                                Demo: Use any email & password to login with selected role
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
