# PIH-2026_Codestorm
UIMS

## 🚀 Features

### 🔐 Authentication & Security
- Role-based login (Student / Faculty / Admin)
- JWT token authentication with localStorage persistence
- Protected routes with automatic role-based redirects
- Global auth state via React Context API

### 📊 Student Dashboard
| Module | Description |
|--------|-------------|
| **Overview** | Stat cards — Attendance %, Pending Assignments, Fee Status |
| **Attendance** | Detailed attendance table with subject-wise breakdown |
| **Results** | Semester grades table with CGPA/SGPA summary |
| **Assignments** | View & submit assignments with file upload UI |
| **Notice Board** | University-wide announcements and alerts |
| **Fee Tracking** | Fee breakdown, payment history, and due status |

### 👨‍🏫 Faculty Dashboard
| Module | Description |
|--------|-------------|
| **Mark Attendance** | Interactive checkbox grid per class/section |
| **Upload Marks** | Tabular form for entering student marks |
| **Create Assignments** | Rich assignment creation form |
| **Announcements** | Post and manage class/department announcements |

### 🛡️ Admin Dashboard
| Module | Description |
|--------|-------------|
| **Manage Students** | Full CRUD interface with search & filters |
| **Manage Faculty** | Full CRUD interface with search & filters |
| **Notice Approvals** | Approve or reject submitted notices |
| **Analytics** | Interactive charts & graphs (Recharts) — enrollment trends, attendance, performance |

### ✨ UX & Performance
- 🌙 Dark / Light mode toggle
- 📱 Fully responsive (mobile + tablet + desktop)
- 📦 Lazy-loaded routes for fast initial load
- 💀 Skeleton loaders for async content
- 🔔 Toast notifications (Sonner)
- ✅ Form validation with React Hook Form + Zod
- 🔍 Search, filter & pagination on all tables
- 🚫 Graceful empty states and error boundaries
- ♻️ Reusable component architecture

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS v3 |
| **UI Components** | ShadCN UI |
| **Routing** | React Router v6 |
| **State Management** | React Context API |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **HTTP Client** | Axios (mock-ready) |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **Utilities** | clsx, tailwind-merge, class-variance-authority |

---

## 📁 Project Structure

```
UIMS/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── layout/                # App shell components
│   │   │   ├── Sidebar.jsx        # Collapsible sidebar navigation
│   │   │   ├── Navbar.jsx         # Top bar with profile & dark mode
│   │   │   ├── DashboardLayout.jsx# Main layout wrapper
│   │   │   └── MobileSidebar.jsx  # Sheet-based mobile nav
│   │   ├── shared/                # Reusable components
│   │   │   ├── DataTable.jsx      # Table with search, sort, pagination
│   │   │   ├── StatCard.jsx       # Dashboard metric cards
│   │   │   ├── PageHeader.jsx     # Page title + action buttons
│   │   │   ├── EmptyState.jsx     # No-data placeholder
│   │   │   ├── SkeletonCard.jsx   # Loading skeleton
│   │   │   └── ErrorBoundary.jsx  # Error fallback UI
│   │   └── ui/                    # ShadCN UI primitives (auto-generated)
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       ├── input.jsx
│   │       ├── table.jsx
│   │       └── ...
│   ├── context/
│   │   ├── AuthContext.jsx        # Auth state, login/logout, role
│   │   └── ThemeContext.jsx       # Dark/light mode state
│   ├── data/
│   │   └── mockData.js           # Structured mock datasets
│   ├── hooks/
│   │   ├── useAuth.js            # Auth context hook
│   │   └── useTheme.js           # Theme context hook
│   ├── lib/
│   │   └── utils.js              # cn() helper & utilities
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx     # Login with role selection
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── AttendancePage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── AssignmentsPage.jsx
│   │   │   ├── NoticeBoardPage.jsx
│   │   │   └── FeesPage.jsx
│   │   ├── faculty/
│   │   │   ├── FacultyDashboard.jsx
│   │   │   ├── MarkAttendancePage.jsx
│   │   │   ├── UploadMarksPage.jsx
│   │   │   ├── CreateAssignmentPage.jsx
│   │   │   └── AnnouncementsPage.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── ManageStudentsPage.jsx
│   │       ├── ManageFacultyPage.jsx
│   │       ├── NoticeApprovalsPage.jsx
│   │       └── AnalyticsPage.jsx
│   ├── services/
│   │   ├── api.js                # Axios instance + interceptors
│   │   ├── authService.js        # Auth API calls
│   │   ├── studentService.js     # Student API calls
│   │   ├── facultyService.js     # Faculty API calls
│   │   └── adminService.js       # Admin API calls
│   ├── App.jsx                   # Router + providers
│   ├── index.css                 # Tailwind directives + custom styles
│   └── main.jsx                  # App entry point
├── .gitignore
├── index.html
├── jsconfig.json                 # Path aliases (@/)
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── components.json               # ShadCN config
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or yarn / pnpm)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/UIMS.git
cd UIMS

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at **http://localhost:5173**

### Build for Production

```bash
npm run build
npm run preview    # Preview production build locally
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Student** | student@uims.edu | password123 |
| **Faculty** | faculty@uims.edu | password123 |
| **Admin** | admin@uims.edu | password123 |

> **Note:** Authentication uses mock data. Replace the service layer with real API endpoints for production.

---

## 🖼️ Screenshots

> Screenshots will be added after UI completion.

| Page | Preview |
|------|---------|
| Login | _coming soon_ |
| Student Dashboard | _coming soon_ |
| Faculty Dashboard | _coming soon_ |
| Admin Analytics | _coming soon_ |
| Dark Mode | _coming soon_ |
| Mobile View | _coming soon_ |

---
