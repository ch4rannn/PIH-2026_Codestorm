import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Search, Quote, Star, Rocket, Building2, FlaskConical, Heart,
    ThumbsUp, BookOpen, PenLine, Send, Trophy, Sparkles
} from 'lucide-react'

interface SuccessStory {
    id: string; name: string; batch: string; department: string
    role: string; company: string
    category: 'entrepreneur' | 'corporate' | 'research' | 'social-impact'
    quote: string; story: string; achievements: string[]
    likes: number; featured: boolean
}

const stories: SuccessStory[] = [
    {
        id: '1', name: 'Ankit Verma', batch: '2020', department: 'CS',
        role: 'SDE-2', company: 'Google', category: 'corporate',
        quote: 'The foundation I built at this university gave me the confidence to thrive at Google.',
        story: 'Starting as a curious freshman, Ankit dove into competitive programming and open-source. His final-year project on distributed systems caught Google recruiters\' attention.',
        achievements: ['Google SDE-2 in 3 years', '10K+ GitHub stars', '3 patents filed'],
        likes: 245, featured: true,
    },
    {
        id: '2', name: 'Priya Singh', batch: '2019', department: 'CS',
        role: 'Co-Founder & CEO', company: 'EduNex', category: 'entrepreneur',
        quote: 'My startup journey began right in the university incubation center.',
        story: 'Priya identified the ed-tech gap during her internship, built the MVP in her final semester, and EduNex now serves 50,000+ students across India.',
        achievements: ['Raised ₹5Cr Series A', '50K+ users', 'Forbes 30 Under 30'],
        likes: 312, featured: true,
    },
    {
        id: '3', name: 'Dr. Rohit Mehta', batch: '2018', department: 'ECE',
        role: 'Research Scientist', company: 'MIT Media Lab', category: 'research',
        quote: 'The research culture here sparked my passion for pushing boundaries in AI.',
        story: 'Rohit published his first paper as an undergraduate, completed his PhD at Stanford, and now leads a team at MIT Media Lab on human-AI interaction.',
        achievements: ['PhD from Stanford', '15+ papers (h-index 12)', 'NSF Career Award'],
        likes: 189, featured: false,
    },
    {
        id: '4', name: 'Sneha Patel', batch: '2020', department: 'Social Sciences',
        role: 'Founder', company: 'RuralConnect NGO', category: 'social-impact',
        quote: 'Education has the power to transform rural communities.',
        story: 'After graduating, Sneha founded RuralConnect providing digital literacy and vocational training to 200+ villages, recognized by the UN.',
        achievements: ['Impacted 200+ villages', 'UN SD recognition', 'TEDx speaker'],
        likes: 278, featured: true,
    },
    {
        id: '5', name: 'Vikram Joshi', batch: '2017', department: 'Mechanical',
        role: 'VP of Engineering', company: 'Swiggy', category: 'corporate',
        quote: 'Multidisciplinary exposure prepared me for leading diverse engineering teams.',
        story: 'Vikram started as a backend developer despite his mechanical background. His systems thinking propelled him to VP of Engineering at Swiggy.',
        achievements: ['VP at age 29', '150+ engineer team', '10M+ orders/day'],
        likes: 198, featured: false,
    },
]

const categoryIcons: Record<string, typeof Star> = {
    entrepreneur: Rocket, corporate: Building2, research: FlaskConical, 'social-impact': Heart,
}
const categoryColors: Record<string, string> = {
    entrepreneur: 'text-orange-500 bg-orange-500/10', corporate: 'text-blue-500 bg-blue-500/10',
    research: 'text-purple-500 bg-purple-500/10', 'social-impact': 'text-emerald-500 bg-emerald-500/10',
}
const categoryLabels: Record<string, string> = {
    entrepreneur: 'Entrepreneur', corporate: 'Corporate Leader',
    research: 'Researcher', 'social-impact': 'Social Impact',
}

