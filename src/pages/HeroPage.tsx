import { cn } from "@/lib/utils"
import { useRef, useEffect, useCallback, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Menu, SendHorizonal, X, GraduationCap, Users, Moon, Sun } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

import { motion } from "framer-motion"

// ========== GLOBE COMPONENT (User-provided, preserved exactly) ==========

interface GlobeProps {
    className?: string
    size?: number
    dotColor?: string
    arcColor?: string
    markerColor?: string
    autoRotateSpeed?: number
    connections?: { from: [number, number]; to: [number, number] }[]
    markers?: { lat: number; lng: number; label?: string }[]
}

const DEFAULT_MARKERS = [
    { lat: 37.78, lng: -122.42, label: "San Francisco" },
    { lat: 51.51, lng: -0.13, label: "London" },
    { lat: 35.68, lng: 139.69, label: "Tokyo" },
    { lat: -33.87, lng: 151.21, label: "Sydney" },
    { lat: 1.35, lng: 103.82, label: "Singapore" },
    { lat: 55.76, lng: 37.62, label: "Moscow" },
    { lat: -23.55, lng: -46.63, label: "São Paulo" },
    { lat: 19.43, lng: -99.13, label: "Mexico City" },
    { lat: 28.61, lng: 77.21, label: "Delhi" },
    { lat: 36.19, lng: 44.01, label: "Erbil" },
]

const DEFAULT_CONNECTIONS: { from: [number, number]; to: [number, number] }[] = [
    { from: [37.78, -122.42], to: [51.51, -0.13] },
    { from: [51.51, -0.13], to: [35.68, 139.69] },
    { from: [35.68, 139.69], to: [-33.87, 151.21] },
    { from: [37.78, -122.42], to: [1.35, 103.82] },
    { from: [51.51, -0.13], to: [28.61, 77.21] },
    { from: [37.78, -122.42], to: [-23.55, -46.63] },
    { from: [1.35, 103.82], to: [-33.87, 151.21] },
    { from: [28.61, 77.21], to: [36.19, 44.01] },
    { from: [51.51, -0.13], to: [36.19, 44.01] },
]

function latLngToXYZ(lat: number, lng: number, radius: number): [number, number, number] {
    const phi = ((90 - lat) * Math.PI) / 180
    const theta = ((lng + 180) * Math.PI) / 180
    return [-(radius * Math.sin(phi) * Math.cos(theta)), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)]
}

function rotateY(x: number, y: number, z: number, angle: number): [number, number, number] {
    const cos = Math.cos(angle); const sin = Math.sin(angle)
    return [x * cos + z * sin, y, -x * sin + z * cos]
}

function rotateX(x: number, y: number, z: number, angle: number): [number, number, number] {
    const cos = Math.cos(angle); const sin = Math.sin(angle)
    return [x, y * cos - z * sin, y * sin + z * cos]
}

function project(x: number, y: number, z: number, cx: number, cy: number, fov: number): [number, number, number] {
    const scale = fov / (fov + z)
    return [x * scale + cx, y * scale + cy, z]
}

