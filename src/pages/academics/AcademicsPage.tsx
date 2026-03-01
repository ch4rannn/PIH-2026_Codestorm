import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, FileText, CreditCard, Upload } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Attendance Data
const attendanceByMonth = [
    { month: 'Sep', pct: 92 }, { month: 'Oct', pct: 88 }, { month: 'Nov', pct: 85 },
    { month: 'Dec', pct: 90 }, { month: 'Jan', pct: 87 }, { month: 'Feb', pct: 89 },
]

const subjectAttendance = [
    { subject: 'Data Structures & Algorithms', code: 'CS301', present: 42, total: 48, pct: 87.5 },
    { subject: 'Operating Systems', code: 'CS302', present: 38, total: 45, pct: 84.4 },
    { subject: 'Database Management', code: 'CS303', present: 44, total: 46, pct: 95.7 },
    { subject: 'Computer Networks', code: 'CS304', present: 36, total: 44, pct: 81.8 },
    { subject: 'Software Engineering', code: 'CS305', present: 40, total: 42, pct: 95.2 },
]

// Results Data
const results = [
    { subject: 'Data Structures & Algorithms', code: 'CS301', internal: 38, external: 62, total: 100, grade: 'A', credits: 4 },
    { subject: 'Operating Systems', code: 'CS302', internal: 35, external: 55, total: 90, grade: 'A', credits: 4 },
    { subject: 'Database Management', code: 'CS303', internal: 40, external: 65, total: 105, grade: 'A+', credits: 4 },
    { subject: 'Computer Networks', code: 'CS304', internal: 30, external: 50, total: 80, grade: 'B+', credits: 3 },
    { subject: 'Software Engineering', code: 'CS305', internal: 36, external: 58, total: 94, grade: 'A', credits: 3 },
]

// Assignments Data
const assignments = [
    { id: '1', title: 'DSA Assignment 5 - Trees', subject: 'CS301', deadline: '2026-03-05', status: 'pending', submitted: false },
    { id: '2', title: 'OS Lab Report - Process Scheduling', subject: 'CS302', deadline: '2026-03-02', status: 'submitted', submitted: true },
    { id: '3', title: 'DBMS Project - ER Diagram', subject: 'CS303', deadline: '2026-02-28', status: 'graded', submitted: true, grade: 'A' },
    { id: '4', title: 'CN Assignment 3 - TCP/IP', subject: 'CS304', deadline: '2026-03-10', status: 'pending', submitted: false },
]

// Fees Data
const fees = [
    { semester: 'Sem 6 Tuition Fee', amount: 85000, paid: 85000, status: 'paid', dueDate: '2026-01-15' },
    { semester: 'Sem 6 Hostel Fee', amount: 45000, paid: 45000, status: 'paid', dueDate: '2026-01-15' },
    { semester: 'Sem 6 Lab Fee', amount: 8000, paid: 0, status: 'pending', dueDate: '2026-03-15' },
    { semester: 'Exam Fee', amount: 3000, paid: 0, status: 'pending', dueDate: '2026-03-20' },
]