export default function AlumniSuccessStories() {
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('All')
    const [likes, setLikes] = useState<Record<string, number>>(Object.fromEntries(stories.map(s => [s.id, s.likes])))
    const [likedStories, setLikedStories] = useState<string[]>([])
    const [showForm, setShowForm] = useState(false)

    const filtered = stories.filter(s => {
        if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.story.toLowerCase().includes(search.toLowerCase())) return false
        if (categoryFilter !== 'All' && s.category !== categoryFilter) return false
        return true
    })

    const toggleLike = (id: string) => {
        if (likedStories.includes(id)) {
            setLikedStories(prev => prev.filter(i => i !== id))
            setLikes(prev => ({ ...prev, [id]: prev[id] - 1 }))
        } else {
            setLikedStories(prev => [...prev, id])
            setLikes(prev => ({ ...prev, [id]: prev[id] + 1 }))
        }
    }

    const featured = filtered.filter(s => s.featured)
    const regular = filtered.filter(s => !s.featured)

    const renderStoryCard = (story: SuccessStory, isFeatured: boolean) => {
        const Icon = categoryIcons[story.category]
        const colorClass = categoryColors[story.category]
        return (
            <Card key={story.id} className="hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden">
                {isFeatured && <div className={`h-1.5 ${colorClass.split(' ')[1]}`} />}
                <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                        <Avatar className={isFeatured ? 'h-12 w-12' : 'h-10 w-10'}>
                            <AvatarFallback className={`${isFeatured ? colorClass : 'bg-primary/10 text-primary'} text-xs font-semibold`}>
                                {story.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm">{story.name}</h3>
                            <p className="text-xs text-muted-foreground">{story.role} at {story.company}</p>
                            {isFeatured && <p className="text-xs text-muted-foreground">{story.department} • Batch {story.batch}</p>}
                        </div>
                        <Badge className={`text-[10px] shrink-0 ${colorClass}`} variant="outline">
                            <Icon className="w-2.5 h-2.5 mr-1" />{categoryLabels[story.category]}
                        </Badge>
                    </div>

                    {isFeatured && (
                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                            <Quote className="w-4 h-4 text-primary/40 mb-1" />
                            <p className="text-sm italic text-foreground/80">"{story.quote}"</p>
                        </div>
                    )}
                    {!isFeatured && <p className="text-xs text-muted-foreground italic mb-3">"{story.quote}"</p>}

                    {isFeatured && <p className="text-xs text-muted-foreground leading-relaxed mb-3">{story.story}</p>}

                    <div className="flex flex-wrap gap-1 mb-3">
                        {story.achievements.slice(0, isFeatured ? 3 : 2).map(a => (
                            <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <Button size="sm" variant="ghost" onClick={() => toggleLike(story.id)}
                            className={`text-xs gap-1 ${likedStories.includes(story.id) ? 'text-pink-500' : ''}`}>
                            <ThumbsUp className={`w-3 h-3 ${likedStories.includes(story.id) ? 'fill-pink-500' : ''}`} />
                            {likes[story.id]} likes
                        </Button>
                        {isFeatured && <Badge variant="outline" className="text-[10px] gap-1"><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />Featured</Badge>}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Success Stories</h1>
                    <p className="text-muted-foreground text-sm">Celebrate alumni achievements and get inspired</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                    <PenLine className="w-4 h-4" />{showForm ? 'Close Form' : 'Share Your Story'}
                </Button>
            </div>

            {showForm && (
                <Card className="border-primary/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Share Your Success Story</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                            <Input placeholder="Your current role" />
                            <Input placeholder="Company / Organization" />
                        </div>
                        <Input placeholder="A short inspiring quote" />
                        <Textarea placeholder="Tell us your journey..." className="min-h-[100px]" />
                        <Input placeholder="Key achievements (comma-separated)" />
                        <div className="flex gap-2">
                            <Button className="gap-2"><Send className="w-3 h-3" />Submit Story</Button>
                            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Stories', value: stories.length, icon: BookOpen, color: 'text-blue-500' },
                    { label: 'Entrepreneurs', value: stories.filter(s => s.category === 'entrepreneur').length, icon: Rocket, color: 'text-orange-500' },
                    { label: 'Researchers', value: stories.filter(s => s.category === 'research').length, icon: FlaskConical, color: 'text-purple-500' },
                    { label: 'Total Likes', value: Object.values(likes).reduce((s, v) => s + v, 0), icon: ThumbsUp, color: 'text-pink-500' },
                ].map(s => (
                    <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color} bg-current/10`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                    </CardContent></Card>
                ))}
            </div>

            {/* Filters */}
            <Card><CardContent className="p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search stories..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['All', 'entrepreneur', 'corporate', 'research', 'social-impact'].map(c => (
                        <Button key={c} size="sm" variant={categoryFilter === c ? 'default' : 'outline'} onClick={() => setCategoryFilter(c)} className="text-xs capitalize">
                            {c === 'All' ? 'All' : categoryLabels[c]}
                        </Button>
                    ))}
                </div>
            </CardContent></Card>

            {featured.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" />Featured Stories</h2>
                    <div className="grid md:grid-cols-2 gap-4">{featured.map(s => renderStoryCard(s, true))}</div>
                </div>
            )}

            {regular.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">More Stories</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{regular.map(s => renderStoryCard(s, false))}</div>
                </div>
            )}

            {filtered.length === 0 && (
                <Card><CardContent className="p-12 text-center text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No stories found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </CardContent></Card>
            )}
        </div>
    )
}
