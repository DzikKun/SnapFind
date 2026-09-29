# SnapFind Project Refactor Blueprint

**Tujuan**: Optimasi, efisiensi hierarki, cleanup files yang tidak perlu, dan standarisasi struktur project.

**Target**: AI agent untuk eksekusi refactor otomatis atau semi-otomatis.

---

## 📋 EXECUTIVE SUMMARY

**Status Saat Ini**: Project terasa berantakan dengan:
- ❌ 50+ UI components (dari ShadcnUI) yang tidak semua terpakai
- ❌ File struktur yang besar (struktur.txt, struktur2.txt, strukturlast.txt) di-track di Git
- ❌ node_modules ter-commit ke repo
- ❌ Backend/database logic tercampur di satu file
- ❌ Tidak ada clear separation of concerns di folder structure
- ❌ Konteks dan hooks tidak terorganisir

**Target Akhir**: 
- ✅ Clean, scalable folder hierarchy
- ✅ Hanya UI components yang benar-benar digunakan
- ✅ Proper .gitignore
- ✅ Modular backend structure
- ✅ Better type definitions
- ✅ Clear docs for each module

---

## 🗂️ PROPOSED NEW FOLDER STRUCTURE

```
SnapFind/
│
├── .gitignore                          # UPDATED: proper ignore rules
├── .env.example                        # NEW: environment template
├── README.md                           # KEEP: project description
├── DOKUMENTASI_LOGIKA_SISTEM.md       # KEEP: system documentation
├── REFACTOR_BLUEPRINT.md               # THIS FILE
├── CONTRIBUTING.md                     # NEW: contribution guidelines
│
├── package.json                        # KEEP: but review dependencies
├── package-lock.json                   # KEEP
├── tsconfig.json                       # KEEP
├── vite.config.ts                      # KEEP
├── postcss.config.mjs                  # KEEP
├── tailwind.config.js                  # (if exists, KEEP)
│
├── index.html                          # KEEP: entry point
│
├── public/                             # KEEP: static assets
│   └── (keep existing assets)
│
├── src/                                # Frontend source
│   ├── main.tsx                        # KEEP: React entry
│   │
│   ├── app/                            # Application logic
│   │   ├── App.tsx                     # KEEP: App wrapper
│   │   ├── routes.tsx                  # KEEP: Router definition
│   │   │
│   │   ├── contexts/                   # NEW: Global state
│   │   │   ├── AuthContext.tsx         # KEEP: Auth state
│   │   │   ├── ThemeContext.tsx        # NEW: if using theme
│   │   │   └── index.ts                # NEW: centralized exports
│   │   │
│   │   ├── hooks/                      # Custom React hooks
│   │   │   ├── useAuth.ts              # NEW: extract from context
│   │   │   ├── useFetch.ts             # NEW: centralized API calls
│   │   │   ├── useLocalStorage.ts      # NEW: persistent state
│   │   │   └── index.ts                # NEW: exports
│   │   │
│   │   ├── services/                   # NEW: API & business logic
│   │   │   ├── api.ts                  # NEW: API client setup (axios/fetch)
│   │   │   ├── auth.service.ts         # NEW: auth API calls
│   │   │   ├── photo.service.ts        # NEW: photo upload/search
│   │   │   ├── event.service.ts        # NEW: event management
│   │   │   ├── payment.service.ts      # NEW: payment related
│   │   │   ├── admin.service.ts        # NEW: admin operations
│   │   │   └── index.ts                # NEW: exports
│   │   │
│   │   ├── types/                      # TypeScript definitions
│   │   │   ├── index.ts                # NEW: main types
│   │   │   ├── auth.types.ts           # NEW: auth types
│   │   │   ├── photo.types.ts          # NEW: photo types
│   │   │   ├── event.types.ts          # NEW: event types
│   │   │   ├── payment.types.ts        # NEW: payment types
│   │   │   ├── common.types.ts         # NEW: shared types
│   │   │   └── api.types.ts            # NEW: API response types
│   │   │
│   │   ├── utils/                      # Utility functions
│   │   │   ├── constants.ts            # NEW: app constants
│   │   │   ├── validators.ts           # NEW: form validators
│   │   │   ├── formatters.ts           # NEW: data formatting
│   │   │   ├── errors.ts               # NEW: error handling
│   │   │   └── index.ts                # NEW: exports
│   │   │
│   │   ├── components/                 # UI Components
│   │   │   ├── layout/                 # NEW: Layout components
│   │   │   │   ├── Root.tsx            # MOVE: from root
│   │   │   │   ├── Header.tsx          # NEW: if exists
│   │   │   │   ├── Sidebar.tsx         # NEW: navigation
│   │   │   │   ├── Footer.tsx          # NEW: if exists
│   │   │   │   └── ProtectedRoute.tsx  # MOVE: from root
│   │   │   │
│   │   │   ├── common/                 # NEW: Reusable components
│   │   │   │   ├── LoadingSpinner.tsx  # NEW
│   │   │   │   ├── ErrorBoundary.tsx   # NEW
│   │   │   │   ├── EmptyState.tsx      # NEW
│   │   │   │   ├── ConfirmDialog.tsx   # NEW
│   │   │   │   └── index.ts            # NEW: exports
│   │   │   │
│   │   │   ├── forms/                  # NEW: Form components
│   │   │   │   ├── LoginForm.tsx       # NEW
│   │   │   │   ├── PhotoUploadForm.tsx # NEW
│   │   │   │   ├── EventForm.tsx       # NEW
│   │   │   │   └── index.ts            # NEW: exports
│   │   │   │
│   │   │   ├── cards/                  # NEW: Card components
│   │   │   │   ├── PhotoCard.tsx       # NEW
│   │   │   │   ├── EventCard.tsx       # NEW
│   │   │   │   ├── StatCard.tsx        # NEW
│   │   │   │   └── index.ts            # NEW: exports
│   │   │   │
│   │   │   ├── ui/                     # UI Library (ShadcnUI)
│   │   │   │   ├── button.tsx          # KEEP: only used ones
│   │   │   │   ├── card.tsx            # KEEP
│   │   │   │   ├── dialog.tsx          # KEEP
│   │   │   │   ├── input.tsx           # KEEP
│   │   │   │   ├── label.tsx           # KEEP
│   │   │   │   ├── tabs.tsx            # KEEP
│   │   │   │   ├── table.tsx           # KEEP
│   │   │   │   ├── badge.tsx           # KEEP
│   │   │   │   ├── skeleton.tsx        # KEEP
│   │   │   │   ├── alert.tsx           # KEEP
│   │   │   │   ├── select.tsx          # KEEP
│   │   │   │   ├── checkbox.tsx        # KEEP
│   │   │   │   ├── radio-group.tsx     # KEEP
│   │   │   │   ├── progress.tsx        # KEEP
│   │   │   │   ├── separator.tsx       # KEEP
│   │   │   │   ├── scroll-area.tsx     # KEEP
│   │   │   │   ├── form.tsx            # KEEP
│   │   │   │   ├── tooltip.tsx         # KEEP
│   │   │   │   ├── avatar.tsx          # KEEP
│   │   │   │   ├── dropdown-menu.tsx   # KEEP
│   │   │   │   ├── popover.tsx         # KEEP
│   │   │   │   ├── sheet.tsx           # KEEP
│   │   │   │   ├── switch.tsx          # KEEP
│   │   │   │   ├── textarea.tsx        # KEEP
│   │   │   │   ├── use-mobile.ts       # KEEP
│   │   │   │   ├── utils.ts            # KEEP
│   │   │   │   └── index.ts            # NEW: centralized exports
│   │   │   │
│   │   │   ├── pages/                  # NEW: Page components
│   │   │   │   ├── Home/
│   │   │   │   │   ├── index.tsx       # MOVE: Home.tsx
│   │   │   │   │   └── Home.module.css # NEW: if needed
│   │   │   │   │
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── Login/
│   │   │   │   │   │   └── index.tsx   # MOVE: Login.tsx
│   │   │   │   │   └── index.ts        # exports
│   │   │   │   │
│   │   │   │   ├── User/
│   │   │   │   │   ├── Dashboard/
│   │   │   │   │   │   └── index.tsx   # MOVE: UserDashboard.tsx
│   │   │   │   │   ├── SearchPhotos/
│   │   │   │   │   │   └── index.tsx   # MOVE: SearchPhotos.tsx
│   │   │   │   │   ├── Gallery/
│   │   │   │   │   │   └── index.tsx   # MOVE: Gallery.tsx
│   │   │   │   │   └── index.ts        # exports
│   │   │   │   │
│   │   │   │   ├── Photographer/
│   │   │   │   │   ├── Dashboard/
│   │   │   │   │   │   └── index.tsx   # MOVE: PhotographerDashboard.tsx
│   │   │   │   │   └── index.ts        # exports
│   │   │   │   │
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── Dashboard/
│   │   │   │   │   │   └── index.tsx   # MOVE: AdminDashboard.tsx
│   │   │   │   │   └── index.ts        # exports
│   │   │   │   │
│   │   │   │   ├── Error/
│   │   │   │   │   ├── NotFound/
│   │   │   │   │   │   └── index.tsx   # MOVE: NotFound.tsx
│   │   │   │   │   └── index.ts        # exports
│   │   │   │   │
│   │   │   │   ├── PaymentDoc/
│   │   │   │   │   └── index.tsx       # MOVE: PaymentDoc.tsx
│   │   │   │   │
│   │   │   │   └── index.ts            # NEW: centralized exports
│   │   │   │
│   │   │   └── index.ts                # NEW: component exports
│   │   │
│   │   └── index.ts                    # NEW: app exports
│   │
│   └── styles/                         # Styling
│       ├── index.css                   # KEEP: global styles
│       ├── variables.css               # NEW: CSS variables
│       ├── components.css              # NEW: component styles
│       └── animations.css              # NEW: animations
│
├── backend/                            # Backend server
│   ├── server.cjs                      # KEEP: Express setup
│   │
│   ├── config/                         # NEW: Configuration
│   │   ├── env.cjs                     # NEW: env variables
│   │   ├── constants.cjs               # NEW: backend constants
│   │   └── index.cjs                   # NEW: exports
│   │
│   ├── middleware/                     # NEW: Express middleware
│   │   ├── auth.middleware.cjs         # NEW: auth validation
│   │   ├── error.middleware.cjs        # NEW: error handling
│   │   ├── upload.middleware.cjs       # NEW: multer setup
│   │   └── index.cjs                   # NEW: exports
│   │
│   ├── routes/                         # NEW: API routes
│   │   ├── auth.routes.cjs             # NEW: login, logout
│   │   ├── photo.routes.cjs            # NEW: upload, search
│   │   ├── event.routes.cjs            # NEW: event operations
│   │   ├── payment.routes.cjs          # NEW: payment callbacks
│   │   ├── admin.routes.cjs            # NEW: admin endpoints
│   │   └── index.cjs                   # NEW: route aggregator
│   │
│   ├── controllers/                    # NEW: Business logic
│   │   ├── auth.controller.cjs         # NEW: auth logic
│   │   ├── photo.controller.cjs        # NEW: photo logic
│   │   ├── event.controller.cjs        # NEW: event logic
│   │   ├── payment.controller.cjs      # NEW: payment logic
│   │   ├── admin.controller.cjs        # NEW: admin logic
│   │   └── index.cjs                   # NEW: exports
│   │
│   ├── services/                       # NEW: Data layer (extract from database.cjs)
│   │   ├── db.service.cjs              # NEW: database CRUD operations
│   │   ├── face-match.service.cjs      # NEW: Python face-matching wrapper
│   │   ├── file.service.cjs            # NEW: file operations (upload, delete)
│   │   ├── watermark.service.cjs       # NEW: watermarking logic
│   │   └── index.cjs                   # NEW: exports
│   │
│   ├── utils/                          # NEW: Utility functions
│   │   ├── validators.cjs              # NEW: input validation
│   │   ├── errors.cjs                  # NEW: custom error classes
│   │   ├── logger.cjs                  # NEW: logging utility
│   │   └── index.cjs                   # NEW: exports
│   │
│   ├── database/                       # KEEP: Data storage
│   │   ├── db.json                     # KEEP: JSON database
│   │   └── snapfind_schema.sql         # KEEP: SQL schema for production
│   │
│   ├── models/                         # KEEP: ML models
│   │   └── (keep existing ML models)
│   │
│   ├── scripts/                        # NEW: Helper scripts
│   │   ├── setup-database.cjs          # MOVE: from root
│   │   ├── download-models.bat         # MOVE: from root
│   │   └── seed-demo-data.cjs          # NEW: populate demo data
│   │
│   ├── ai/                             # NEW: Python AI scripts
│   │   ├── match_engine.py             # MOVE: face-matching
│   │   ├── requirements.txt            # NEW: Python dependencies
│   │   └── README.md                   # NEW: Python setup guide
│   │
│   ├── uploads/                        # KEEP: User uploaded photos
│   │   ├── temp/                       # NEW: temporary uploads (selfies)
│   │   └── photos/                     # NEW: permanent photo storage
│   │
│   └── .env.example                    # NEW: backend env template
│
├── database/                           # KEEP: Database schemas
│   ├── snapfind_schema.sql             # KEEP
│   └── migrations/                     # NEW: DB migration scripts
│
├── guidelines/                         # KEEP: Design guidelines (if any)
│   └── (keep existing)
│
├── docs/                               # NEW: Documentation
│   ├── API.md                          # NEW: API documentation
│   ├── SETUP.md                        # NEW: local development setup
│   ├── DEPLOYMENT.md                   # NEW: production deployment
│   ├── ARCHITECTURE.md                 # NEW: architecture overview
│   └── COMPONENTS.md                   # NEW: component library docs
│
├── .github/                            # NEW: GitHub automation (optional)
│   ├── workflows/
│   │   ├── lint.yml                    # NEW: linting CI
│   │   └── test.yml                    # NEW: testing CI
│   └── ISSUE_TEMPLATE/
│
├── dist/                               # BUILD OUTPUT (ignore in git)
├── .env                                # ENVIRONMENT (ignore in git)
└── node_modules/                       # DEPENDENCIES (ignore in git)
```