export default function AcademicsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Academics</h1>
                <p className="text-muted-foreground text-sm">Attendance, results, assignments & fees</p>
            </div>

            <Tabs defaultValue="attendance">
                <TabsList className="w-full sm:w-auto flex overflow-x-auto">
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="fees">Fees</TabsTrigger>
                </TabsList>

                {/* ATTENDANCE TAB */}
                <TabsContent value="attendance">
                    <div className="grid lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader><CardTitle className="text-base">Monthly Attendance</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={attendanceByMonth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                        <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                        <Bar dataKey="pct" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-base">Overall</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-primary">88.9%</p>
                                    <p className="text-sm text-muted-foreground">Average Attendance</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Total Classes</span><span className="font-medium">225</span></div>
                                    <div className="flex justify-between"><span>Present</span><span className="font-medium text-green-500">200</span></div>
                                    <div className="flex justify-between"><span>Absent</span><span className="font-medium text-red-500">25</span></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="mt-6">
                        <CardHeader><CardTitle className="text-base">Subject-wise Breakdown</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {subjectAttendance.map(s => (
                                <div key={s.code} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span><span className="font-medium">{s.subject}</span> <span className="text-muted-foreground">({s.code})</span></span>
                                        <span className={s.pct >= 85 ? 'text-green-500' : s.pct >= 75 ? 'text-yellow-500' : 'text-red-500'}>{s.present}/{s.total} ({s.pct}%)</span>
                                    </div>
                                    <Progress value={s.pct} className="h-2" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* RESULTS TAB */}
                <TabsContent value="results">
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div><p className="text-3xl font-bold text-primary">9.1</p><p className="text-xs text-muted-foreground">Current SGPA</p></div>
                                <div><p className="text-3xl font-bold">8.8</p><p className="text-xs text-muted-foreground">CGPA</p></div>
                                <div><p className="text-3xl font-bold text-green-500">18</p><p className="text-xs text-muted-foreground">Credits Earned</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead><tr className="border-b">
                                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Subject</th>
                                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">Internal</th>
                                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">External</th>
                                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">Total</th>
                                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">Grade</th>
                                        <th className="p-4 text-center text-sm font-medium text-muted-foreground">Credits</th>
                                    </tr></thead>
                                    <tbody>{results.map(r => (
                                        <tr key={r.code} className="border-b last:border-0 hover:bg-accent/50">
                                            <td className="p-4"><p className="font-medium text-sm">{r.subject}</p><p className="text-xs text-muted-foreground">{r.code}</p></td>
                                            <td className="p-4 text-center text-sm">{r.internal}/40</td>
                                            <td className="p-4 text-center text-sm">{r.external}/60</td>
                                            <td className="p-4 text-center text-sm font-medium">{r.total}</td>
                                            <td className="p-4 text-center"><Badge variant={r.grade.startsWith('A') ? 'default' : 'secondary'}>{r.grade}</Badge></td>
                                            <td className="p-4 text-center text-sm">{r.credits}</td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ASSIGNMENTS TAB */}
                <TabsContent value="assignments">
                    <div className="space-y-4">
                        {assignments.map(a => (
                            <Card key={a.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${a.status === 'graded' ? 'bg-green-500/10' : a.status === 'submitted' ? 'bg-blue-500/10' : 'bg-yellow-500/10'}`}>
                                        {a.status === 'graded' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : a.status === 'submitted' ? <Clock className="w-5 h-5 text-blue-500" /> : <FileText className="w-5 h-5 text-yellow-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm">{a.title}</h3>
                                        <p className="text-xs text-muted-foreground">{a.subject} • Due: {new Date(a.deadline).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {a.grade && <Badge>{a.grade}</Badge>}
                                        <Badge variant={a.status === 'graded' ? 'default' : a.status === 'submitted' ? 'secondary' : 'outline'} className="text-[10px]">{a.status}</Badge>
                                        {!a.submitted && <Button size="sm"><Upload className="w-3 h-3 mr-1" />Submit</Button>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* FEES TAB */}
                <TabsContent value="fees">
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div><p className="text-2xl font-bold">₹1,41,000</p><p className="text-xs text-muted-foreground">Total Fees</p></div>
                                <div><p className="text-2xl font-bold text-green-500">₹1,30,000</p><p className="text-xs text-muted-foreground">Paid</p></div>
                                <div><p className="text-2xl font-bold text-red-500">₹11,000</p><p className="text-xs text-muted-foreground">Pending</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="space-y-3">
                        {fees.map((f, i) => (
                            <Card key={i}>
                                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${f.status === 'paid' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                        <CreditCard className={`w-5 h-5 ${f.status === 'paid' ? 'text-green-500' : 'text-red-500'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{f.semester}</p>
                                        <p className="text-xs text-muted-foreground">Due: {new Date(f.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <p className="font-semibold">₹{f.amount.toLocaleString()}</p>
                                        <Badge variant={f.status === 'paid' ? 'default' : 'destructive'} className="text-[10px]">{f.status === 'paid' ? '✓ Paid' : 'Pending'}</Badge>
                                        {f.status === 'pending' && <Button size="sm">Pay Now</Button>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
