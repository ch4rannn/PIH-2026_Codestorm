import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle2, XCircle, Calendar } from 'lucide-react'

const mentorshipRequests = [
    { id: '1', student: 'Rahul Kumar', topic: 'SDE Interview Prep', date: '2026-02-25', status: 'pending', department: 'CS' },
    { id: '2', student: 'Sana Ahmed', topic: 'Resume Review', date: '2026-02-22', status: 'accepted', department: 'CS' },
    { id: '3', student: 'Kunal Shah', topic: 'Career Path in ML', date: '2026-02-20', status: 'completed', department: 'IT' },
    { id: '4', student: 'Priti Jain', topic: 'Referral for Google', date: '2026-02-18', status: 'pending', department: 'CS' },
]

const sessions = [
    { id: '1', student: 'Sana Ahmed', date: '2026-03-05', time: '4:00 PM', topic: 'Resume Review', status: 'scheduled' },
    { id: '2', student: 'Kunal Shah', date: '2026-02-28', time: '6:00 PM', topic: 'ML Career Discussion', status: 'completed' },
]

export default function AlumniMentorship() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Mentorship Dashboard</h1>
                <p className="text-muted-foreground text-sm">Manage mentorship requests & sessions</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { l: 'Pending', v: mentorshipRequests.filter(r => r.status === 'pending').length, c: 'text-yellow-500' },
                    { l: 'Accepted', v: mentorshipRequests.filter(r => r.status === 'accepted').length, c: 'text-green-500' },
                    { l: 'Completed', v: mentorshipRequests.filter(r => r.status === 'completed').length, c: 'text-blue-500' },
                    { l: 'Sessions', v: sessions.length, c: 'text-purple-500' },
                ].map(s => (
                    <Card key={s.l}><CardContent className="p-4 text-center">
                        <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
                        <p className="text-xs text-muted-foreground">{s.l}</p>
                    </CardContent></Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-base">Mentorship Requests</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {mentorshipRequests.map(r => (
                            <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-primary/10 text-primary">{r.student.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{r.student}</p>
                                    <p className="text-xs text-muted-foreground">{r.topic} • {r.department}</p>
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-base">Scheduled Sessions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {sessions.map(s => (
                            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{s.topic}</p>
                                    <p className="text-xs text-muted-foreground">with {s.student} • {s.date} at {s.time}</p>
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