---

## 📝 GITIGNORE - CRITICAL UPDATES

**Current Issue**: node_modules, struktur*.txt, .env tracked in Git!

**New .gitignore** (comprehensive):

```gitignore
# Dependencies
node_modules/
*.pnp
*.pnp.js
package-lock.json
yarn.lock

# Production
/dist
/build
/.next
/out

# Misc
.DS_Store
*.pem
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.project
.settings
.classpath
*.sublime-project
*.sublime-workspace

# OS
.DS_Store
Thumbs.db
ehthumbs.db

# Project specific
backend/uploads/
backend/models/*.bin
backend/models/*.pb
backend/.env
backend/.env.local
struktur*.txt
strukturlast.txt

# Testing
.nyc_output
coverage

# Temporary files
tmp/
temp/
*.tmp
*.log~

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv
```

---

## 🎯 UI COMPONENTS - CLEANUP

**Current**: 50+ ShadcnUI components, but likely only using ~20% of them.

**Action Plan**:

### Step 1: Audit used components
- [ ] Search codebase for imports from `@/app/components/ui/*`
- [ ] List all components actually used in pages
- [ ] List all components that are unused

### Step 2: Keep (Definitely Used)
```
KEEP: button, card, dialog, input, label, tabs, table, badge, 
      skeleton, alert, select, checkbox, radio-group, progress, 
      separator, scroll-area, form, tooltip, avatar, dropdown-menu, 
      popover, sheet, switch, textarea, use-mobile, utils
```

