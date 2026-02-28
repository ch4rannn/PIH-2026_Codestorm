import { cn } from "@/lib/utils"
import { useRef, useEffect, useCallback, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Menu, SendHorizonal, X } from "lucide-react"

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
    <svg viewBox="0 0 78 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('h-5 w-auto', className)}>
        <path d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z" fill="url(#logo-gradient)" />
        <path d="M27.06 7.054V12.239C27.06 12.5903 27.1393 12.8453 27.298 13.004C27.468 13.1513 27.7513 13.225 28.148 13.225H29.338V14.84H27.808C26.9353 14.84 26.2667 14.636 25.802 14.228C25.3373 13.82 25.105 13.157 25.105 12.239V7.054H24V5.473H25.105V3.144H27.06V5.473H29.338V7.054H27.06ZM30.4782 10.114C30.4782 9.17333 30.6709 8.34033 31.0562 7.615C31.4529 6.88967 31.9855 6.32867 32.6542 5.932C33.3342 5.524 34.0822 5.32 34.8982 5.32C35.6349 5.32 36.2752 5.46733 36.8192 5.762C37.3745 6.04533 37.8165 6.40233 38.1452 6.833V5.473H40.1002V14.84H38.1452V13.446C37.8165 13.888 37.3689 14.2563 36.8022 14.551C36.2355 14.8457 35.5895 14.993 34.8642 14.993C34.0595 14.993 33.3229 14.789 32.6542 14.381C31.9855 13.9617 31.4529 13.3837 31.0562 12.647C30.6709 11.899 30.4782 11.0547 30.4782 10.114ZM38.1452 10.148C38.1452 9.502 38.0092 8.941 37.7372 8.465C37.4765 7.989 37.1309 7.62633 36.7002 7.377C36.2695 7.12767 35.8049 7.003 35.3062 7.003C34.8075 7.003 34.3429 7.12767 33.9122 7.377C33.4815 7.615 33.1302 7.972 32.8582 8.448C32.5975 8.91267 32.4672 9.468 32.4672 10.114C32.4672 10.76 32.5975 11.3267 32.8582 11.814C33.1302 12.3013 33.4815 12.6753 33.9122 12.936C34.3542 13.1853 34.8189 13.31 35.3062 13.31C35.8049 13.31 36.2695 13.1853 36.7002 12.936C37.1309 12.6867 37.4765 12.324 37.7372 11.848C38.0092 11.3607 38.1452 10.794 38.1452 10.148ZM43.6317 4.232C43.2803 4.232 42.9857 4.113 42.7477 3.875C42.5097 3.637 42.3907 3.34233 42.3907 2.991C42.3907 2.63967 42.5097 2.345 42.7477 2.107C42.9857 1.869 43.2803 1.75 43.6317 1.75C43.9717 1.75 44.2607 1.869 44.4987 2.107C44.7367 2.345 44.8557 2.63967 44.8557 2.991C44.8557 3.34233 44.7367 3.637 44.4987 3.875C44.2607 4.113 43.9717 4.232 43.6317 4.232ZM44.5837 5.473V14.84H42.6457V5.473H44.5837ZM49.0661 2.26V14.84H47.1281V2.26H49.0661ZM50.9645 10.114C50.9645 9.17333 51.1572 8.34033 51.5425 7.615C51.9392 6.88967 52.4719 6.32867 53.1405 5.932C53.8205 5.524 54.5685 5.32 55.3845 5.32C56.1212 5.32 56.7615 5.46733 57.3055 5.762C57.8609 6.04533 58.3029 6.40233 58.6315 6.833V5.473H60.5865V14.84H58.6315V13.446C58.3029 13.888 57.8552 14.2563 57.2885 14.551C56.7219 14.8457 56.0759 14.993 55.3505 14.993C54.5459 14.993 53.8092 14.789 53.1405 14.381C52.4719 13.9617 51.9392 13.3837 51.5425 12.647C51.1572 11.899 50.9645 11.0547 50.9645 10.114ZM58.6315 10.148C58.6315 9.502 58.4955 8.941 58.2235 8.465C57.9629 7.989 57.6172 7.62633 57.1865 7.377C56.7559 7.12767 56.2912 7.003 55.7925 7.003C55.2939 7.003 54.8292 7.12767 54.3985 7.377C53.9679 7.615 53.6165 7.972 53.3445 8.448C53.0839 8.91267 52.9535 9.468 52.9535 10.114C52.9535 10.76 53.0839 11.3267 53.3445 11.814C53.6165 12.3013 53.9679 12.6753 54.3985 12.936C54.8405 13.1853 55.3052 13.31 55.7925 13.31C56.2912 13.31 56.7559 13.1853 57.1865 12.936C57.6172 12.6867 57.9629 12.324 58.2235 11.848C58.4955 11.3607 58.6315 10.794 58.6315 10.148ZM65.07 6.833C65.3533 6.357 65.7273 5.98867 66.192 5.728C66.668 5.456 67.229 5.32 67.875 5.32V7.326H67.382C66.6227 7.326 66.0447 7.51867 65.648 7.904C65.2627 8.28933 65.07 8.958 65.07 9.91V14.84H63.132V5.473H65.07V6.833ZM73.3624 10.165L77.6804 14.84H75.0624L71.5944 10.811V14.84H69.6564V2.26H71.5944V9.57L74.9944 5.473H77.6804L73.3624 10.165Z" fill="currentColor" />
        <defs><linearGradient id="logo-gradient" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#9B99FE" /><stop offset="1" stopColor="#2BC8B7" /></linearGradient></defs>
    </svg>
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
            </main>
        </>
    )
}
