<h1 align="center">🎓 UIMS 2.0 — University Information Management System</h1>

<p align="center">
  <strong>Master Your Studies, Accelerate Your Career, and Earn While You Learn</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## 📖 About

**UIMS 2.0** is a comprehensive, all-in-one university student portal that seamlessly connects academics, career growth, alumni networking, and AI-powered study tools into a single, beautiful dashboard. Built as a hackathon project for **PIH 2026 Codestorm**.

The platform provides **role-based access** for four user types — **Students**, **Faculty**, **Admins**, and **Alumni** — each with tailored views and capabilities.

---

## ✨ Features

### 📚 Academics Core
- Attendance tracking with visual progress indicators
- Results & grade management
- Assignment submission portal
- Fee management dashboard
- Notice board for university announcements

### 💼 Career & Earning Hub
- Browse and apply for **internships** with filters
- **Freelance gig** marketplace for students
- **Micro-tasks** for quick earning opportunities
- Application history tracker

### 📖 Smart Study System
- **PDF Library** — upload & manage study materials
- **Flashcard Generator** — AI-powered flashcard creation
- **Study Progress** — streak tracking & mastery metrics
- **Notes Manager** — organize and manage notes

### 🤝 Alumni Network
- Searchable alumni directory with filters
- Mentorship & referral request system

### 💬 Social Feed
- Campus social network with posts, likes & comments

### 🛡️ Admin Panel
- Student & faculty management
- Content verification workflows
- Analytics dashboard with charts

### 🎨 Design & UX
- Dark mode by default with light/dark toggle
- Interactive **3D Globe** on the landing page
- Smooth **Framer Motion** animations
- Responsive sidebar with collapsible navigation
- **Recharts** for interactive data visualization

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Bundler** | Vite 7.3 |
| **Styling** | Tailwind CSS 3.4 + tailwindcss-animate |
| **UI Components** | Radix UI (Dialog, Tabs, Select, Tooltip, etc.) |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod validation |
| **HTTP Client** | Axios (with JWT interceptors) |
| **Routing** | React Router DOM v7 |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
src/
├── App.tsx                        # Root component with all routes
├── main.tsx                       # Entry point
├── index.css                      # Global styles + Tailwind config
├── context/
│   ├── AuthContext.tsx             # Authentication state (4 roles)
│   └── ThemeContext.tsx            # Light/dark theme toggle
├── routes/
│   └── ProtectedRoute.tsx         # Role-based route guard
├── layouts/
│   └── DashboardLayout.tsx        # Sidebar + header layout
├── services/
│   └── api.ts                     # Axios instance + API service stubs
├── components/ui/                 # Reusable Radix UI components
│   ├── avatar, badge, button, card, input
│   ├── progress, separator, skeleton, tabs, textarea
├── pages/
│   ├── HeroPage.tsx               # Landing page with 3D Globe
│   ├── LoginPage.tsx              # Multi-role login
│   ├── dashboard/                 # Student Dashboard
│   ├── academics/                 # Academics + Notice Board
│   ├── career/                    # Internships, Freelance, MicroTasks
│   ├── study/                     # PDF, Flashcards, Progress, Notes
│   ├── alumni/                    # Directory + Mentorship
│   ├── social/                    # Social Feed
│   └── admin/                     # Admin Panel
└── lib/utils.ts                   # Utility functions
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/ch4rannn/PIH-2026_Codestorm.git
cd PIH-2026_Codestorm

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at **http://localhost:5173/**

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔐 Authentication

The app supports **4 user roles** with role-based access control:

| Role | Access |
|---|---|
| 🎓 **Student** | Academics, Career Hub, Study Tools, Social Feed |
| 👨‍🏫 **Faculty** | Class management, Attendance, Student lists |
| 🛡️ **Admin** | Full system control, Analytics, Content verification |
| 🤝 **Alumni** | Mentorship, Referrals, Alumni directory |

> **Demo Mode**: Use any email and password to log in with your selected role.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint checks |

---

## 🤝 Team

Built with ❤️ for **PIH 2026 Codestorm Hackathon**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