### Step 3: Remove (Unused)
```
REMOVE: accordion, alert-dialog, aspect-ratio, breadcrumb, calendar, 
        carousel, chart, collapsible, command, context-menu, drawer, 
        hover-card, input-otp, menubar, navigation-menu, pagination, 
        resizable, slider, sonner, toggle, toggle-group
```

**Rationale**: Hanya keep komponen yang actually digunakan di pages. Remove mengurangi bundle size dan cognitive load.

---

## 🔄 BACKEND REFACTORING

### Current State
- `server.cjs`: 17.5KB monolith dengan semua logic tercampur
- `database.cjs`: Mixed authentication + database operations
- `match_engine.py`: Face-matching tapi integrasi kurang clean

### Target State
```
Separation of Concerns:
- Routes: Handle HTTP request/response
- Controllers: Orchestrate requests → services
- Services: Pure business logic
- Database: Data access layer only
```

### Example Refactor: Auth Flow

**Before (monolith server.cjs)**:
```javascript
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // validation
  // auth logic
  // session
  // response
  // all in one function 😱
});
```

**After (modular)**:
```
POST /api/login
  ↓
routes/auth.routes.cjs (validates request)
  ↓
controllers/auth.controller.cjs (orchestrates)
  ↓
services/db.service.cjs (actual auth check)
  ↓
database/db.json (data)
```

