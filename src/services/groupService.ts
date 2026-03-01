const API_BASE = 'http://localhost:3001/api/groups'

// We send a mock user ID for demo purposes. 1 = student, 2 = faculty
const getHeaders = (userId: string = '1') => ({
    'Content-Type': 'application/json',
    'x-user-id': userId
})

export interface Group {
    id: number
    name: string
    description: string
    type: 'class' | 'subject' | 'mentorship'
    member_count: number
    user_role: 'admin' | 'member'
    created_at: string
}

export interface Message {
    id: number
    content: string
    created_at: string
    sender_name: string
    sender_role: string
    avatar: string
    sender_id: number
}

export interface GroupMember {
    id: number
    name: string
    role: string
    department: string
    group_role: 'admin' | 'member'
    joined_at: string
}

export async function getMyGroups(userId: string = '1'): Promise<Group[]> {
    const res = await fetch(API_BASE, { headers: getHeaders(userId) })
    if (!res.ok) throw new Error('Failed to fetch groups')
    const data = await res.json()
    return data.groups
}

export async function getGroupMessages(groupId: number, userId: string = '1'): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/${groupId}/messages`, { headers: getHeaders(userId) })
    if (!res.ok) throw new Error('Failed to fetch messages')
    const data = await res.json()
    return data.messages
}

export async function getGroupMembers(groupId: number, userId: string = '1'): Promise<GroupMember[]> {
    const res = await fetch(`${API_BASE}/${groupId}/members`, { headers: getHeaders(userId) })
    if (!res.ok) throw new Error('Failed to fetch members')
    const data = await res.json()
    return data.members
}

export async function sendMessage(groupId: number, content: string, userId: string = '1'): Promise<Message> {
    const res = await fetch(`${API_BASE}/${groupId}/messages`, {
        method: 'POST',
        headers: getHeaders(userId),
        body: JSON.stringify({ content })
    })
    if (!res.ok) throw new Error('Failed to send message')
    return res.json()
}
