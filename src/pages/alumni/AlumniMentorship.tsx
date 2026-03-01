import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
    CheckCircle2, XCircle, Clock, MessageCircle,
    Star, Users, BookOpen, Target, Video
} from 'lucide-react'

interface MentorshipRequest {
    id: string; student: string; topic: string; date: string
    status: 'pending' | 'accepted' | 'completed' | 'rejected'
    department: string; topicTag: string
}

interface MentorSession {
    id: string; student: string; date: string; time: string
    topic: string; status: 'scheduled' | 'completed'; mode: 'video' | 'chat'
    rating?: number; notes?: string
}

interface ActiveMentorship {
    id: string; student: string; department: string; startDate: string
    topics: string[]; sessionsCompleted: number; totalSessions: number
    progress: number
}

const mentorshipRequests: MentorshipRequest[] = [
    { id: '1', student: 'Rahul Kumar', topic: 'SDE Interview Prep', date: '2026-02-25', status: 'pending', department: 'CS', topicTag: 'Interview Prep' },
    { id: '2', student: 'Sana Ahmed', topic: 'Resume Review', date: '2026-02-22', status: 'accepted', department: 'CS', topicTag: 'Career Advice' },
    { id: '3', student: 'Kunal Shah', topic: 'Career Path in ML', date: '2026-02-20', status: 'completed', department: 'IT', topicTag: 'Industry Insights' },
    { id: '4', student: 'Priti Jain', topic: 'Referral for Google', date: '2026-02-18', status: 'pending', department: 'CS', topicTag: 'Referral' },
    { id: '5', student: 'Aakash Mehra', topic: 'System Design Prep', date: '2026-02-15', status: 'accepted', department: 'CS', topicTag: 'Interview Prep' },
]

const sessions: MentorSession[] = [
    { id: '1', student: 'Sana Ahmed', date: '2026-03-05', time: '4:00 PM', topic: 'Resume Review', status: 'scheduled', mode: 'video' },
    { id: '2', student: 'Aakash Mehra', date: '2026-03-08', time: '5:30 PM', topic: 'System Design Basics', status: 'scheduled', mode: 'video' },
    { id: '3', student: 'Kunal Shah', date: '2026-02-28', time: '6:00 PM', topic: 'ML Career Discussion', status: 'completed', mode: 'video', rating: 5, notes: 'Great session! Kunal has clear goals now.' },
    { id: '4', student: 'Rahul Kumar', date: '2026-02-20', time: '3:00 PM', topic: 'DSA Strategy', status: 'completed', mode: 'chat', rating: 4 },
]

const activeMentorships: ActiveMentorship[] = [
    { id: '1', student: 'Sana Ahmed', department: 'CS', startDate: '2026-01-15', topics: ['Resume', 'Interview'], sessionsCompleted: 3, totalSessions: 6, progress: 50 },
    { id: '2', student: 'Aakash Mehra', department: 'CS', startDate: '2026-02-01', topics: ['System Design', 'Career'], sessionsCompleted: 1, totalSessions: 8, progress: 12 },
]

const topicTags = ['All', 'Interview Prep', 'Career Advice', 'Industry Insights', 'Resume', 'Referral']

export default function AlumniMentorship() {
    const [topicFilter, setTopicFilter] = useState('All')

    const filteredRequests = mentorshipRequests.filter(r => topicFilter === 'All' || r.topicTag === topicFilter)
    const pending = mentorshipRequests.filter(r => r.status === 'pending').length
    const accepted = mentorshipRequests.filter(r => r.status === 'accepted').length
    const completed = mentorshipRequests.filter(r => r.status === 'completed').length

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Mentorship Dashboard</h1>
                <p className="text-muted-foreground text-sm">Manage mentorship requests, sessions & progress</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                    { l: 'Pending', v: pending, c: 'text-yellow-500', icon: Clock },
                    { l: 'Accepted', v: accepted, c: 'text-green-500', icon: CheckCircle2 },
                    { l: 'Completed', v: completed, c: 'text-blue-500', icon: Target },
                    { l: 'Sessions', v: sessions.length, c: 'text-purple-500', icon: Video },
                    { l: 'Active Mentees', v: activeMentorships.length, c: 'text-pink-500', icon: Users },
                ].map(s => (
                    <Card key={s.l}><CardContent className="p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.c} bg-current/10`}>
                            <s.icon className={`w-4 h-4 ${s.c}`} />
                        </div>
                        <div>
                            <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
                            <p className="text-[10px] text-muted-foreground">{s.l}</p>
                        </div>
                    </CardContent></Card>
                ))}
            </div>

            {/* Topic Filter */}
            <div className="flex gap-2 flex-wrap">
                {topicTags.map(t => (
                    <Button key={t} size="sm" variant={topicFilter === t ? 'default' : 'outline'} onClick={() => setTopicFilter(t)} className="text-xs">
                        {t}
                    </Button>
                ))}
            </div>

            {/* Active Mentorships */}
            {activeMentorships.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" />Active Mentorships</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {activeMentorships.map(m => (
                            <div key={m.id} className="p-4 rounded-lg border space-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{m.student.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{m.student}</p>
                                        <p className="text-xs text-muted-foreground">{m.department} • Started {new Date(m.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                    <Badge variant="default" className="text-[10px]">Active</Badge>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {m.topics.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>{m.sessionsCompleted}/{m.totalSessions} sessions</span>
                                        <span className="text-muted-foreground">{m.progress}%</span>
                                    </div>
                                    <Progress value={m.progress} className="h-1.5" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Requests */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Mentorship Requests</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {filteredRequests.map(r => (
                            <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-primary/10 text-primary">{r.student.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{r.student}</p>
                                    <p className="text-xs text-muted-foreground">{r.topic} • {r.department}</p>
                                    <Badge variant="outline" className="text-[9px] mt-1">{r.topicTag}</Badge>
                                </div>
                                {r.status === 'pending' ? (
                                    <div className="flex gap-1">
                                        <Button size="sm" variant="outline" className="h-7 text-xs"><CheckCircle2 className="w-3 h-3" /></Button>
                                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive"><XCircle className="w-3 h-3" /></Button>
                                    </div>
                                ) : (
                                    <Badge variant={r.status === 'accepted' ? 'default' : 'secondary'} className="text-[10px]">{r.status}</Badge>
                                )}
                            </div>
                        ))}
                        {filteredRequests.length === 0 && (
                            <div className="text-center py-6 text-muted-foreground text-sm">No requests for this topic</div>
                        )}
                    </CardContent>
                </Card>

                {/* Sessions */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Sessions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {sessions.map(s => (
                            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.status === 'scheduled' ? 'bg-primary/10' : 'bg-muted'}`}>
                                    {s.mode === 'video' ? <Video className={`w-5 h-5 ${s.status === 'scheduled' ? 'text-primary' : 'text-muted-foreground'}`} /> : <MessageCircle className={`w-5 h-5 ${s.status === 'scheduled' ? 'text-primary' : 'text-muted-foreground'}`} />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{s.topic}</p>
                                    <p className="text-xs text-muted-foreground">with {s.student} • {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {s.time}</p>
                                    {s.rating && (
                                        <div className="flex items-center gap-0.5 mt-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < s.rating! ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Badge variant={s.status === 'scheduled' ? 'default' : 'secondary'} className="text-[10px]">{s.status}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
