import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, Code, Palette, FileText, Smartphone, TestTube2, DollarSign, Clock, Star } from 'lucide-react'

const freelanceGigs = [
    { id: '1', title: 'Build E-commerce Website', client: 'LocalMart', budget: '₹15,000', deadline: '2 weeks', skills: ['React', 'Node.js'], difficulty: 'Medium', category: 'Web Development' },
    { id: '2', title: 'Design Mobile App UI', client: 'FitTrack', budget: '₹8,000', deadline: '1 week', skills: ['Figma', 'UI/UX'], difficulty: 'Easy', category: 'Design' },
    { id: '3', title: 'Data Entry - Product Catalog', client: 'ShopEasy', budget: '₹5,000', deadline: '3 days', skills: ['Excel', 'Data Entry'], difficulty: 'Easy', category: 'Data Entry' },
    { id: '4', title: 'WordPress Blog Setup', client: 'TechBlog', budget: '₹7,000', deadline: '1 week', skills: ['WordPress', 'SEO'], difficulty: 'Easy', category: 'Web Development' },
    { id: '5', title: 'App Testing & Bug Report', client: 'AppVenture', budget: '₹3,000', deadline: '5 days', skills: ['Testing', 'QA'], difficulty: 'Easy', category: 'Testing' },
    { id: '6', title: 'Logo & Brand Identity', client: 'StartupXYZ', budget: '₹10,000', deadline: '10 days', skills: ['Illustrator', 'Branding'], difficulty: 'Medium', category: 'Design' },
]

export default function FreelancePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Freelance Gigs</h1>
                <p className="text-muted-foreground text-sm">Quick earning opportunities for students</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {freelanceGigs.map(gig => (
                    <Card key={gig.id} className="hover:shadow-md transition-all hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <Badge variant="secondary" className="text-[10px]">{gig.category}</Badge>
                                <Badge variant={gig.difficulty === 'Easy' ? 'outline' : 'default'} className="text-[10px]">{gig.difficulty}</Badge>
                            </div>
                            <h3 className="font-semibold text-sm mb-1">{gig.title}</h3>
                            <p className="text-xs text-muted-foreground mb-3">by {gig.client}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{gig.budget}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{gig.deadline}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {gig.skills.map(s => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                            </div>
                            <Button size="sm" className="w-full">Apply for Gig</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
