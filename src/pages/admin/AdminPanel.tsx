import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Plus, Edit3, Trash2, Users, UserCheck, Shield, BarChart3, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '@/services/api'

// Interfaces
interface User {
    id: string; name: string; email: string; role: string; department: string; avatar: string;
    roll?: string; sem?: number; cgpa?: number;
    designation?: string; courses?: number; status: string;
}

interface Verification {
    id: string; type: string; title: string; submittedBy: string; date: string; status: string;
}

interface AnalyticsStats {
    totalStudents: number; totalFaculty: number; pendingVerifications: number; activeUsers: number;
}

export default function AdminPanel() {
    const [students, setStudents] = useState<User[]>([])
    const [faculty, setFaculty] = useState<User[]>([])
    const [verifications, setVerifications] = useState<Verification[]>([])
    const [stats, setStats] = useState<AnalyticsStats | null>(null)
    const [deptDist, setDeptDist] = useState<{ name: string; value: number; color: string }[]>([])
    const [trendData, setTrendData] = useState<{ month: string; students: number; engagement: number }[]>([])

    const [loading, setLoading] = useState(true)
    const [studentSearch, setStudentSearch] = useState('')
    const [facultySearch, setFacultySearch] = useState('')

    // Action states
    const [deleting, setDeleting] = useState<string | null>(null)
    const [verifying, setVerifying] = useState<string | null>(null)

    // Modal state
    const [showUserModal, setShowUserModal] = useState(false)
    const [userForm, setUserForm] = useState({ id: '', name: '', email: '', role: 'student', department: '' })

    const loadData = useCallback(async () => {
        try {
            const [stuRes, facRes, verRes, statsRes] = await Promise.all([
                api.get('/admin/users', { params: { role: 'student' } }),
                api.get('/admin/users', { params: { role: 'faculty' } }),
                api.get('/admin/verifications'),
                api.get('/admin/analytics')
            ])
            setStudents(stuRes.data)
            setFaculty(facRes.data)
            setVerifications(verRes.data)
            setStats(statsRes.data.stats)
            setDeptDist(statsRes.data.deptDistribution)
            setTrendData(statsRes.data.trendData)
        } catch (err) {
            console.error('Failed to load admin data:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const handleDeleteUser = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return
        setDeleting(id)
        try {
            await api.delete(`/admin/users/${id}`)
            await loadData()
        } catch {
            alert('Failed to delete user')
        } finally {
            setDeleting(null)
        }
    }

    const handleVerify = async (id: string, action: 'approve' | 'reject') => {
        setVerifying(id)
        try {
            await api.post(`/admin/verifications/${id}/${action}`)
            await loadData()
        } catch {
            alert(`Failed to ${action} verification`)
        } finally {
            setVerifying(null)
        }
    }

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (userForm.id) {
                await api.put(`/admin/users/${userForm.id}`, userForm)
            } else {
                await api.post('/admin/users', { ...userForm, password: 'password123' })
            }
            setShowUserModal(false)
            await loadData()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } }; message?: string }
            alert('Error saving user: ' + (error.response?.data?.error || error.message || 'Unknown error'))
        }
    }

    const filteredStudents = students.filter(s =>
        !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase()) || (s.roll && s.roll.toLowerCase().includes(studentSearch.toLowerCase()))
    )
    const filteredFaculty = faculty.filter(f =>
        !facultySearch || f.name.toLowerCase().includes(facultySearch.toLowerCase())
    )

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

    return (
        <div className="space-y-6 relative">
            <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-muted-foreground text-sm">System administration & management</p>
            </div>

            {/* Quick Stats */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-500' },
                        { label: 'Total Faculty', value: stats.totalFaculty, icon: UserCheck, color: 'text-green-500' },
                        { label: 'Pending Verify', value: stats.pendingVerifications, icon: Shield, color: 'text-yellow-500' },
                        { label: 'Active Users', value: stats.activeUsers, icon: BarChart3, color: 'text-purple-500' },
                    ].map(s => (
                        <Card key={s.label}><CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                                <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                            </div>
                        </CardContent></Card>
                    ))}
                </div>
            )}

            <Tabs defaultValue="students">
                <TabsList className="w-full sm:w-auto flex overflow-x-auto">
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="faculty">Faculty</TabsTrigger>
                    <TabsTrigger value="verify">Verify Content</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* STUDENTS TAB */}
                <TabsContent value="students">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between pb-4">
                            <CardTitle className="text-base">Manage Students</CardTitle>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input placeholder="Search students..." className="pl-9 h-9 w-48" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                                </div>
                                <Button size="sm" onClick={() => { setUserForm({ id: '', name: '', email: '', role: 'student', department: '' }); setShowUserModal(true) }}><Plus className="w-3 h-3 mr-1" />Add</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead><tr className="border-b text-left">
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Student</th>
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Roll</th>
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Dept</th>
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Sem</th>
                                        <th className="p-3 text-xs font-medium text-muted-foreground">CGPA</th>
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Status</th>
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Actions</th>
                                    </tr></thead>
                                    <tbody>{filteredStudents.map(s => (
                                        <tr key={s.id} className="border-b last:border-0 hover:bg-accent/50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{s.name.charAt(0)}</AvatarFallback></Avatar>
                                                    <div><p className="text-sm font-medium">{s.name}</p><p className="text-[10px] text-muted-foreground">{s.email}</p></div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-sm">{s.roll || '-'}</td>
                                            <td className="p-3 text-sm">{s.department || '-'}</td>
                                            <td className="p-3 text-sm">{s.sem || '-'}</td>
                                            <td className="p-3 text-sm font-medium">{s.cgpa || '-'}</td>
                                            <td className="p-3"><Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{s.status}</Badge></td>
                                            <td className="p-3">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setUserForm(s); setShowUserModal(true) }}><Edit3 className="w-3 h-3" /></Button>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteUser(s.id, s.name)} disabled={deleting === s.id}>
                                                        {deleting === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                        {filteredStudents.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground text-sm">No students found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FACULTY TAB */}
                <TabsContent value="faculty">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between pb-4">
                            <CardTitle className="text-base">Manage Faculty</CardTitle>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input placeholder="Search faculty..." className="pl-9 h-9 w-48" value={facultySearch} onChange={e => setFacultySearch(e.target.value)} />
                                </div>
                                <Button size="sm" onClick={() => { setUserForm({ id: '', name: '', email: '', role: 'faculty', department: '' }); setShowUserModal(true) }}><Plus className="w-3 h-3 mr-1" />Add</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead><tr className="border-b text-left">
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Faculty</th>
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Dept</th>
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Designation</th>
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Courses</th>
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Status</th>
                                        <th className="p-3 text-xs font-medium text-muted-foreground">Actions</th>
                                    </tr></thead>
                                    <tbody>{filteredFaculty.map(f => (
                                        <tr key={f.id} className="border-b last:border-0 hover:bg-accent/50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{f.name.charAt(0)}</AvatarFallback></Avatar>
                                                    <div><p className="text-sm font-medium">{f.name}</p><p className="text-[10px] text-muted-foreground">{f.email}</p></div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-sm">{f.department || '-'}</td>
                                            <td className="p-3 text-sm">{f.designation || '-'}</td>
                                            <td className="p-3 text-sm">{f.courses || '-'}</td>
                                            <td className="p-3"><Badge variant="default" className="text-[10px]">{f.status || 'active'}</Badge></td>
                                            <td className="p-3">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setUserForm(f); setShowUserModal(true) }}><Edit3 className="w-3 h-3" /></Button>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteUser(f.id, f.name)} disabled={deleting === f.id}>
                                                        {deleting === f.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                        {filteredFaculty.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground text-sm">No faculty found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* VERIFY CONTENT TAB */}
                <TabsContent value="verify">
                    <div className="space-y-3">
                        {verifications.length === 0 ? (
                            <Card><CardContent className="p-8 text-center text-muted-foreground">No pending verifications. All caught up!</CardContent></Card>
                        ) : verifications.map(v => (
                            <Card key={v.id}>
                                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                                        <Shield className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px]">{v.type}</Badge>
                                            <span className="text-xs text-muted-foreground">{new Date(v.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="font-medium text-sm mt-1">{v.title}</p>
                                        <p className="text-xs text-muted-foreground">Submitted by: {v.submittedBy}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button size="sm" onClick={() => handleVerify(v.id, 'approve')} disabled={verifying !== null} className="bg-green-600 hover:bg-green-700">
                                            {verifying === v.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                                            Approve
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleVerify(v.id, 'reject')} disabled={verifying !== null} className="text-destructive">
                                            {verifying === v.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />}
                                            Reject
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ANALYTICS TAB */}
                <TabsContent value="analytics">
                    <div className="grid lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Student Engagement Trend</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                        <Bar dataKey="students" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} name="Active Students" />
                                        <Bar dataKey="engagement" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Engagement %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-base">Department Distribution</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <ResponsiveContainer width={160} height={160}>
                                        <PieChart>
                                            <Pie data={deptDist} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                                                {deptDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex-1 space-y-2">
                                        {deptDist.map((d, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                                                <span className="text-sm flex-1">{d.name}</span>
                                                <span className="text-sm font-medium">{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* USER FORM MODAL */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>{userForm.id ? 'Edit User' : 'Add New User'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveUser} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input required type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Role</label>
                                        <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                            <option value="student">Student</option>
                                            <option value="faculty">Faculty</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Department</label>
                                        <Input value={userForm.department} onChange={e => setUserForm({ ...userForm, department: e.target.value })} />
                                    </div>
                                </div>
                                {!userForm.id && <p className="text-xs text-muted-foreground pt-2">Default password is 'password123'</p>}
                                <div className="flex gap-3 justify-end pt-4">
                                    <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>Cancel</Button>
                                    <Button type="submit">Save User</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
