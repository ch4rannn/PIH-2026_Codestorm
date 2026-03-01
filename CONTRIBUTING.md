# Contributing to UIMS 2.0

Thank you for contributing to UIMS 2.0! This guide will help the team work together smoothly.

---

## 🌿 Branching Strategy

We follow a **feature-branch workflow** with a protected `main` branch.

```
main          ← production-ready code (protected, no direct pushes)
  └── develop ← integration branch (merge features here first)
       ├── feature/academics-attendance
       ├── feature/career-filters
       ├── fix/login-validation
       └── chore/update-deps
```

### Branch Naming Convention

| Type | Format | Example |
|---|---|---|
| New feature | `feature/<short-description>` | `feature/pdf-upload` |
| Bug fix | `fix/<short-description>` | `fix/login-redirect` |
| Refactor | `refactor/<short-description>` | `refactor/api-layer` |
| Docs | `docs/<short-description>` | `docs/setup-guide` |
| Chore | `chore/<short-description>` | `chore/update-deps` |

---

## 🔄 Development Workflow

### 1. Start a new feature

```bash
# Always start from the latest develop branch
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name
```

### 2. Work on your feature

- Make commits with clear, descriptive messages
- Follow the commit message format below
- Keep commits small and focused

### 3. Push and create a Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name
```

Then open a **Pull Request** on GitHub targeting the `develop` branch.

### 4. Code review & merge

- At least **1 team member** should review the PR
- Resolve any review comments
- Once approved, **squash & merge** into `develop`
- Delete the feature branch after merge

### 5. Release to main

When `develop` is stable, a team lead merges `develop → main`.

---

## 📝 Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat(career): add internship filter by location
fix(auth): handle token expiration correctly
docs(readme): add setup instructions
refactor(dashboard): extract chart into component
chore(deps): update react to v19.2
```

---

## 🏗️ Project Setup

```bash
# Clone the repo
git clone https://github.com/ch4rannn/PIH-2026_Codestorm.git
cd PIH-2026_Codestorm

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## ✅ Before Submitting a PR

- [ ] Code compiles without errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] New features have been tested manually
- [ ] No `console.log` statements left in code
- [ ] Branch is up to date with `develop`

---

## 📂 Where to Add Code

| What you're building | Where to put it |
|---|---|
| New page | `src/pages/<module>/YourPage.tsx` |
| Reusable UI component | `src/components/ui/` |
| New API service | `src/services/api.ts` (add to existing services) |
| New route | `src/App.tsx` (add inside the appropriate route group) |
| Global state | `src/context/` |
| Utility functions | `src/lib/` |

---

## 🤝 Code Style

- **TypeScript** — all files use `.tsx` / `.ts`
- **Tailwind CSS** — use utility classes, avoid inline styles
- **Functional components** — no class components
- **Named exports** for components, **default exports** for pages
- Use `@/` path alias for imports (e.g., `@/components/ui/button`)