function Globe({
    className, size = 600, dotColor = "rgba(100, 180, 255, ALPHA)", arcColor = "rgba(100, 180, 255, 0.5)",
    markerColor = "rgba(100, 220, 255, 1)", autoRotateSpeed = 0.002,
    connections = DEFAULT_CONNECTIONS, markers = DEFAULT_MARKERS,
}: GlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rotYRef = useRef(0.4)
    const rotXRef = useRef(0.3)
    const dragRef = useRef<{ active: boolean; startX: number; startY: number; startRotY: number; startRotX: number }>({ active: false, startX: 0, startY: 0, startRotY: 0, startRotX: 0 })
    const animRef = useRef<number>(0)
    const timeRef = useRef(0)
    const dotsRef = useRef<[number, number, number][]>([])

    useEffect(() => {
        const dots: [number, number, number][] = []
        const numDots = 1200
        const goldenRatio = (1 + Math.sqrt(5)) / 2
        for (let i = 0; i < numDots; i++) {
            const theta = (2 * Math.PI * i) / goldenRatio
            const phi = Math.acos(1 - (2 * (i + 0.5)) / numDots)
            dots.push([Math.cos(theta) * Math.sin(phi), Math.cos(phi), Math.sin(theta) * Math.sin(phi)])
        }
        dotsRef.current = dots
    }, [])

    const drawRef = useRef<() => void>(() => { })

    const draw = useCallback(() => {
        const canvas = canvasRef.current; if (!canvas) return
        const ctx = canvas.getContext("2d"); if (!ctx) return
        const dpr = window.devicePixelRatio || 1
        const w = canvas.clientWidth; const h = canvas.clientHeight
        canvas.width = w * dpr; canvas.height = h * dpr; ctx.scale(dpr, dpr)
        const cx = w / 2; const cy = h / 2; const radius = Math.min(w, h) * 0.38; const fov = 600
        if (!dragRef.current.active) rotYRef.current += autoRotateSpeed
        timeRef.current += 0.015; const time = timeRef.current
        ctx.clearRect(0, 0, w, h)
        const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5)
        glowGrad.addColorStop(0, "rgba(60, 140, 255, 0.03)"); glowGrad.addColorStop(1, "rgba(60, 140, 255, 0)")
        ctx.fillStyle = glowGrad; ctx.fillRect(0, 0, w, h)
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(100, 180, 255, 0.06)"; ctx.lineWidth = 1; ctx.stroke()
        const ry = rotYRef.current; const rx = rotXRef.current
        for (let i = 0; i < dotsRef.current.length; i++) {
            let [x, y, z] = dotsRef.current[i]; x *= radius; y *= radius; z *= radius;
            [x, y, z] = rotateX(x, y, z, rx);[x, y, z] = rotateY(x, y, z, ry)
            if (z > 0) continue
            const [sx, sy] = project(x, y, z, cx, cy, fov)
            const depthAlpha = Math.max(0.1, 1 - (z + radius) / (2 * radius))
            ctx.beginPath(); ctx.arc(sx, sy, 1 + depthAlpha * 0.8, 0, Math.PI * 2)
            ctx.fillStyle = dotColor.replace("ALPHA", depthAlpha.toFixed(2)); ctx.fill()
        }
        for (const conn of connections) {
            let [x1, y1, z1] = latLngToXYZ(conn.from[0], conn.from[1], radius)
            let [x2, y2, z2] = latLngToXYZ(conn.to[0], conn.to[1], radius);
            [x1, y1, z1] = rotateX(x1, y1, z1, rx);[x1, y1, z1] = rotateY(x1, y1, z1, ry);
            [x2, y2, z2] = rotateX(x2, y2, z2, rx);[x2, y2, z2] = rotateY(x2, y2, z2, ry)
            if (z1 > radius * 0.3 && z2 > radius * 0.3) continue
            const [sx1, sy1] = project(x1, y1, z1, cx, cy, fov)
            const [sx2, sy2] = project(x2, y2, z2, cx, cy, fov)
            const midX = (x1 + x2) / 2; const midY = (y1 + y2) / 2; const midZ = (z1 + z2) / 2
            const midLen = Math.sqrt(midX * midX + midY * midY + midZ * midZ)
            const arcHeight = radius * 1.25
            const [scx, scy] = project((midX / midLen) * arcHeight, (midY / midLen) * arcHeight, (midZ / midLen) * arcHeight, cx, cy, fov)
            ctx.beginPath(); ctx.moveTo(sx1, sy1); ctx.quadraticCurveTo(scx, scy, sx2, sy2)
            ctx.strokeStyle = arcColor; ctx.lineWidth = 1.2; ctx.stroke()
            const t = (Math.sin(time * 1.2 + conn.from[0] * 0.1) + 1) / 2
            const tx = (1 - t) * (1 - t) * sx1 + 2 * (1 - t) * t * scx + t * t * sx2
            const ty = (1 - t) * (1 - t) * sy1 + 2 * (1 - t) * t * scy + t * t * sy2
            ctx.beginPath(); ctx.arc(tx, ty, 2, 0, Math.PI * 2); ctx.fillStyle = markerColor; ctx.fill()
        }
        for (const marker of markers) {
            let [x, y, z] = latLngToXYZ(marker.lat, marker.lng, radius);
            [x, y, z] = rotateX(x, y, z, rx);[x, y, z] = rotateY(x, y, z, ry)
            if (z > radius * 0.1) continue
            const [sx, sy] = project(x, y, z, cx, cy, fov)
            const pulse = Math.sin(time * 2 + marker.lat) * 0.5 + 0.5
            ctx.beginPath(); ctx.arc(sx, sy, 4 + pulse * 4, 0, Math.PI * 2)
            ctx.strokeStyle = markerColor.replace("1)", `${0.2 + pulse * 0.15})`); ctx.lineWidth = 1; ctx.stroke()
            ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, Math.PI * 2); ctx.fillStyle = markerColor; ctx.fill()
            if (marker.label) { ctx.font = "10px system-ui, sans-serif"; ctx.fillStyle = markerColor.replace("1)", "0.6)"); ctx.fillText(marker.label, sx + 8, sy + 3) }
        }
        animRef.current = requestAnimationFrame(drawRef.current)
    }, [dotColor, arcColor, markerColor, autoRotateSpeed, connections, markers])

    useEffect(() => { drawRef.current = draw }, [draw])

    useEffect(() => { animRef.current = requestAnimationFrame(drawRef.current); return () => cancelAnimationFrame(animRef.current) }, [draw])

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, startRotY: rotYRef.current, startRotX: rotXRef.current };
        (e.target as HTMLElement).setPointerCapture(e.pointerId)
    }, [])
    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragRef.current.active) return
        rotYRef.current = dragRef.current.startRotY + (e.clientX - dragRef.current.startX) * 0.005
        rotXRef.current = Math.max(-1, Math.min(1, dragRef.current.startRotX + (e.clientY - dragRef.current.startY) * 0.005))
    }, [])
    const onPointerUp = useCallback(() => { dragRef.current.active = false }, [])

    return (
        <canvas ref={canvasRef} className={cn("w-full h-full cursor-grab active:cursor-grabbing", className)}
            style={{ width: size, height: size }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} />
    )
}