---

## 📦 DEPENDENCIES - REVIEW & OPTIMIZE

### Action: Review & Clean

```bash
# Check for unused dependencies
npm ls --depth=0

# Check for security issues
npm audit

# Check for outdated packages
npm outdated
```

### Recommended Actions

**Remove (likely unused)**:
- Any chart library if not using charts
- Any animation library if using CSS only
- Any i18n library if app is single language

**Add/Update (if missing)**:
- `axios` or `fetch` wrapper (centralized API calls)
- `zod` or `yup` (form validation)
- `dotenv` (environment variables)
- `express-cors` (if needed)
- `helmet` (security headers)
- `morgan` (HTTP logging)

---

## 🗂️ FILE MOVEMENTS - CHECKLIST

### FRONTEND FILES

**Components → Better hierarchy**:
```
src/app/pages/Home.tsx          → src/app/components/pages/Home/index.tsx
src/app/pages/Login.tsx         → src/app/components/pages/Auth/Login/index.tsx
src/app/pages/UserDashboard.tsx → src/app/components/pages/User/Dashboard/index.tsx
src/app/pages/SearchPhotos.tsx  → src/app/components/pages/User/SearchPhotos/index.tsx
src/app/pages/Gallery.tsx       → src/app/components/pages/User/Gallery/index.tsx
src/app/pages/PhotographerDashboard.tsx → src/app/components/pages/Photographer/Dashboard/index.tsx
src/app/pages/AdminDashboard.tsx → src/app/components/pages/Admin/Dashboard/index.tsx
src/app/pages/PaymentDoc.tsx    → src/app/components/pages/PaymentDoc/index.tsx
src/app/pages/NotFound.tsx      → src/app/components/pages/Error/NotFound/index.tsx

src/app/components/Root.tsx     → src/app/components/layout/Root.tsx
src/app/components/ProtectedRoute.tsx → src/app/components/layout/ProtectedRoute.tsx
```

