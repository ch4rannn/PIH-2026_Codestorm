import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Briefcase, Clock, CheckCircle2, XCircle, Hourglass, ExternalLink } from 'lucide-react'

const applications = [
    { id: '1', title: 'Frontend Developer Intern', company: 'TechCorp India', appliedDate: '2026-02-15', status: 'under_review', type: 'Internship' },
    { id: '2', title: 'Data Science Intern', company: 'DataViz Inc', appliedDate: '2026-02-10', status: 'shortlisted', type: 'Internship' },
    { id: '3', title: 'Build E-commerce Website', company: 'LocalMart', appliedDate: '2026-02-08', status: 'accepted', type: 'Freelance' },
    { id: '4', title: 'UI/UX Design Intern', company: 'DesignLab', appliedDate: '2026-01-28', status: 'rejected', type: 'Internship' },
    { id: '5', title: 'App Testing & Bug Report', company: 'AppVenture', appliedDate: '2026-02-20', status: 'under_review', type: 'Micro Task' },
]

const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    under_review: { label: 'Under Review', icon: <Hourglass className="w-3 h-3" />, variant: 'secondary' },
    shortlisted: { label: 'Shortlisted', icon: <CheckCircle2 className="w-3 h-3" />, variant: 'default' },
    accepted: { label: 'Accepted', icon: <CheckCircle2 className="w-3 h-3" />, variant: 'default' },
    rejected: { label: 'Rejected', icon: <XCircle className="w-3 h-3" />, variant: 'destructive' },
}

export default function ApplicationHistoryPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Application History</h1>
                <p className="text-muted-foreground text-sm">Track all your job & gig applications</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Applied', value: applications.length, color: 'text-blue-500' },
                    { label: 'Under Review', value: applications.filter(a => a.status === 'under_review').length, color: 'text-yellow-500' },
                    { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, color: 'text-green-500' },
                    { label: 'Accepted', value: applications.filter(a => a.status === 'accepted').length, color: 'text-emerald-500' },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-4 text-sm font-medium text-muted-foreground">Position</th>
                                    <th className="p-4 text-sm font-medium text-muted-foreground">Company</th>
                                    <th className="p-4 text-sm font-medium text-muted-foreground">Type</th>
                                    <th className="p-4 text-sm font-medium text-muted-foreground">Applied</th>
                                    <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => {
                                    const sc = statusConfig[app.status]
                                    return (
                                        <tr key={app.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                                            <td className="p-4"><span className="font-medium text-sm">{app.title}</span></td>
                                            <td className="p-4 text-sm text-muted-foreground">{app.company}</td>
                                            <td className="p-4"><Badge variant="outline" className="text-[10px]">{app.type}</Badge></td>
                                            <td className="p-4 text-sm text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString()}</td>
                                            <td className="p-4"><Badge variant={sc.variant} className="text-[10px] gap-1">{sc.icon}{sc.label}</Badge></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
