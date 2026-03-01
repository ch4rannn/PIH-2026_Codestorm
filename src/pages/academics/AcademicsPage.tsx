import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, FileText, CreditCard, Upload, X, Check, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/services/api'

interface AttendanceData {
    subjects: { code: string; subject: string; present: number; absent: number; total: number; pct: number }[]
    monthly: { month: string; pct: number }[]
    overall: { totalClasses: number; present: number; absent: number; average: number }
}

interface ResultsData {
    results: { code: string; subject: string; semester: number; internal: number; external: number; total: number; grade: string; credits: number }[]
    sgpa: number; cgpa: number; totalCredits: number; semesters: number[]
}

interface Assignment {
    id: string; title: string; subject: string; deadline: string; status: string; submitted: boolean; grade: string | null; filePath: string | null
}

interface FeeData {
    fees: { id: string; semester: string; amount: number; paid: number; status: string; dueDate: string }[]
    summary: { total: number; paid: number; pending: number }
}

export default function AcademicsPage() {
    const [attendance, setAttendance] = useState<AttendanceData | null>(null)
    const [resultsData, setResultsData] = useState<ResultsData | null>(null)
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [feeData, setFeeData] = useState<FeeData | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState<string | null>(null)
    const [paying, setPaying] = useState<string | null>(null)
    const [payConfirm, setPayConfirm] = useState<{ id: string; semester: string; amount: number } | null>(null)

    const loadData = useCallback(async () => {
        try {
            const [attRes, resRes, assRes, feeRes] = await Promise.allSettled([
                api.get('/academic/attendance'),
                api.get('/academic/results'),
                api.get('/academic/assignments'),
                api.get('/academic/fees'),
            ])
            if (attRes.status === 'fulfilled') setAttendance(attRes.value.data)
            if (resRes.status === 'fulfilled') setResultsData(resRes.value.data)
            if (assRes.status === 'fulfilled') setAssignments(assRes.value.data)
            if (feeRes.status === 'fulfilled') setFeeData(feeRes.value.data)
        } catch (err) {
            console.error('Failed to load academic data:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const handleSubmitAssignment = async (assignmentId: string) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.pdf,.doc,.docx,.zip,.txt'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return
            setSubmitting(assignmentId)
            try {
                const formData = new FormData()
                formData.append('file', file)
                await api.put(`/academic/assignments/${assignmentId}/submit`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                await loadData()
            } catch (err) {
                console.error('Submit failed:', err)
            } finally {
                setSubmitting(null)
            }
        }
        input.click()
    }

    const handlePayFee = async (feeId: string) => {
        setPaying(feeId)
        try {
            await api.post(`/academic/fees/${feeId}/pay`)
            await loadData()
            setPayConfirm(null)
        } catch (err) {
            console.error('Payment failed:', err)
        } finally {
            setPaying(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

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
                    {attendance ? (
                        <>
                            <div className="grid lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2">
                                    <CardHeader><CardTitle className="text-base">Monthly Attendance</CardTitle></CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={attendance.monthly}>
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
                                            <p className="text-4xl font-bold text-primary">{attendance.overall.average}%</p>
                                            <p className="text-sm text-muted-foreground">Average Attendance</p>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span>Total Classes</span><span className="font-medium">{attendance.overall.totalClasses}</span></div>
                                            <div className="flex justify-between"><span>Present</span><span className="font-medium text-green-500">{attendance.overall.present}</span></div>
                                            <div className="flex justify-between"><span>Absent</span><span className="font-medium text-red-500">{attendance.overall.absent}</span></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <Card className="mt-6">
                                <CardHeader><CardTitle className="text-base">Subject-wise Breakdown</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {attendance.subjects.map(s => (
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
                        </>
                    ) : (
                        <Card><CardContent className="p-8 text-center text-muted-foreground">No attendance data available</CardContent></Card>
                    )}
                </TabsContent>

                {/* RESULTS TAB */}
                <TabsContent value="results">
                    {resultsData ? (
                        <>
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div><p className="text-3xl font-bold text-primary">{resultsData.sgpa}</p><p className="text-xs text-muted-foreground">Current SGPA</p></div>
                                        <div><p className="text-3xl font-bold">{resultsData.cgpa}</p><p className="text-xs text-muted-foreground">CGPA</p></div>
                                        <div><p className="text-3xl font-bold text-green-500">{resultsData.totalCredits}</p><p className="text-xs text-muted-foreground">Credits Earned</p></div>
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
                                            <tbody>{resultsData.results.map(r => (
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
                        </>
                    ) : (
                        <Card><CardContent className="p-8 text-center text-muted-foreground">No results data available</CardContent></Card>
                    )}
                </TabsContent>

                {/* ASSIGNMENTS TAB */}
                <TabsContent value="assignments">
                    <div className="space-y-4">
                        {assignments.length === 0 ? (
                            <Card><CardContent className="p-8 text-center text-muted-foreground">No assignments found</CardContent></Card>
                        ) : assignments.map(a => (
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
                                        {!a.submitted && (
                                            <Button size="sm" onClick={() => handleSubmitAssignment(a.id)} disabled={submitting === a.id}>
                                                {submitting === a.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                                                {submitting === a.id ? 'Submitting...' : 'Submit'}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* FEES TAB */}
                <TabsContent value="fees">
                    {feeData ? (
                        <>
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div><p className="text-2xl font-bold">₹{feeData.summary.total.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Fees</p></div>
                                        <div><p className="text-2xl font-bold text-green-500">₹{feeData.summary.paid.toLocaleString()}</p><p className="text-xs text-muted-foreground">Paid</p></div>
                                        <div><p className="text-2xl font-bold text-red-500">₹{feeData.summary.pending.toLocaleString()}</p><p className="text-xs text-muted-foreground">Pending</p></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="space-y-3">
                                {feeData.fees.map(f => (
                                    <Card key={f.id}>
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
                                                {f.status === 'pending' && (
                                                    <Button size="sm" onClick={() => setPayConfirm({ id: f.id, semester: f.semester, amount: f.amount })}>Pay Now</Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    ) : (
                        <Card><CardContent className="p-8 text-center text-muted-foreground">No fee data available</CardContent></Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Pay Confirmation Modal */}
            {payConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPayConfirm(null)} />
                    <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Confirm Payment</h2>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPayConfirm(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">{payConfirm.semester}</p>
                            <p className="text-2xl font-bold">₹{payConfirm.amount.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setPayConfirm(null)}>Cancel</Button>
                            <Button onClick={() => handlePayFee(payConfirm.id)} disabled={paying === payConfirm.id}>
                                {paying === payConfirm.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                {paying === payConfirm.id ? 'Processing...' : 'Confirm Payment'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