**New files to create**:
```
src/app/services/auth.service.ts
src/app/services/photo.service.ts
src/app/services/event.service.ts
src/app/services/payment.service.ts
src/app/services/admin.service.ts
src/app/services/api.ts (axios/fetch setup)

src/app/types/auth.types.ts
src/app/types/photo.types.ts
src/app/types/event.types.ts
src/app/types/payment.types.ts
src/app/types/common.types.ts

src/app/utils/constants.ts
src/app/utils/validators.ts
src/app/utils/formatters.ts
src/app/utils/errors.ts

src/app/hooks/useAuth.ts
src/app/hooks/useFetch.ts
src/app/hooks/useLocalStorage.ts

src/app/components/common/ErrorBoundary.tsx
src/app/components/common/LoadingSpinner.tsx
src/app/components/common/EmptyState.tsx
src/app/components/common/ConfirmDialog.tsx

src/app/components/cards/PhotoCard.tsx
src/app/components/cards/EventCard.tsx

src/app/components/forms/LoginForm.tsx
src/app/components/forms/PhotoUploadForm.tsx
```

### BACKEND FILES

**Backend refactoring**:
```
backend/server.cjs → Extract routes/controllers/services
backend/database.cjs → Split into:
  - backend/services/db.service.cjs (CRUD)
  - backend/middleware/auth.middleware.cjs
  - backend/controllers/auth.controller.cjs

backend/match_engine.py → backend/ai/match_engine.py
backend/setup-database.cjs → backend/scripts/setup-database.cjs
backend/download-models.bat → backend/scripts/download-models.bat
```