// ========== HERO SECTION (User-provided, adapted from Next.js to React Router) ==========

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'Modules', href: '#modules' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
]

const Logo = ({ className }: { className?: string }) => (
    <div className={cn('flex items-center gap-2.5', className)}>
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight">UIMS 2.0</span>
    </div>
)

export default function HeroPage() {
    const [menuState, setMenuState] = useState(false)
    const [previewRole, setPreviewRole] = useState('Student')
    const { theme, toggleTheme } = useTheme()

    return (
        <>
            <header>
                <nav data-state={menuState && 'active'} className="group fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent">
                    <div className="mx-auto px-6 lg:px-12 xl:px-24 w-full">
                        <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                            <div className="flex w-full justify-between lg:w-auto">
                                <Link to="/" aria-label="home" className="flex items-center space-x-2"><Logo /></Link>
                                <div className="flex items-center gap-4 lg:hidden">
                                    <button onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
                                        {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
                                    </button>
                                    <button onClick={() => setMenuState(!menuState)} aria-label={menuState ? 'Close Menu' : 'Open Menu'} className="relative z-20 block cursor-pointer p-2.5">
                                        <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                        <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                                <div className="lg:pr-4">
                                    <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                                        {menuItems.map((item, index) => (
                                            <li key={index}><a href={item.href} className="text-muted-foreground hover:text-accent-foreground block duration-150"><span>{item.name}</span></a></li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex w-full items-center flex-col space-y-3 sm:flex-row sm:gap-4 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                                    <button onClick={toggleTheme} className="hidden lg:flex text-muted-foreground hover:text-foreground">
                                        {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
                                    </button>
                                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto"><Link to="/login"><span>Login</span></Link></Button>
                                    <Button asChild size="sm" className="w-full sm:w-auto"><Link to="/login"><span>Get Started</span></Link></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            <main>
                <section className="overflow-hidden min-h-screen flex items-center justify-center pt-24 lg:pt-0">
                    <div className="relative mx-auto px-6 lg:px-12 xl:px-24 w-full">
                        <div className="lg:flex lg:items-center lg:gap-12 lg:justify-between">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="relative z-10 mx-auto max-w-2xl text-center lg:ml-0 lg:w-1/2 lg:text-left"
                            >
                                <Link to="/" className="rounded-lg mx-auto flex w-fit items-center gap-2 border p-1 pr-3 lg:ml-0">
                                    <span className="bg-muted rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs">New</span>
                                    <span className="text-sm">UIMS 2.0 — University Smart Portal</span>
                                    <span className="bg-border block h-4 w-px"></span>
                                    <ArrowRight className="size-4" />
                                </Link>
                                <h1 className="mt-10 text-balance text-4xl font-bold md:text-5xl xl:text-6xl">
                                    Master Your Studies, Accelerate Your Career, and <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Earn While You Learn</span>
                                </h1>
                                <p className="mt-8 text-muted-foreground text-lg xl:text-xl">
                                    Your all-in-one university ecosystem. Seamlessly connect academics, career growth, alumni networking, and AI study tools.
                                </p>
                                <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
                                    <Button size="lg" className="rounded-full relative group overflow-hidden" asChild>
                                        <Link to="/login">
                                            <span className="relative z-10 flex items-center gap-2">Enter Portal <ArrowRight className="size-4 group-hover:translate-x-1 duration-200" /></span>
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="rounded-full hover:bg-muted" asChild>
                                        <a href="#features">Explore Features</a>
                                    </Button>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                    className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t pt-8 dark:border-zinc-800"
                                >
                                    {[
                                        { stat: '10k+', label: 'Students' },
                                        { stat: '500+', label: 'Faculty' },
                                        { stat: '1k+', label: 'Mentors' },
                                        { stat: '99%', label: 'Uptime' },
                                    ].map((s, i) => (
                                        <div key={i}>
                                            <div className="text-2xl font-bold text-foreground">{s.stat}</div>
                                            <div className="text-sm text-muted-foreground">{s.label}</div>
                                        </div>
                                    ))}
                                </motion.div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="hidden lg:flex lg:w-1/2 lg:justify-center relative"
                            >
                                <motion.div
                                    animate={{
                                        boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 80px rgba(59, 130, 246, 0.2)", "0px 0px 0px rgba(59, 130, 246, 0)"],
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="rounded-full"
                                >
                                    <Globe size={500} />
                                </motion.div>

                                {/* Floating Tags */}
                                {[
                                    { text: "Internships", top: "10%", left: "10%", delay: 0 },
                                    { text: "Study Tools", top: "20%", right: "5%", delay: 0.2 },
                                    { text: "Alumni Network", bottom: "25%", left: "5%", delay: 0.4 },
                                    { text: "Social Feed", bottom: "15%", right: "15%", delay: 0.6 },
                                    { text: "Earning Hub", top: "50%", right: "-5%", delay: 0.8 },
                                ].map((tag, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
                                        transition={{
                                            opacity: { delay: tag.delay + 0.5, duration: 0.5 },
                                            scale: { delay: tag.delay + 0.5, duration: 0.5 },
                                            y: { duration: 4, repeat: Infinity, delay: tag.delay, ease: "easeInOut" }
                                        }}
                                        className="absolute bg-background/80 backdrop-blur-md border border-border px-3 py-1.5 rounded-full text-sm font-medium text-foreground shadow-lg flex items-center gap-2"
                                        style={{ top: tag.top, left: tag.left, right: tag.right, bottom: tag.bottom }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                        {tag.text}
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
                    <div className="mx-auto px-6 lg:px-12 xl:px-24 w-full relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="text-center mb-20"
                        >
                            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">Why Choose UIMS 2.0?</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Enhance your university experience with smart, AI-driven tools that keep you ahead of the curve.</p>
                        </motion.div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { title: 'Unified Experience', desc: 'All your academic and career needs seamlessly accessible from a single, intuitive dashboard.', icon: <Menu className="w-6 h-6 text-primary group-hover:animate-pulse" /> },
                                { title: 'Smart Analytics', desc: 'Track your CGPA, attendance, and engagement with beautiful, real-time interactive charts.', icon: <SendHorizonal className="w-6 h-6 text-primary group-hover:-translate-y-1 transition-transform" /> },
                                { title: 'Role-Based Access', desc: 'Personalized views and precision permissions for students, faculty, alumni, and admins.', icon: <Users className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" /> },
                            ].map((feature, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    key={i}
                                    className="group relative bg-background/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-lg hover:shadow-primary/25 hover:border-primary/50 transition-all duration-300"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner shadow-primary/20">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Modules Section */}
                <section id="modules" className="py-32 bg-muted/30 relative">
                    <div className="mx-auto px-6 lg:px-12 xl:px-24 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="text-center mb-20"
                        >
                            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">Core Modules</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Explore the powerful modules built into the University Smart Portal.</p>
                        </motion.div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: 'Academics Core', desc: 'Track attendance, view results, submit assignments, and manage fee payments. Get AI-powered insights on your performance.' },
                                { title: 'Career & Earning Hub', desc: 'Find internships, freelance gigs, and micro-tasks precisely tailored to your unique skill set and major.' },
                                { title: 'Smart Study System', desc: 'Upload PDFs, generate flashcards automatically, and track your study streak and mastery with built-in spaced repetition.' },
                                { title: 'Alumni Network', desc: 'Connect with successful alumni for 1-on-1 mentorship, job referrals, and career guidance.' },
                                { title: 'Social Feed', desc: 'Stay perfectly updated with university events, announcements, club activities, and student achievements.' },
                                { title: 'Admin Controls', desc: 'Comprehensive dashboards for administrators to manage users, verify content, and oversee the entire ecosystem.' },
                            ].map((module, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ scale: 1.03 }}
                                    key={i}
                                    className="group relative flex flex-col justify-between p-8 rounded-3xl border border-border/50 bg-background/50 hover:bg-background/80 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
                                >
                                    <div>
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                                            <ArrowRight className="w-5 h-5 text-primary group-hover:rotate-45 transition-transform" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 tracking-tight">{module.title}</h3>
                                        <p className="text-muted-foreground mb-6 line-clamp-3 group-hover:line-clamp-none transition-all">{module.desc}</p>
                                    </div>
                                    <div className="mt-auto pt-6 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" className="w-full justify-between hover:bg-primary/10 hover:text-primary">
                                            View Module <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Platform Preview Section */}
                <section id="preview" className="py-32 overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"></div>
                    <div className="mx-auto px-6 lg:px-12 xl:px-24 w-full relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">Experience the Platform</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">Get a glimpse of the unified dashboard tailored for every role.</p>

                            <div className="flex justify-center gap-2 mb-12">
                                {['Student', 'Faculty', 'Admin'].map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setPreviewRole(role)}
                                        className={cn("px-6 py-2.5 rounded-full text-sm font-medium transition-all", previewRole === role ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                                    >
                                        {role} View
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="mx-auto max-w-5xl rounded-t-2xl border-t border-l border-r border-border/50 bg-background shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="aspect-[16/9] bg-zinc-100 dark:bg-zinc-900/50 p-4 sm:p-8">
                                {/* Dummy Dashboard UI */}
                                <motion.div
                                    key={previewRole}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="grid grid-cols-4 gap-4 sm:gap-6 h-full"
                                >
                                    {/* Sidebar */}
                                    <div className="col-span-1 flex flex-col gap-4">
                                        <div className="h-8 sm:h-10 bg-background rounded-lg border border-border flex items-center px-4 gap-3">
                                            <div className="w-4 h-4 rounded-full bg-primary/40 shrink-0"></div>
                                            <div className="w-16 h-2 rounded-full bg-muted-foreground/30 hidden sm:block"></div>
                                        </div>
                                        <div className="flex-1 bg-background rounded-lg border border-border p-2 sm:p-4 flex flex-col gap-3">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="flex items-center gap-3 p-1 sm:p-2 rounded-md hover:bg-muted transition-colors">
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-muted-foreground/20 shrink-0"></div>
                                                    <div className="w-full h-2 rounded-full bg-muted-foreground/20 hidden sm:block"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="col-span-3 flex flex-col gap-4 sm:gap-6">
                                        {/* Top Stats */}
                                        <div className="grid grid-cols-3 gap-4 sm:gap-6">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-16 sm:h-24 bg-background rounded-xl sm:rounded-2xl border border-border shadow-sm p-3 sm:p-4 flex flex-col justify-between">
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary/50 rounded-full"></div>
                                                    </div>
                                                    <div className="w-12 sm:w-16 h-2 sm:h-3 rounded-full bg-foreground/20 mt-auto"></div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Bottom Area */}
                                        <div className="grid grid-cols-3 gap-4 sm:gap-6 flex-1">
                                            <div className="col-span-2 bg-background rounded-xl sm:rounded-2xl border border-border shadow-sm p-4 sm:p-6 flex flex-col gap-4">
                                                <div className="w-24 sm:w-32 h-3 sm:h-4 rounded-full bg-foreground/20 mb-2"></div>

                                                {previewRole === 'Student' && (
                                                    <div className="flex-1 rounded-xl bg-gradient-to-t from-primary/10 to-transparent border border-border flex items-end p-2 sm:p-4 gap-1 sm:gap-2">
                                                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                                            <div key={i} className="flex-1 bg-primary/40 rounded-t-sm sm:rounded-t-md transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                                        ))}
                                                    </div>
                                                )}

                                                {previewRole === 'Faculty' && (
                                                    <div className="flex-1 flex flex-col gap-2 sm:gap-3">
                                                        {[1, 2, 3, 4].map(i => (
                                                            <div key={i} className="w-full flex-1 rounded-lg bg-muted flex items-center px-3 sm:px-4 gap-3 sm:gap-4">
                                                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-foreground/20 shrink-0"></div>
                                                                <div className="w-20 sm:w-32 h-2 rounded-full bg-foreground/20"></div>
                                                                <div className="ml-auto w-8 sm:w-12 h-3 sm:h-4 rounded-lg bg-primary/20"></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {previewRole === 'Admin' && (
                                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                                        <div className="rounded-xl border border-border border-dashed flex items-center justify-center p-4">
                                                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 sm:border-[6px] border-primary/20 border-t-primary border-l-primary/60 animate-[spin_3s_linear_infinite]"></div>
                                                        </div>
                                                        <div className="flex flex-col justify-center gap-4">
                                                            {[1, 2, 3].map(i => (
                                                                <div key={i} className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary/60 shrink-0"></div>
                                                                    <div className="w-full h-2 rounded-full bg-foreground/20"></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-span-1 bg-background rounded-xl sm:rounded-2xl border border-border shadow-sm p-4 sm:p-5 flex flex-col gap-4 overflow-hidden">
                                                <div className="w-20 sm:w-24 h-3 sm:h-4 rounded-full bg-foreground/20 mb-2"></div>
                                                <div className="flex flex-col gap-3 sm:gap-4 flex-1">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <div key={i} className="flex items-start gap-2 sm:gap-3">
                                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted shrink-0 mt-0.5 sm:mt-1"></div>
                                                            <div className="flex flex-col gap-1.5 sm:gap-2 w-full pt-1">
                                                                <div className="w-full h-1.5 sm:h-2 rounded-full bg-foreground/30"></div>
                                                                <div className="w-2/3 h-1.5 sm:h-2 rounded-full bg-foreground/10"></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Social Proof Section */}
                <section id="testimonials" className="py-32 bg-muted/30">
                    <div className="mx-auto px-6 lg:px-12 xl:px-24 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="text-center mb-20"
                        >
                            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">Loved by the Campus</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">See what our students and alumni have to say about UIMS 2.0.</p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { name: "Sarah J.", role: "Computer Science '25", text: "The Smart Study System completely changed my prep. Generating flashcards from my lecture PDFs saved me hundreds of hours." },
                                { name: "David M.", role: "Alumni Mentor", text: "I love being able to connect with current students and refer them to roles at my company. The alumni directory is incredibly well-built." },
                                { name: "Prof. Alan T.", role: "Faculty, Engineering", text: "Having attendance, grading, and assignments all unified in one seamless interface makes my administrative work so much easier." },
                            ].map((review, i) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: i * 0.1 }}
                                    key={i}
                                    className="bg-background rounded-3xl p-8 border border-border shadow-sm relative"
                                >
                                    <div className="flex text-yellow-500 mb-6 gap-1">
                                        {[1, 2, 3, 4, 5].map(star => <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>)}
                                    </div>
                                    <p className="text-muted-foreground text-lg italic mb-8">"{review.text}"</p>
                                    <div className="flex items-center gap-4 mt-auto">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">{review.name.charAt(0)}</div>
                                        <div>
                                            <div className="font-bold text-foreground">{review.name}</div>
                                            <div className="text-sm text-muted-foreground">{review.role}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-24 bg-background border-y">
                    <div className="mx-auto px-6 lg:px-12 xl:px-24 w-full text-center max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <h2 className="text-3xl lg:text-4xl font-bold mb-6">About the Portal</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                                UIMS 2.0 is designed to bridge the gap between academic learning and career readiness. We realized that students needed more than just a place to check their grades — they needed a complete ecosystem.
                            </p>
                            <Button variant="default" size="lg" className="mt-4 rounded-full" asChild>
                                <Link to="/login">Join the Platform Today</Link>
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-24">
                    <div className="mx-auto px-6 lg:px-12 xl:px-24 w-full text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Get in Touch</h2>
                            <p className="text-muted-foreground text-lg mb-10">
                                Have questions about the platform or need technical support? Our team is here to help.
                            </p>
                        </motion.div>
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: 0.2 }}
                            className="max-w-md mx-auto space-y-4 text-left"
                        >
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Name</label>
                                <input type="text" className="w-full h-10 px-3 rounded-md border bg-background" placeholder="Your name" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Email</label>
                                <input type="email" className="w-full h-10 px-3 rounded-md border bg-background" placeholder="your@email.com" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Message</label>
                                <textarea className="w-full p-3 rounded-md border bg-background min-h-[120px]" placeholder="How can we help?" />
                            </div>
                            <Button className="w-full">Send Message</Button>
                        </motion.form>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t">
                <div className="max-w-5xl mx-auto px-6 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} UIMS 2.0 University Smart Portal. All rights reserved.</p>
                </div>
            </footer>
        </>
    )
}
