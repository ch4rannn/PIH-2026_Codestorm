import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    BookOpen, Briefcase, Trophy, Users, TrendingUp, Calendar,
    Star, Target, Clock, Award, Zap
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts'

const attendanceData = [
    { subject: 'DSA', present: 42, total: 48, pct: 87.5 },
    { subject: 'OS', present: 38, total: 45, pct: 84.4 },
    { subject: 'DBMS', present: 44, total: 46, pct: 95.7 },
    { subject: 'CN', present: 36, total: 44, pct: 81.8 },
    { subject: 'SE', present: 40, total: 42, pct: 95.2 },
]

const performanceData = [
    { sem: 'Sem 1', gpa: 8.2 },
    { sem: 'Sem 2', gpa: 8.5 },
    { sem: 'Sem 3', gpa: 8.8 },
    { sem: 'Sem 4', gpa: 9.1 },
    { sem: 'Sem 5', gpa: 9.0 },
    { sem: 'Sem 6', gpa: 9.3 },
]

const engagementData = [
    { name: 'Academic', value: 40, color: '#3b82f6' },
    { name: 'Career', value: 25, color: '#10b981' },
    { name: 'Social', value: 20, color: '#f59e0b' },
    { name: 'Study', value: 15, color: '#8b5cf6' },
]

const recommendedInternships = [
    { title: 'Frontend Developer Intern', company: 'TechCorp', stipend: '₹25,000/mo', type: 'Remote' },
    { title: 'Data Analyst Intern', company: 'DataViz Inc', stipend: '₹20,000/mo', type: 'Hybrid' },
    { title: 'UX Research Intern', company: 'DesignLab', stipend: '₹18,000/mo', type: 'On-site' },
]

const upcomingEvents = [
    { title: 'Hackathon 2026', date: 'Mar 15', type: 'Competition' },
    { title: 'AI Workshop', date: 'Mar 20', type: 'Workshop' },
    { title: 'Career Fair', date: 'Apr 5', type: 'Career' },
]

export default function StudentDashboard() {
    const { user } = useAuth()
    const role = user?.role || 'student'

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                        <p className="text-muted-foreground mt-1">
                            {role === 'admin' ? 'Here\'s your admin overview' :
                                role === 'faculty' ? 'Here\'s your faculty dashboard' :
                                    role === 'alumni' ? 'Manage mentorship & connections' :
                                        'Here\'s your academic overview for today'}
                        </p>
                    </div>
                    <Badge variant="outline" className="text-sm">{user?.department || 'Dashboard'}</Badge>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'CGPA', value: '9.1', icon: Trophy, trend: '+0.2', color: 'text-yellow-500' },
                    { label: 'Attendance', value: '88.9%', icon: Target, trend: '+1.2%', color: 'text-green-500' },
                    { label: 'Assignments', value: '12/14', icon: BookOpen, trend: '2 pending', color: 'text-blue-500' },
                    { label: 'Career Score', value: '78', icon: TrendingUp, trend: '+5 pts', color: 'text-purple-500' },
                ].map((stat) => (
                    <Card key={stat.label} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                <span className="text-xs text-green-500 font-medium">{stat.trend}</span>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Performance Trend */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Academic Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="sem" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                <YAxis domain={[7, 10]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="gpa" stroke="hsl(221.2, 83.2%, 53.3%)" fill="url(#gpaGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Engagement Breakdown */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Engagement Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width={140} height={140}>
                                <PieChart>
                                    <Pie data={engagementData} cx="50%" cy="50%" outerRadius={60} innerRadius={35} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                                        {engagementData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-3">
                                {engagementData.map(item => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                                        <span className="text-sm flex-1">{item.name}</span>
                                        <span className="text-sm font-medium">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance + Profile */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Attendance */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Subject-wise Attendance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {attendanceData.map(sub => (
                            <div key={sub.subject} className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{sub.subject}</span>
                                    <span className={sub.pct >= 85 ? 'text-green-500' : sub.pct >= 75 ? 'text-yellow-500' : 'text-red-500'}>
                                        {sub.present}/{sub.total} ({sub.pct}%)
                                    </span>
                                </div>
                                <Progress value={sub.pct} className="h-2" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Profile */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">My Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center py-2">
                            <Avatar className="h-16 w-16 mx-auto mb-3">
                                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                    {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <p className="font-semibold">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">{user?.department}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Semester</span><span>6th</span></div>
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Roll No</span><span>CS21042</span></div>
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Section</span><span>A</span></div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Interests</p>
                            <div className="flex flex-wrap gap-1.5">
                                {['🏏 Cricket', '💻 Coding', '🎮 Gaming', '📸 Photo'].map(t => (
                                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recommended Internships */}
                <Card>
                    <CardHeader className="pb-2 flex-row items-center justify-between">
                        <CardTitle className="text-base">Recommended Internships</CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recommendedInternships.map(job => (
                            <div key={job.title} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{job.title}</p>
                                    <p className="text-xs text-muted-foreground">{job.company} • {job.stipend}</p>
                                </div>
                                <Badge variant="outline" className="text-[10px] shrink-0">{job.type}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                    <CardHeader className="pb-2 flex-row items-center justify-between">
                        <CardTitle className="text-base">Upcoming Events</CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {upcomingEvents.map(ev => (
                            <div key={ev.title} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{ev.title}</p>
                                    <p className="text-xs text-muted-foreground">{ev.date}</p>
                                </div>
                                <Badge variant="secondary" className="text-[10px]">{ev.type}</Badge>
                            </div>
                        ))}
                        <div className="p-3 rounded-lg border border-dashed flex items-center gap-3 text-muted-foreground">
                            <Zap className="w-5 h-5" />
                            <span className="text-sm">Suggested study materials based on your performance</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
