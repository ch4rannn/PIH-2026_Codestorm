import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard, BookOpen, Briefcase, Users, GraduationCap,
    MessageSquare, LogOut, Sun, Moon,
    Bell, ChevronRight, UserCheck, Shield, BarChart3,
    Menu, ChevronLeft, Search
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

interface MenuItem {
    label: string
    icon: LucideIcon
    path: string
    children?: { label: string; path: string }[]
}

const menuConfig: Record<string, MenuItem[]> = {
    student: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        {
            label: 'Academics', icon: GraduationCap, path: '/academics', children: [
                { label: 'Attendance', path: '/academics/attendance' },
                { label: 'Results', path: '/academics/results' },
                { label: 'Assignments', path: '/academics/assignments' },
                { label: 'Section & Groups', path: '/academics/groups' },
                { label: 'Fee Tracking', path: '/academics/fees' },
            ]
        },
        {
            label: 'Career Hub', icon: Briefcase, path: '/career', children: [
                { label: 'Internships', path: '/career/internships' },
                { label: 'Freelance Gigs', path: '/career/freelance' },
                { label: 'Micro Tasks', path: '/career/microtasks' },
                { label: 'My Applications', path: '/career/applications' },
            ]
        },
        {
            label: 'Study Tools', icon: BookOpen, path: '/study', children: [
                { label: 'PDF Library', path: '/study/pdf' },
                { label: 'Flashcards', path: '/study/flashcards' },
                { label: 'Notes', path: '/study/notes' },
                { label: 'Progress', path: '/study/progress' },
            ]
        },
        {
            label: 'Alumni Network', icon: Users, path: '/alumni', children: [
                { label: 'Directory', path: '/alumni' },
                { label: 'Boost Feed', path: '/alumni/feed' },
                { label: 'Mentorship', path: '/alumni/mentorship' },
                { label: 'Events', path: '/alumni/events' },
                { label: 'Success Stories', path: '/alumni/stories' },
                { label: 'Job Referrals', path: '/alumni/referrals' },
            ]
        },
        { label: 'Social Feed', icon: MessageSquare, path: '/social' },
        { label: 'Notice Board', icon: Bell, path: '/notices' },
    ],
    faculty: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        {
            label: 'Academics', icon: GraduationCap, path: '/academics', children: [
                { label: 'Attendance', path: '/academics/attendance' },
                { label: 'Results', path: '/academics/results' },
                { label: 'Assignments', path: '/academics/assignments' },
                { label: 'Sections', path: '/academics/groups' },
            ]
        },
        { label: 'Social Feed', icon: MessageSquare, path: '/social' },
        { label: 'Notice Board', icon: Bell, path: '/notices' },
        { label: 'Students', icon: Users, path: '/faculty/students' },
    ],
    admin: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Manage Students', icon: Users, path: '/admin/students' },
        { label: 'Manage Faculty', icon: UserCheck, path: '/admin/faculty' },
        { label: 'Verify Content', icon: Shield, path: '/admin/verify' },
        { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
        { label: 'Social Feed', icon: MessageSquare, path: '/social' },
        { label: 'Notice Board', icon: Bell, path: '/notices' },
    ],
    alumni: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        {
            label: 'Alumni Hub', icon: Users, path: '/alumni', children: [
                { label: 'Directory', path: '/alumni' },
                { label: 'Boost Feed', path: '/alumni/feed' },
                { label: 'Mentorship', path: '/alumni/mentorship' },
                { label: 'Events', path: '/alumni/events' },
                { label: 'Donations', path: '/alumni/donations' },
                { label: 'Success Stories', path: '/alumni/stories' },
                { label: 'Job Referrals', path: '/alumni/referrals' },
            ]
        },
        { label: 'Social Feed', icon: MessageSquare, path: '/social' },
        { label: 'Notice Board', icon: Bell, path: '/notices' },
    ],
}

export default function DashboardLayout() {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])

    const role = user?.role || 'student'
    const menu = menuConfig[role] || menuConfig.student

    const toggleSubmenu = (label: string) => {
        setExpandedMenus(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label])
    }

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

    const renderSidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                {sidebarOpen && <span className="font-bold text-lg tracking-tight">UIMS 2.0</span>}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menu.map((item) => (
                    <div key={item.label}>
                        {item.children ? (
                            <>
                                <button
                                    onClick={() => toggleSubmenu(item.label)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isActive(item.path)
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className="w-4 h-4 shrink-0" />
                                    {sidebarOpen && (
                                        <>
                                            <span className="flex-1 text-left">{item.label}</span>
                                            <ChevronRight className={cn("w-3 h-3 transition-transform", expandedMenus.includes(item.label) && "rotate-90")} />
                                        </>
                                    )}
                                </button>
                                {sidebarOpen && expandedMenus.includes(item.label) && (
                                    <div className="ml-7 mt-1 space-y-0.5">
                                        {item.children.map(sub => (
                                            <Link
                                                key={sub.path}
                                                to={sub.path}
                                                onClick={() => setMobileOpen(false)}
                                                className={cn(
                                                    "block px-3 py-2 rounded-md text-sm transition-colors",
                                                    isActive(sub.path)
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                )}
                                            >
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive(item.path)
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            {/* Bottom section */}
            <div className="border-t border-border p-3 space-y-1">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {sidebarOpen && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    {sidebarOpen && <span>Logout</span>}
                </button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0",
                sidebarOpen ? "w-64" : "w-16"
            )}>
                {renderSidebarContent()}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-10">
                        {renderSidebarContent()}
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
                    <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-accent">
                                <Menu className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hidden lg:flex p-2 rounded-lg hover:bg-accent transition-colors"
                            >
                                {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <div className="hidden sm:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
                                <Search className="w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-sm w-40 placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="w-4 h-4" />
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
                            </Button>

                            <Separator orientation="vertical" className="h-6 mx-1" />

                            <div className="flex items-center gap-3 pl-2">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{user?.role}</p>
                                </div>
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
