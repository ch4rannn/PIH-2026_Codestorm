import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Plus, Edit3, Trash2, Users, UserCheck, Shield, BarChart3, CheckCircle2, XCircle, Eye } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Mock Students
const mockStudents = [
    { id: '1', name: 'Rahul Kumar', email: 'rahul@uni.edu', roll: 'CS21042', dept: 'CSE', sem: 6, cgpa: 9.1, status: 'active' },
    { id: '2', name: 'Sana Ahmed', email: 'sana@uni.edu', roll: 'CS21018', dept: 'CSE', sem: 6, cgpa: 8.7, status: 'active' },
    { id: '3', name: 'Kunal Shah', email: 'kunal@uni.edu', roll: 'IT21035', dept: 'IT', sem: 6, cgpa: 8.3, status: 'active' },
    { id: '4', name: 'Priti Jain', email: 'priti@uni.edu', roll: 'CS21056', dept: 'CSE', sem: 4, cgpa: 9.4, status: 'active' },
    { id: '5', name: 'Arjun Reddy', email: 'arjun@uni.edu', roll: 'EC21012', dept: 'ECE', sem: 6, cgpa: 7.8, status: 'inactive' },
]

// Mock Faculty
const mockFaculty = [
    { id: '1', name: 'Dr. Priya Sharma', email: 'priya@uni.edu', dept: 'CSE', designation: 'Professor', courses: 3, status: 'active' },
    { id: '2', name: 'Dr. Rajesh Kumar', email: 'rajesh@uni.edu', dept: 'CSE', designation: 'Associate Prof', courses: 2, status: 'active' },
    { id: '3', name: 'Dr. Meera Singh', email: 'meera@uni.edu', dept: 'IT', designation: 'Assistant Prof', courses: 4, status: 'active' },
]

// Pending Verification
const pendingVerifications = [
    { id: '1', type: 'Internship', title: 'ML Intern at AI Corp', submittedBy: 'Placement Cell', date: '2026-02-27' },
    { id: '2', type: 'Alumni', title: 'Vikash Patel - TCS', submittedBy: 'Alumni Cell', date: '2026-02-26' },
    { id: '3', type: 'Post', title: 'Guest Lecture Announcement', submittedBy: 'Dr. Rajesh Kumar', date: '2026-02-25' },
    { id: '4', type: 'Internship', title: 'Web Dev at StartupXYZ', submittedBy: 'Career Hub', date: '2026-02-24' },
]

const analyticsData = [
    { month: 'Sep', students: 320, engagement: 78 }, { month: 'Oct', students: 345, engagement: 82 },
    { month: 'Nov', students: 360, engagement: 85 }, { month: 'Dec', students: 340, engagement: 79 },
    { month: 'Jan', students: 380, engagement: 88 }, { month: 'Feb', students: 395, engagement: 91 },
]

const deptDistribution = [
    { name: 'CSE', value: 450, color: '#3b82f6' },
    { name: 'IT', value: 320, color: '#10b981' },
    { name: 'ECE', value: 280, color: '#f59e0b' },
    { name: 'ME', value: 200, color: '#8b5cf6' },
    { name: 'CE', value: 150, color: '#ef4444' },
]

export default function AdminPanel() {
    const [studentSearch, setStudentSearch] = useState('')
    const [facultySearch, setFacultySearch] = useState('')

    const filteredStudents = mockStudents.filter(s =>
        !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.roll.toLowerCase().includes(studentSearch.toLowerCase())
    )
    const filteredFaculty = mockFaculty.filter(f =>
        !facultySearch || f.name.toLowerCase().includes(facultySearch.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-muted-foreground text-sm">System administration & management</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Students', value: '1,400', icon: Users, color: 'text-blue-500' },
                    { label: 'Total Faculty', value: '85', icon: UserCheck, color: 'text-green-500' },
                    { label: 'Pending Verify', value: pendingVerifications.length, icon: Shield, color: 'text-yellow-500' },
                    { label: 'Active Users', value: '1,280', icon: BarChart3, color: 'text-purple-500' },
                ].map(s => (
                    <Card key={s.label}><CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                            <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                        </div>
                    </CardContent></Card>
                ))}
            </div>

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
                                    <Input placeholder="Search..." className="pl-9 h-9 w-48" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                                </div>
                                <Button size="sm"><Plus className="w-3 h-3 mr-1" />Add</Button>
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
                                                    <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{s.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                                    <div><p className="text-sm font-medium">{s.name}</p><p className="text-[10px] text-muted-foreground">{s.email}</p></div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-sm">{s.roll}</td>
                                            <td className="p-3 text-sm">{s.dept}</td>
                                            <td className="p-3 text-sm">{s.sem}</td>
                                            <td className="p-3 text-sm font-medium">{s.cgpa}</td>
                                            <td className="p-3"><Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{s.status}</Badge></td>
                                            <td className="p-3">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="w-3 h-3" /></Button>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit3 className="w-3 h-3" /></Button>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}</tbody>
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
                                    <Input placeholder="Search..." className="pl-9 h-9 w-48" value={facultySearch} onChange={e => setFacultySearch(e.target.value)} />
                                </div>
                                <Button size="sm"><Plus className="w-3 h-3 mr-1" />Add</Button>
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
                                                    <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{f.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                                    <div><p className="text-sm font-medium">{f.name}</p><p className="text-[10px] text-muted-foreground">{f.email}</p></div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-sm">{f.dept}</td>
                                            <td className="p-3 text-sm">{f.designation}</td>
                                            <td className="p-3 text-sm">{f.courses}</td>
                                            <td className="p-3"><Badge variant="default" className="text-[10px]">{f.status}</Badge></td>
                                            <td className="p-3">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit3 className="w-3 h-3" /></Button>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* VERIFY CONTENT TAB */}
                <TabsContent value="verify">
                    <div className="space-y-3">
                        {pendingVerifications.map(v => (
                            <Card key={v.id}>
                                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                                        <Shield className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px]">{v.type}</Badge>
                                            <span className="text-xs text-muted-foreground">{v.date}</span>
                                        </div>
                                        <p className="font-medium text-sm mt-1">{v.title}</p>
                                        <p className="text-xs text-muted-foreground">Submitted by: {v.submittedBy}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Approve</Button>
                                        <Button size="sm" variant="outline" className="text-destructive"><XCircle className="w-3 h-3 mr-1" />Reject</Button>
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
                                    <BarChart data={analyticsData}>
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
                                            <Pie data={deptDistribution} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                                                {deptDistribution.map(e => <Cell key={e.name} fill={e.color} />)}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex-1 space-y-2">
                                        {deptDistribution.map(d => (
                                            <div key={d.name} className="flex items-center gap-2">
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
        </div>
    )
}