**New backend files**:
```
backend/config/env.cjs
backend/config/constants.cjs

backend/middleware/auth.middleware.cjs
backend/middleware/error.middleware.cjs
backend/middleware/upload.middleware.cjs

backend/routes/auth.routes.cjs
backend/routes/photo.routes.cjs
backend/routes/event.routes.cjs
backend/routes/payment.routes.cjs
backend/routes/admin.routes.cjs

backend/controllers/auth.controller.cjs
backend/controllers/photo.controller.cjs
backend/controllers/event.controller.cjs
backend/controllers/payment.controller.cjs
backend/controllers/admin.controller.cjs

backend/services/db.service.cjs
backend/services/face-match.service.cjs
backend/services/file.service.cjs
backend/services/watermark.service.cjs

backend/utils/validators.cjs
backend/utils/errors.cjs
backend/utils/logger.cjs

backend/scripts/seed-demo-data.cjs
backend/ai/requirements.txt
backend/ai/README.md
```

### DOCS

**New documentation**:
```
docs/API.md
docs/SETUP.md
docs/DEPLOYMENT.md
docs/ARCHITECTURE.md
docs/COMPONENTS.md
.env.example (root)
backend/.env.example
```

---

## 🎬 EXECUTION STEPS FOR AI AGENT

### Phase 1: Preparation (20 min)
1. [ ] Create `.gitignore` (use template above)
2. [ ] Create `.env.example` in root
3. [ ] Create `backend/.env.example`
4. [ ] Create `docs/` folder
5. [ ] Audit used vs unused UI components

### Phase 2: Folder Structure (40 min)
1. [ ] Create new folder hierarchy (`src/app/services/`, `src/app/types/`, etc.)
2. [ ] Create placeholder `index.ts` files in each folder
3. [ ] Move existing components to new locations (update imports!)

### Phase 3: Backend Refactor (60 min)
1. [ ] Extract routes from `server.cjs` → `backend/routes/`
2. [ ] Extract controllers logic → `backend/controllers/`
3. [ ] Extract database ops → `backend/services/db.service.cjs`
4. [ ] Extract auth middleware → `backend/middleware/auth.middleware.cjs`
5. [ ] Move face-match → `backend/ai/match_engine.py`
6. [ ] Update `server.cjs` to import from new modules

### Phase 4: Frontend Services (50 min)
1. [ ] Create `src/app/services/api.ts` (centralized API client)
2. [ ] Extract API calls from pages → services
3. [ ] Create centralized types in `src/app/types/`
4. [ ] Create common utilities in `src/app/utils/`
5. [ ] Create custom hooks in `src/app/hooks/`

### Phase 5: Cleanup (30 min)
1. [ ] Remove unused UI components
2. [ ] Delete `struktur*.txt` files
3. [ ] Update all imports throughout project
4. [ ] Test that app still runs after refactoring

### Phase 6: Documentation (30 min)
1. [ ] Write `docs/SETUP.md` (local dev setup)
2. [ ] Write `docs/API.md` (backend endpoints)
3. [ ] Write `docs/ARCHITECTURE.md` (folder structure)
4. [ ] Update main `README.md` with link to docs
5. [ ] Create `CONTRIBUTING.md` for future contributors

---

## 🛠️ IMPLEMENTATION EXAMPLES

### Example 1: Refactoring Auth Service

**Original (server.cjs - monolith)**:
```javascript
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }
    
    const user = await authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // ... session logic
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

**New (modular)**:

```javascript
// backend/routes/auth.routes.cjs
const express = require('express');
const authController = require('../controllers/auth.controller');
const { validateLoginInput } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', validateLoginInput, authController.login);
router.post('/logout', authController.logout);

module.exports = router;

// backend/controllers/auth.controller.cjs
const { authenticateUser } = require('../services/db.service');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    next(error); // Pass to error middleware
  }
};

module.exports = { login };

// backend/middleware/auth.middleware.cjs
const validateLoginInput = (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  
  next();
};

module.exports = { validateLoginInput };

// backend/services/db.service.cjs
const db = require('../database/db.json');

const authenticateUser = async (username, password) => {
  // Pure data logic, testable, reusable
  const demoUsers = {
    'admin': { password: 'admin123', role: 'admin' },
    'photographer': { password: 'photo123', role: 'photographer' },
    'user': { password: 'user123', role: 'user' }
  };
  
  const user = demoUsers[username];
  if (user && user.password === password) {
    return { username, role: user.role };
  }
  
  return null;
};

