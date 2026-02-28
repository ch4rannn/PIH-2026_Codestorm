import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { Heart, MessageCircle, Share2, Filter, Send, CheckCircle2, Plus, Image, Calendar, Briefcase, Megaphone } from 'lucide-react'

const mockPosts = [
    { id: '1', author: 'Dr. Priya Sharma', role: 'faculty', avatar: 'PS', content: 'Registration for the Annual TechFest 2026 is now open! Last date to register: March 10th. Theme: "AI for Social Good". Register through the student portal.', type: 'event', likes: 42, comments: 8, time: '2 hours ago', verified: true },
    { id: '2', author: 'Admin Office', role: 'admin', avatar: 'AO', content: '📢 Important: Mid-semester examination schedule has been released. Please check the academic calendar. Exams begin from March 20th.', type: 'announcement', likes: 156, comments: 23, time: '5 hours ago', verified: true },
    { id: '3', author: 'Placement Cell', role: 'admin', avatar: 'PC', content: 'Google is visiting campus on March 8th for SDE roles. Eligible: CSE/IT students with CGPA >= 8.0. Pre-placement talk at 10 AM in Auditorium.', type: 'job', likes: 234, comments: 45, time: '1 day ago', verified: true },
    { id: '4', author: 'Dr. Rajesh Kumar', role: 'faculty', avatar: 'RK', content: 'Workshop on "Cloud Computing with AWS" this Saturday, 10 AM - 4 PM. Hands-on session with free AWS credits for participants. Limited seats!', type: 'workshop', likes: 89, comments: 12, time: '1 day ago', verified: true },
    { id: '5', author: 'Rahul Kumar', role: 'student', avatar: 'RK', content: 'Just completed my first open-source contribution! Thanks to the coding club for organizing the hacktoberfest workshop. 🎉', type: 'general', likes: 67, comments: 15, time: '2 days ago', verified: false },
]

const postTypes = ['All', 'Events', 'Jobs', 'Workshops', 'Announcements']
const typeIcons: Record<string, React.ReactNode> = {
    event: <Calendar className="w-3 h-3" />,
    job: <Briefcase className="w-3 h-3" />,
    workshop: <Briefcase className="w-3 h-3" />,
    announcement: <Megaphone className="w-3 h-3" />,
}

export default function SocialFeed() {
    const { user } = useAuth()
    const [filter, setFilter] = useState('All')
    const [posts, setPosts] = useState(mockPosts)
    const [newPost, setNewPost] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const canPost = user?.role === 'faculty' || user?.role === 'admin'

    const filtered = posts.filter(p => {
        if (filter === 'All') return true
        return p.type === filter.toLowerCase().slice(0, -1)
    })

    const handleLike = (id: string) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Social Feed</h1>
                    <p className="text-muted-foreground text-sm">University news & updates</p>
                </div>
                {canPost && <Button onClick={() => setShowCreate(!showCreate)}><Plus className="w-4 h-4 mr-2" />Create Post</Button>}
            </div>

            {/* Create Post */}
            {showCreate && canPost && (
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-primary/10 text-primary">{user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback></Avatar>
                            <Textarea placeholder="What's happening at the university?" value={newPost} onChange={e => setNewPost(e.target.value)} className="min-h-[80px]" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="text-xs"><Image className="w-3.5 h-3.5 mr-1" />Photo</Button>
                                <Button size="sm" variant="ghost" className="text-xs"><Calendar className="w-3.5 h-3.5 mr-1" />Event</Button>
                            </div>
                            <Button size="sm" disabled={!newPost.trim()}><Send className="w-3.5 h-3.5 mr-1" />Post</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {postTypes.map(type => (
                    <Button key={type} size="sm" variant={filter === type ? 'default' : 'outline'} className="text-xs shrink-0" onClick={() => setFilter(type)}>
                        {type}
                    </Button>
                ))}
            </div>

            {/* Posts */}
            <div className="space-y-4">
                {filtered.map(post => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{post.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm">{post.author}</span>
                                        {post.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary fill-primary/20" />}
                                        <Badge variant="secondary" className="text-[10px] gap-0.5">{typeIcons[post.type]}{post.type}</Badge>
                                        <span className="text-xs text-muted-foreground">• {post.time}</span>
                                    </div>
                                    <p className="text-sm mt-2 leading-relaxed">{post.content}</p>
                                    <div className="flex items-center gap-4 mt-4">
                                        <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-500 transition-colors">
                                            <Heart className="w-4 h-4" />{post.likes}
                                        </button>
                                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                                            <MessageCircle className="w-4 h-4" />{post.comments}
                                        </button>
                                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                                            <Share2 className="w-4 h-4" />Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
