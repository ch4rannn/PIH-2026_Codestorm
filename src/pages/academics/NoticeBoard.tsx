import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, AlertCircle } from 'lucide-react'

const notices = [
    { id: '1', title: 'Mid-Semester Exam Schedule Released', content: 'Mid-semester examinations will begin from March 20, 2026. Detailed subject-wise schedule is available on the exam portal.', type: 'exam', date: '2026-02-28', priority: 'high' },
    { id: '2', title: 'Library Extended Hours During Exams', content: 'The central library will remain open until 11 PM during the examination period (March 20 - April 5).', type: 'general', date: '2026-02-27', priority: 'medium' },
    { id: '3', title: 'Annual Sports Day - Registration Open', content: 'Register for Annual Sports Day 2026. Events: Athletics, Cricket, Football, Badminton, Chess. Last date: March 5.', type: 'event', date: '2026-02-25', priority: 'low' },
    { id: '4', title: 'Fee Payment Reminder', content: 'Students with pending fees are requested to clear their dues before March 15 to avoid late payment charges.', type: 'finance', date: '2026-02-24', priority: 'high' },
    { id: '5', title: 'Guest Lecture: AI in Healthcare', content: 'Dr. Sarah Chen from Stanford will deliver a guest lecture on "AI Applications in Healthcare" on March 3rd at 2 PM.', type: 'event', date: '2026-02-22', priority: 'medium' },
]

const priorityColors: Record<string, string> = {
    high: 'bg-red-500/10 text-red-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    low: 'bg-green-500/10 text-green-500',
}

export default function NoticeBoard() {
    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold">Notice Board</h1>
                <p className="text-muted-foreground text-sm">University announcements & notices</p>
            </div>
            <div className="space-y-4">
                {notices.map(notice => (
                    <Card key={notice.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${priorityColors[notice.priority]}`}>
                                    {notice.priority === 'high' ? <AlertCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="font-semibold text-sm">{notice.title}</h3>
                                        <Badge variant="outline" className="text-[10px]">{notice.type}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{notice.content}</p>
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />{new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
