import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BookOpen, Brain, Clock, Flame } from 'lucide-react'

const weeklyStudy = [
    { day: 'Mon', hours: 3.5 }, { day: 'Tue', hours: 4.2 }, { day: 'Wed', hours: 2.8 },
    { day: 'Thu', hours: 5.0 }, { day: 'Fri', hours: 3.0 }, { day: 'Sat', hours: 6.5 }, { day: 'Sun', hours: 4.0 },
]

const subjectMastery = [
    { subject: 'DSA', mastery: 85 }, { subject: 'OS', mastery: 70 }, { subject: 'DBMS', mastery: 90 },
    { subject: 'CN', mastery: 55 }, { subject: 'SE', mastery: 78 },
]

export default function StudyProgress() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Study Progress</h1>
                <p className="text-muted-foreground text-sm">Track your learning journey</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Study Streak', value: '12 days', icon: Flame, color: 'text-orange-500' },
                    { label: 'This Week', value: '29 hrs', icon: Clock, color: 'text-blue-500' },
                    { label: 'Cards Reviewed', value: '156', icon: Brain, color: 'text-purple-500' },
                    { label: 'PDFs Read', value: '8', icon: BookOpen, color: 'text-green-500' },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center`}>
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-lg font-bold">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-base">Weekly Study Hours</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={weeklyStudy}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                <Bar dataKey="hours" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Subject Mastery</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {subjectMastery.map(s => (
                            <div key={s.subject} className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{s.subject}</span>
                                    <span className={s.mastery >= 80 ? 'text-green-500' : s.mastery >= 60 ? 'text-yellow-500' : 'text-red-500'}>{s.mastery}%</span>
                                </div>
                                <Progress value={s.mastery} className="h-2" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
