import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, IndianRupee, CheckCircle2, Loader2, Zap } from 'lucide-react'
import api from '@/services/api'

interface MicroTask {
    id: string; title: string; reward: number; rewardStr: string; time: string; category: string; completed: boolean
}

const categories = ['All', 'Survey', 'App Testing', 'Data Entry', 'Review', 'Testing', 'Writing', 'Audio']

export default function MicroTasksPage() {
    const [tasks, setTasks] = useState<MicroTask[]>([])
    const [totalEarned, setTotalEarned] = useState(0)
    const [loading, setLoading] = useState(true)
    const [completing, setCompleting] = useState<string | null>(null)
    const [category, setCategory] = useState('All')

    const loadData = useCallback(async () => {
        try {
            const params: Record<string, string> = {}
            if (category !== 'All') params.category = category
            const res = await api.get('/career/microtasks', { params })
            setTasks(res.data.tasks)
            setTotalEarned(res.data.totalEarned)
        } catch (err) {
            console.error('Failed to load tasks:', err)
        } finally {
            setLoading(false)
        }
    }, [category])

    useEffect(() => { loadData() }, [loadData])

    const handleComplete = async (id: string) => {
        setCompleting(id)
        try {
            const res = await api.post(`/career/microtasks/${id}/complete`)
            setTotalEarned(prev => prev + res.data.reward)
            await loadData()
        } catch (err: unknown) {
            const error = err as { response?: { status?: number } }
            if (error.response?.status === 409) alert('Already completed!')
            else console.error('Complete failed:', err)
        } finally {
            setCompleting(null)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Micro Tasks</h1>
                    <p className="text-muted-foreground text-sm">Quick tasks, instant rewards</p>
                </div>
                <Badge variant="outline" className="text-sm">💰 Earned: ₹{totalEarned.toLocaleString()}</Badge>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {categories.map(c => (
                    <Badge key={c} variant={category === c ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCategory(c)}>{c}</Badge>
                ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {tasks.map(task => (
                    <Card key={task.id} className={`hover:shadow-md transition-all ${task.completed ? 'opacity-60' : 'hover:-translate-y-0.5'}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-[10px]">{task.category}</Badge>
                                {task.completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            </div>
                            <h3 className="font-medium text-sm mb-3">{task.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{task.rewardStr}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.time}</span>
                            </div>
                            {task.completed ? (
                                <Button size="sm" variant="outline" className="w-full" disabled>Completed</Button>
                            ) : (
                                <Button size="sm" className="w-full" onClick={() => handleComplete(task.id)} disabled={completing === task.id}>
                                    {completing === task.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
                                    {completing === task.id ? 'Completing...' : 'Start Task'}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