module.exports = { authenticateUser };
```

### Example 2: Frontend Services Organization

**Original (scattered in pages)**:
```typescript
// src/app/pages/SearchPhotos.tsx
const handleSearch = async () => {
  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('eventId', eventId);
  
  const response = await fetch('http://localhost:4000/api/search', {
    method: 'POST',
    body: formData
  });
  // ... handle response
};
```

**New (centralized)**:

```typescript
// src/app/services/api.ts
import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL = 'http://localhost:4000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // ... other methods
}

export const api = new ApiClient();

// src/app/services/photo.service.ts
import { api } from './api';

export const photoService = {
  async searchPhotos(eventId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    
    return api.post('/api/search', formData);
  },
  
  async uploadPhoto(eventId: string, file: File, price: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    formData.append('price', price);
    
    return api.post(`/api/events/${eventId}/photos`, formData);
  }
};

// src/app/pages/User/SearchPhotos/index.tsx
import { photoService } from '@/app/services';

export default function SearchPhotos() {
  const handleSearch = async () => {
    try {
      const results = await photoService.searchPhotos(eventId, selectedFile);
      // ... handle results
    } catch (error) {
      // ... handle error
    }
  };
}
```

---

## ✅ TESTING CHECKLIST AFTER REFACTOR

### Manual Testing
- [ ] npm install works
- [ ] npm run dev starts frontend
- [ ] Backend server starts: `node backend/server.cjs`
- [ ] All pages load without 404 imports
- [ ] Login functionality works
- [ ] Photo upload works
- [ ] Photo search works
- [ ] Navigation between pages works
- [ ] Protected routes still protected

### Code Quality
- [ ] No unused imports
- [ ] No console.log statements left
- [ ] TypeScript builds without errors
- [ ] No circular dependencies
- [ ] All components render without errors

---

## 📖 DOCUMENTATION TO CREATE

### docs/SETUP.md
```markdown
# Local Development Setup

## Prerequisites
- Node.js 18+
- Python 3.8+
- npm

## Installation

### Frontend
1. npm install
2. npm run dev (runs on localhost:5173)

### Backend
1. cd backend
2. node setup-database.cjs (initializes db)
3. node server.cjs (runs on localhost:4000)

### Python (AI engine)
1. pip install -r backend/ai/requirements.txt

## Demo Credentials
- Admin: admin / admin123
- Photographer: photographer / photo123
- User: user / user123
```

### docs/API.md
Document all endpoints:
```markdown
# API Documentation

## Auth Endpoints
- POST /api/login
- POST /api/logout

## Photo Endpoints
- POST /api/search
- POST /api/events/{eventId}/photos
- GET /api/photos/{photoId}/download

## Event Endpoints
- GET /api/events
- POST /api/events
... etc
```

### docs/ARCHITECTURE.md
Explain the architecture with diagrams.

---

## 🚀 DEPLOYMENT CONSIDERATIONS

After refactoring, ensure:

1. **Environment Variables**: Use .env file, not hardcoded
2. **Database Migration**: SQL schema ready for PostgreSQL/MySQL
3. **Vector DB Integration**: Ready for production face-matching (Pinecone, etc.)
4. **Cloud Storage**: Prepared for S3/GCS instead of local uploads
5. **CI/CD**: GitHub Actions workflows for testing & deployment

---

## 📋 SUCCESS METRICS

After refactoring, project should have:

✅ Clean, predictable folder structure  
✅ Clear separation of concerns (routes → controllers → services)  
✅ Centralized API communication (no scattered fetch calls)  
✅ Proper type definitions for all data flows  
✅ Unused components removed (smaller bundle)  
✅ Comprehensive documentation  
✅ .gitignore properly configured  
✅ Backend modular and testable  
✅ Ready for team collaboration & scaling  

---

## 🔗 RELATED FILES

- `DOKUMENTASI_LOGIKA_SISTEM.md` - System logic (keep as-is)
- `README.md` - Update with link to docs/
- `.gitignore` - Create new with this blueprint
- `package.json` - Review dependencies

---

**Next Steps**: 
1. Review this blueprint with your team
2. Prioritize phases based on urgency
3. Assign phases to AI agents or developers
4. Execute phase by phase
5. Test thoroughly after each phase
6. Merge to main branch only after all phases complete & testing passes

Good luck! 🚀
