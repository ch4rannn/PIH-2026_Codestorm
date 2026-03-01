import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Search, Heart, MessageCircle, Share2, TrendingUp, Award, Briefcase,
    Rocket, BookOpen, Milestone, PenSquare, X, Loader2, Send, Clock
} from 'lucide-react'
import { getFeed, createFeedPost, toggleLike, type FeedPost } from '@/services/feedService'

const typeConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    achievement: { icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Achievement' },
    opportunity: { icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Opportunity' },
    update: { icon: Rocket, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Update' },
    article: { icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Article' },
    milestone: { icon: Milestone, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Milestone' },
}

const typeFilters = ['all', 'achievement', 'opportunity', 'update', 'article', 'milestone']

export default function AlumniBoostFeed() {
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [stats, setStats] = useState({ total: 0, achievements: 0, opportunities: 0, total_likes: 0 })
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreate, setShowCreate] = useState(false)
    const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

    // Create form
    const [newPost, setNewPost] = useState({ author_name: '', author_role: '', author_company: '', author_batch: '', type: 'update', title: '', content: '', tagInput: '' })
    const [newTags, setNewTags] = useState<string[]>([])
    const [creating, setCreating] = useState(false)

    const fetchFeed = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getFeed({ type: typeFilter, search: search || undefined })
            setPosts(data.posts)
            setStats(data.stats)
        } catch {
            setError('Failed to load feed. Make sure the backend is running.')
        } finally {
            setLoading(false)
        }
    }, [typeFilter, search])

    useEffect(() => {
        const t = setTimeout(fetchFeed, 300)
        return () => clearTimeout(t)
    }, [fetchFeed])

    const handleLike = async (postId: number) => {
        try {
            const result = await toggleLike(postId, 'current-user')
            setLikedPosts(prev => {
                const next = new Set(prev)
                result.liked ? next.add(postId) : next.delete(postId)
                return next
            })
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, likes_count: p.likes_count + (result.liked ? 1 : -1) } : p
            ))
        } catch { /* silent */ }
    }

    const handleCreate = async () => {
        if (!newPost.author_name || !newPost.title || !newPost.content) return
        setCreating(true)
        try {
            await createFeedPost({ ...newPost, tags: newTags } as any)
            setShowCreate(false)
            setNewPost({ author_name: '', author_role: '', author_company: '', author_batch: '', type: 'update', title: '', content: '', tagInput: '' })
            setNewTags([])
            fetchFeed()
        } catch { /* silent */ }
        setCreating(false)
    }

    const addTag = () => {
        const t = newPost.tagInput.trim()
        if (t && !newTags.includes(t)) { setNewTags(prev => [...prev, t]); setNewPost(p => ({ ...p, tagInput: '' })) }
    }

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        return `${Math.floor(hrs / 24)}d ago`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Boost Feed 🚀</h1>
                    <p className="text-muted-foreground text-sm">Alumni updates, achievements & opportunities</p>
                </div>
                <Button className="gap-1.5" onClick={() => setShowCreate(true)}>
                    <PenSquare className="w-3.5 h-3.5" />New Post
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Posts', value: stats.total, icon: TrendingUp, color: 'text-blue-500' },
                    { label: 'Achievements', value: stats.achievements, icon: Award, color: 'text-amber-500' },
                    { label: 'Opportunities', value: stats.opportunities, icon: Briefcase, color: 'text-emerald-500' },
                    { label: 'Total Likes', value: stats.total_likes, icon: Heart, color: 'text-rose-500' },
                ].map(s => (
                    <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color} bg-current/10`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                    </CardContent></Card>
                ))}
            </div>

            {/* Filters */}
            <Card><CardContent className="p-4 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search posts..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {typeFilters.map(t => {
                        const cfg = t === 'all' ? null : typeConfig[t]
                        return (
                            <Button key={t} size="sm" variant={typeFilter === t ? 'default' : 'outline'} className="text-xs gap-1 capitalize" onClick={() => setTypeFilter(t)}>
                                {cfg && <cfg.icon className="w-3 h-3" />}
                                {t === 'all' ? 'All' : cfg?.label}
                            </Button>
                        )
                    })}
                </div>
            </CardContent></Card>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" /><span className="text-muted-foreground text-sm">Loading feed...</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <Card><CardContent className="p-6 text-center">
                    <p className="text-destructive font-medium">{error}</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={fetchFeed}>Retry</Button>
                </CardContent></Card>
            )}

            {/* Feed Posts */}
            {!loading && !error && (
                <div className="space-y-4">
                    {posts.map(post => {
                        const cfg = typeConfig[post.type] || typeConfig.update
                        const TypeIcon = cfg.icon
                        return (
                            <Card key={post.id} className="hover:shadow-md transition-all">
                                <CardContent className="p-5">
                                    {/* Author header */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                                {post.author_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-sm">{post.author_name}</h4>
                                                <Badge className={`text-[10px] ${cfg.color} ${cfg.bg} border-0`}>
                                                    <TypeIcon className="w-2.5 h-2.5 mr-0.5" />{cfg.label}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{post.author_role} at {post.author_company} • Batch {post.author_batch}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" />{timeAgo(post.created_at)}</span>
                                    </div>

                                    {/* Content */}
                                    <h3 className="font-semibold text-sm mb-2">{post.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{post.content}</p>

                                    {/* Tags */}
                                    {post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {post.tags.map(tag => <Badge key={tag} variant="outline" className="text-[10px]">#{tag}</Badge>)}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-2 border-t">
                                        <Button
                                            size="sm" variant="ghost" className={`gap-1.5 text-xs ${likedPosts.has(post.id) ? 'text-rose-500' : ''}`}
                                            onClick={() => handleLike(post.id)}
                                        >
                                            <Heart className={`w-3.5 h-3.5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />{post.likes_count}
                                        </Button>
                                        <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                                            <MessageCircle className="w-3.5 h-3.5" />{post.comments_count}
                                        </Button>
                                        <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                                            <Share2 className="w-3.5 h-3.5" />Share
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Empty */}
            {!loading && !error && posts.length === 0 && (
                <Card><CardContent className="p-12 text-center text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No posts yet</p>
                    <p className="text-sm mt-1">Be the first to share something!</p>
                </CardContent></Card>
            )}

            {/* Create Post Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2"><PenSquare className="w-5 h-5 text-primary" />New Post</CardTitle>
                                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-accent"><X className="w-4 h-4" /></button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs font-medium mb-1 block">Your Name *</label>
                                        <Input placeholder="Full name" value={newPost.author_name} onChange={e => setNewPost(p => ({ ...p, author_name: e.target.value }))} /></div>
                                    <div><label className="text-xs font-medium mb-1 block">Role</label>
                                        <Input placeholder="e.g. SDE-2" value={newPost.author_role} onChange={e => setNewPost(p => ({ ...p, author_role: e.target.value }))} /></div>
                                    <div><label className="text-xs font-medium mb-1 block">Company</label>
                                        <Input placeholder="e.g. Google" value={newPost.author_company} onChange={e => setNewPost(p => ({ ...p, author_company: e.target.value }))} /></div>
                                    <div><label className="text-xs font-medium mb-1 block">Batch</label>
                                        <Input placeholder="e.g. 2020" value={newPost.author_batch} onChange={e => setNewPost(p => ({ ...p, author_batch: e.target.value }))} /></div>
                                </div>
                                <div><label className="text-xs font-medium mb-1 block">Post Type</label>
                                    <select value={newPost.type} onChange={e => setNewPost(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-md border bg-background">
                                        {Object.entries(typeConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-xs font-medium mb-1 block">Title *</label>
                                    <Input placeholder="What's your post about?" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} /></div>
                                <div><label className="text-xs font-medium mb-1 block">Content *</label>
                                    <textarea className="w-full px-3 py-2 text-sm rounded-md border bg-background min-h-[100px] resize-y" placeholder="Share your story, achievement, or opportunity..." value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} /></div>
                                <div>
                                    <label className="text-xs font-medium mb-1 block">Tags</label>
                                    <div className="flex gap-2">
                                        <Input placeholder="Add tag..." value={newPost.tagInput} onChange={e => setNewPost(p => ({ ...p, tagInput: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
                                        <Button type="button" size="sm" variant="outline" onClick={addTag}>+</Button>
                                    </div>
                                    {newTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">{newTags.map(t => (
                                            <Badge key={t} variant="secondary" className="text-xs gap-1">#{t}<button onClick={() => setNewTags(p => p.filter(x => x !== t))}><X className="w-3 h-3" /></button></Badge>
                                        ))}</div>
                                    )}
                                </div>
                                <Button className="w-full gap-2" onClick={handleCreate} disabled={creating || !newPost.author_name || !newPost.title || !newPost.content}>
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {creating ? 'Publishing...' : 'Publish Post'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
