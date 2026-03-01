import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BookOpen, Brain, Clock, Flame } from 'lucide-react'
import { getStudyStats } from '@/services/studyStore'

export default function StudyProgress() {
    const [stats] = useState(() => getStudyStats())
    const [range, setRange] = useState<'week' | 'all'>('week')

    if (!stats) return null

    const weeklyData = Object.entries(stats.weeklyByDay).map(([day, hours]) => ({ day, hours }))

    const statCards = [
        { label: 'Study Streak', value: `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`, icon: Flame, color: 'text-orange-500' },
        { label: 'This Week', value: `${stats.weeklyHours} hrs`, icon: Clock, color: 'text-blue-500' },
        { label: 'Cards Reviewed', value: `${stats.cardsReviewed}`, icon: Brain, color: 'text-purple-500' },
        { label: 'PDFs Read', value: `${stats.pdfsViewed}`, icon: BookOpen, color: 'text-green-500' },
    ]

    // Aggregate mastery per subject (average if multiple sets)
    const subjectMap = new Map<string, { total: number; count: number }>()
    for (const s of stats.subjectMastery) {
        const existing = subjectMap.get(s.subject)
        if (existing) {
            existing.total += s.mastery
            existing.count += 1
        } else {
            subjectMap.set(s.subject, { total: s.mastery, count: 1 })
        }
    }
    const mastery = Array.from(subjectMap.entries()).map(([subject, data]) => ({
        subject,
        mastery: Math.round(data.total / data.count),
    }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Study Progress</h1>
                    <p className="text-muted-foreground text-sm">Track your learning journey</p>
                </div>
                <div className="flex gap-1">
                    <Badge
                        variant={range === 'week' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setRange('week')}
                    >This Week</Badge>
                    <Badge
                        variant={range === 'all' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setRange('all')}
                    >All Time</Badge>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
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
                {/* Weekly Study Hours Chart */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Weekly Study Hours</CardTitle></CardHeader>
                    <CardContent>
                        {weeklyData.every(d => d.hours === 0) ? (
                            <div className="flex items-center justify-center h-[220px] text-center text-muted-foreground">
                                <div>
                                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm font-medium">No study sessions this week</p>
                                    <p className="text-xs mt-1">Review flashcards or view PDFs to start tracking</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                    <Bar dataKey="hours" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Subject Mastery */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Subject Mastery</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {mastery.length === 0 ? (
                            <div className="flex items-center justify-center h-[220px] text-center text-muted-foreground">
                                <div>
                                    <Brain className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm font-medium">No mastery data yet</p>
                                    <p className="text-xs mt-1">Complete flashcard reviews to see subject mastery</p>
                                </div>
                            </div>
                        ) : (
                            mastery.map(s => (
                                <div key={s.subject} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{s.subject}</span>
                                        <span className={s.mastery >= 80 ? 'text-green-500' : s.mastery >= 60 ? 'text-yellow-500' : 'text-red-500'}>{s.mastery}%</span>
                                    </div>
                                    <Progress value={s.mastery} className="h-2" />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
