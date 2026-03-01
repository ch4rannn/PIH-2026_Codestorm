import { useState, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    MessageSquare, Send, Users, Info, Hash,
    BookOpen, GraduationCap, Loader2
} from 'lucide-react'
import {
    getMyGroups, getGroupMessages, getGroupMembers, sendMessage,
    type Group, type Message, type GroupMember
} from '@/services/groupService'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export default function AcademicGroups() {
    const { user } = useAuth()
    const currentUserId = user?.id?.toString() || '1' // Fallback to 1 for demo purposes

    const [groups, setGroups] = useState<Group[]>([])
    const [activeGroup, setActiveGroup] = useState<Group | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [members, setMembers] = useState<GroupMember[]>([])

    const [loadingGroups, setLoadingGroups] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [sending, setSending] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [showInfo, setShowInfo] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Fetch groups on mount
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const data = await getMyGroups(currentUserId)
                setGroups(data)
                if (data.length > 0) setActiveGroup(data[0])
            } catch (err) {
                console.error("Failed to fetch groups", err)
            } finally {
                setLoadingGroups(false)
            }
        }
        fetchGroups()
    }, [currentUserId])

    // Fetch messages & members when active group changes
    useEffect(() => {
        if (!activeGroup) return

        let mounted = true

        const loadData = async () => {
            if (mounted) setLoadingMessages(true)
            try {
                const [msgs, mems] = await Promise.all([
                    getGroupMessages(activeGroup.id, currentUserId),
                    getGroupMembers(activeGroup.id, currentUserId)
                ])
                if (mounted) {
                    setMessages(msgs)
                    setMembers(mems)
                }
            } catch (err) {
                console.error("Failed to load group data", err)
            } finally {
                if (mounted) setLoadingMessages(false)
            }
        }

        const pollMessages = async () => {
            try {
                const msgs = await getGroupMessages(activeGroup.id, currentUserId)
                if (mounted) setMessages(msgs)
            } catch { /* silent fail for polling */ }
        }

        loadData()

        // Simple polling for new messages (every 5 seconds)
        const pollInterval = setInterval(pollMessages, 5000)

        return () => {
            mounted = false
            clearInterval(pollInterval)
        }
    }, [activeGroup, currentUserId])

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !activeGroup || sending) return

        const content = newMessage.trim()
        setNewMessage('')
        setSending(true)

        // Optimistic update
        const fakeId = Date.now()
        setMessages(prev => [...prev, {
            id: fakeId,
            content,
            created_at: new Date().toISOString(),
            sender_name: user?.name || 'You',
            sender_role: user?.role || 'student',
            avatar: '',
            sender_id: parseInt(currentUserId)
        }])

        try {
            const actualMessage = await sendMessage(activeGroup.id, content, currentUserId)
            setMessages(prev => prev.map(m => m.id === fakeId ? actualMessage : m))
        } catch (err) {
            console.error("Failed to send", err)
            // Revert on fail
            setMessages(prev => prev.filter(m => m.id !== fakeId))
        } finally {
            setSending(false)
        }
    }

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'class': return <Users className="w-4 h-4 text-blue-500" />
            case 'subject': return <BookOpen className="w-4 h-4 text-emerald-500" />
            case 'mentorship': return <GraduationCap className="w-4 h-4 text-purple-500" />
            default: return <Hash className="w-4 h-4" />
        }
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-background border rounded-xl overflow-hidden shadow-sm">

            {/* LEFT PANE - Groups List */}
            <div className={`w-full md:w-80 border-r bg-card flex flex-col ${activeGroup ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Discussions
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Connect with your sections & mentors</p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loadingGroups ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : groups.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground text-sm">You haven't joined any groups yet.</div>
                    ) : (
                        groups.map(group => (
                            <button
                                key={group.id}
                                onClick={() => setActiveGroup(group)}
                                className={cn(
                                    "w-full flex flex-col items-start p-3 rounded-lg text-left transition-colors",
                                    activeGroup?.id === group.id
                                        ? "bg-primary/10 border border-primary/20"
                                        : "hover:bg-accent border border-transparent"
                                )}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    {getTypeIcon(group.type)}
                                    <span className="font-semibold text-sm truncate flex-1">{group.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground mt-1 line-clamp-1 pl-6">
                                    {group.description}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT PANE - Chat Interface */}
            {activeGroup ? (
                <div className="flex-1 flex flex-col min-w-0 bg-background relative">
                    {/* Chat Header */}
                    <div className="p-3 border-b bg-card flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setActiveGroup(null)}>
                                &larr;
                            </Button>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                {getTypeIcon(activeGroup.type)}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-sm truncate">{activeGroup.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">{activeGroup.member_count} members</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setShowInfo(!showInfo)} className={showInfo ? "bg-accent" : ""}>
                            <Info className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Messages Area */}
                        <div className="flex-1 flex flex-col relative">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {loadingMessages ? (
                                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                                ) : (
                                    <>
                                        <div className="text-center pb-4">
                                            <Badge variant="outline" className="text-xs font-normal">Welcome to the beginning of the <strong>{activeGroup.name}</strong> group.</Badge>
                                        </div>
                                        {messages.map((msg, idx) => {
                                            const isMe = msg.sender_id === parseInt(currentUserId)
                                            const showHeader = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id

                                            return (
                                                <div key={msg.id} className={cn("flex gap-3 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                                                    {!isMe && showHeader && (
                                                        <Avatar className="w-8 h-8 shrink-0 mt-1">
                                                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                                {msg.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    {(!showHeader && !isMe) && <div className="w-8 shrink-0" />} {/* Spacer */}

                                                    <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                                        {showHeader && !isMe && (
                                                            <div className="flex items-baseline gap-2 mb-1 pl-1">
                                                                <span className="text-xs font-semibold">{msg.sender_name}</span>
                                                                <span className="text-[10px] text-muted-foreground capitalize">{msg.sender_role}</span>
                                                            </div>
                                                        )}
                                                        <div className={cn(
                                                            "px-3 py-2 rounded-2xl text-sm relative group whitespace-pre-wrap break-words",
                                                            isMe
                                                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                                : "bg-accent rounded-tl-sm"
                                                        )}>
                                                            {msg.content}
                                                            <span className={cn(
                                                                "absolute -bottom-4 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                                                                isMe ? "right-1 text-muted-foreground" : "left-1 text-muted-foreground"
                                                            )}>
                                                                {formatTime(msg.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <div ref={messagesEndRef} className="pt-2" />
                                    </>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="p-3 border-t bg-card shrink-0">
                                <form onSubmit={handleSend} className="flex gap-2">
                                    <Input
                                        className="flex-1 bg-background"
                                        placeholder={`Message ${activeGroup.name}...`}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={loadingMessages}
                                    />
                                    <Button type="submit" size="icon" disabled={!newMessage.trim() || sending || loadingMessages}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Right Details Sidebar */}
                        {showInfo && (
                            <div className="w-64 border-l bg-card flex flex-col hidden lg:flex">
                                <div className="p-4 border-b">
                                    <h4 className="font-semibold text-sm">Group Info</h4>
                                </div>
                                <div className="p-4 border-b text-center">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                        {getTypeIcon(activeGroup.type)}
                                    </div>
                                    <h4 className="font-bold text-sm">{activeGroup.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{activeGroup.description}</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-1">
                                        <Users className="w-3 h-3" /> Members — {members.length}
                                    </p>
                                    <div className="space-y-3">
                                        {members.map(member => (
                                            <div key={member.id} className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6 shrink-0">
                                                    <AvatarFallback className="text-[10px] bg-accent">
                                                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium truncate">{member.name}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate capitalize">
                                                        {member.role === 'faculty' ? member.department + ' Faculty' : member.role}
                                                    </p>
                                                </div>
                                                {member.group_role === 'admin' && (
                                                    <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">Admin</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-card text-muted-foreground">
                    <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
                    <h3 className="font-semibold text-lg">Your Academic Groups</h3>
                    <p className="text-sm">Select a section or mentorship group to start chatting</p>
                </div>
            )}
        </div>
    )
}
