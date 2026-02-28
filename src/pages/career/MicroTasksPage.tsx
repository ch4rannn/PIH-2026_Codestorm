import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Clock, IndianRupee, CheckCircle2 } from 'lucide-react'

const microTasks = [
    { id: '1', title: 'Survey Completion - Campus Food', reward: '₹50', time: '5 min', category: 'Survey', completed: false },
    { id: '2', title: 'Test Mobile App - FindMyRoom', reward: '₹200', time: '30 min', category: 'App Testing', completed: false },
    { id: '3', title: 'Transcribe Lecture Notes', reward: '₹150', time: '20 min', category: 'Data Entry', completed: true },
    { id: '4', title: 'Social Media Post Review', reward: '₹30', time: '5 min', category: 'Review', completed: false },
    { id: '5', title: 'Website Feedback - College Portal', reward: '₹100', time: '15 min', category: 'Testing', completed: false },
    { id: '6', title: 'Proofread Article - Tech Blog', reward: '₹80', time: '10 min', category: 'Writing', completed: true },
    { id: '7', title: 'Data Label Images - AI Dataset', reward: '₹250', time: '45 min', category: 'Data Entry', completed: false },
    { id: '8', title: 'Record Voice Sample', reward: '₹120', time: '10 min', category: 'Audio', completed: false },
]

export default function MicroTasksPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Micro Tasks</h1>
                    <p className="text-muted-foreground text-sm">Quick tasks, instant rewards</p>
                </div>
                <Badge variant="outline" className="text-sm">💰 Earned: ₹230</Badge>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {microTasks.map(task => (
                    <Card key={task.id} className={`hover:shadow-md transition-all ${task.completed ? 'opacity-60' : 'hover:-translate-y-0.5'}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-[10px]">{task.category}</Badge>
                                {task.completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            </div>
                            <h3 className="font-medium text-sm mb-3">{task.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{task.reward}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.time}</span>
                            </div>
                            <Button size="sm" variant={task.completed ? 'outline' : 'default'} className="w-full" disabled={task.completed}>
                                {task.completed ? 'Completed' : 'Start Task'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
