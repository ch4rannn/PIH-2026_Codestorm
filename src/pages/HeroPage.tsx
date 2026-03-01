import { cn } from "@/lib/utils"
import { useRef, useEffect, useCallback, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Menu, SendHorizonal, X, GraduationCap } from "lucide-react"

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
        animRef.current = requestAnimationFrame(draw)
    }, [dotColor, arcColor, markerColor, autoRotateSpeed, connections, markers])

    useEffect(() => { animRef.current = requestAnimationFrame(draw); return () => cancelAnimationFrame(animRef.current) }, [draw])

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
    return (
        <>
            <header>
                <nav data-state={menuState && 'active'} className="group fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent">
                    <div className="m-auto max-w-5xl px-6">
                        <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                            <div className="flex w-full justify-between lg:w-auto">
                                <Link to="/" aria-label="home" className="flex items-center space-x-2"><Logo /></Link>
                                <button onClick={() => setMenuState(!menuState)} aria-label={menuState ? 'Close Menu' : 'Open Menu'} className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                    <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                    <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                                </button>
                            </div>
                            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                                <div className="lg:pr-4">
                                    <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                                        {menuItems.map((item, index) => (
                                            <li key={index}><a href={item.href} className="text-muted-foreground hover:text-accent-foreground block duration-150"><span>{item.name}</span></a></li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                                    <Button asChild variant="outline" size="sm"><Link to="/login"><span>Login</span></Link></Button>
                                    <Button asChild size="sm"><Link to="/login"><span>Get Started</span></Link></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            <main>
                <section className="overflow-hidden">
                    <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-20">
                        <div className="lg:flex lg:items-center lg:gap-12">
                            <div className="relative z-10 mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
                                <Link to="/" className="rounded-lg mx-auto flex w-fit items-center gap-2 border p-1 pr-3 lg:ml-0">
                                    <span className="bg-muted rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs">New</span>
                                    <span className="text-sm">UIMS 2.0 — University Smart Portal</span>
                                    <span className="bg-border block h-4 w-px"></span>
                                    <ArrowRight className="size-4" />
                                </Link>
                                <h1 className="mt-10 text-balance text-4xl font-bold md:text-5xl xl:text-5xl">Your Complete University Ecosystem in One Platform</h1>
                                <p className="mt-8 text-muted-foreground">Academics, career growth, alumni networking, smart study tools, and social engagement — all seamlessly connected for your university journey.</p>
                                <div>
                                    <form action="" className="mx-auto my-10 max-w-sm lg:my-12 lg:ml-0 lg:mr-auto">
                                        <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-[1rem] border pr-1 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                                            <Mail className="text-muted-foreground pointer-events-none absolute inset-y-0 left-5 my-auto size-5" />
                                            <input placeholder="Your university email" className="h-14 w-full bg-transparent pl-12 focus:outline-none" type="email" />
                                            <div className="md:pr-1.5 lg:pr-0">
                                                <Button aria-label="submit">
                                                    <span className="hidden md:block">Get Started</span>
                                                    <SendHorizonal className="relative mx-auto size-5 md:hidden" strokeWidth={2} />
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                    <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                                        <li>Smart Academic Tracking</li>
                                        <li>Career & Earning Hub</li>
                                        <li>AI-Powered Study Tools</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="hidden lg:flex lg:w-1/2 lg:justify-center">
                                <Globe size={500} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-muted/30">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose UIMS 2.0?</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Enhance your university experience with smart, AI-driven tools that keep you ahead of the curve.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { title: 'Unified Experience', desc: 'All your academic and career needs accessible from a single, intuitive dashboard.', icon: <Menu className="w-6 h-6 text-primary" /> },
                                { title: 'Smart Analytics', desc: 'Track your CGPA, attendance, and engagement with beautiful, real-time charts.', icon: <SendHorizonal className="w-6 h-6 text-primary" /> },
                                { title: 'Role-Based Access', desc: 'Personalized views and permissions for students, faculty, alumni, and admins.', icon: <Users className="w-6 h-6 text-primary" /> },
                            ].map((feature, i) => (
                                <div key={i} className="bg-background rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Modules Section */}
                <section id="modules" className="py-24">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Core Modules</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Explore the powerful modules built into the University Smart Portal.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { title: 'Academics Core', desc: 'Track attendance, view results, submit assignments, and manage fee payments.' },
                                { title: 'Career & Earning Hub', desc: 'Find internships, freelance gigs, and micro-tasks tailored to your skills.' },
                                { title: 'Smart Study System', desc: 'Upload PDFs, generate flashcards, and track your study streak and mastery.' },
                                { title: 'Alumni Network', desc: 'Connect with successful alumni for mentorship, referrals, and guidance.' },
                                { title: 'Social Feed', desc: 'Stay updated with university events, announcements, and student achievements.' },
                                { title: 'Admin Controls', desc: 'Comprehensive dashboards for administrators to manage users and verify content.' },
                            ].map((module, i) => (
                                <div key={i} className="flex gap-4 p-6 rounded-2xl border hover:border-primary/50 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                        <ArrowRight className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                                        <p className="text-muted-foreground">{module.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-24 bg-primary text-primary-foreground">
                    <div className="max-w-5xl mx-auto px-6 lg:flex items-center gap-12">
                        <div className="lg:w-1/2 mb-10 lg:mb-0">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-6">About the Portal</h2>
                            <p className="text-primary-foreground/80 text-lg leading-relaxed mb-6">
                                UIMS 2.0 is designed to bridge the gap between academic learning and career readiness. We realized that students needed more than just a place to check their grades — they needed an ecosystem.
                            </p>
                            <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
                                Built with modern web technologies, our portal ensures a seamless, fast, and engaging experience for everyone on campus.
                            </p>
                            <Button variant="secondary" size="lg" asChild>
                                <Link to="/login">Join the Platform</Link>
                            </Button>
                        </div>
                        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                            {[
                                { stat: '10k+', label: 'Active Students' },
                                { stat: '500+', label: 'Faculty Members' },
                                { stat: '1k+', label: 'Alumni Mentors' },
                                { stat: '99%', label: 'Uptime' },
                            ].map((item, i) => (
                                <div key={i} className="bg-primary-foreground/10 p-6 rounded-2xl text-center backdrop-blur-sm border border-primary-foreground/10">
                                    <div className="text-3xl font-bold mb-2">{item.stat}</div>
                                    <div className="text-sm text-primary-foreground/70">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-24">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">Get in Touch</h2>
                        <p className="text-muted-foreground text-lg mb-10">
                            Have questions about the platform or need technical support? Our team is here to help.
                        </p>
                        <form className="max-w-md mx-auto space-y-4 text-left">
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
                        </form>
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
