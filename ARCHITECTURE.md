# 🏗️ PRIS Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRIS Application                          │
│              Prescription Builder System                     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
   ┌────▼────┐                           ┌─────▼─────┐
   │ Frontend │                           │  Backend  │
   │ (Client) │                           │ (Server)  │
   └────┬────┘                           └─────┬─────┘
        │                                       │
        │                                       │
   Components                              API Routes
   Templates                               Database Ready
   Forms                                   Export Services
```

---

## 📁 Folder Architecture

```
PRIS/
│
├── 🎨 PRESENTATION LAYER (Client-Side)
│   │
│   ├── app/
│   │   ├── layout.tsx          → Root layout & metadata
│   │   └── page.tsx            → Main application page
│   │
│   └── components/
│       ├── PatientForm.tsx     → Patient data capture
│       ├── DoctorForm.tsx      → Prescription details
│       ├── TemplateSelector.tsx → Template chooser
│       ├── PrescriptionView.tsx → Final display
│       ├── PrescriptionHistory.tsx → History manager
│       └── templates/
│           ├── ModernTemplate.tsx
│           ├── ClassicTemplate.tsx
│           └── MinimalTemplate.tsx
│
├── 🔌 API LAYER (Server-Side)
│   │
│   └── app/api/
│       ├── prescriptions/
│       │   └── route.ts        → CRUD operations
│       ├── doctor/
│       │   └── route.ts        → Profile management
│       └── export/
│           └── pdf/
│               └── route.ts    → PDF generation
│
├── 🛠️ BUSINESS LOGIC LAYER
│   │
│   └── lib/
│       ├── storage.ts          → Data persistence
│       └── pdfExport.ts        → PDF utilities
│
├── 📦 DATA LAYER
│   │
│   └── types/
│       └── index.ts            → Type definitions
│
└── 🎨 STYLING LAYER
    │
    └── styles/
        └── globals.css         → Global styles
```

---

## 🔄 Data Flow Architecture

### Creating a Prescription

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│         1. Patient Form                      │
│  ┌─────────────────────────────────────┐   │
│  │ Name, Age, Gender, Contact, etc.    │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ Patient Data
                   ▼
┌─────────────────────────────────────────────┐
│         2. Doctor Form                       │
│  ┌─────────────────────────────────────┐   │
│  │ Diagnosis, Medications, Tests, etc. │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ Prescription Data
                   ▼
┌─────────────────────────────────────────────┐
│         3. Template Selector                 │
│  ┌─────────────────────────────────────┐   │
│  │ Modern | Classic | Minimal          │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ Complete Prescription
                   ▼
┌─────────────────────────────────────────────┐
│         4. Storage (LocalStorage)            │
│  ┌─────────────────────────────────────┐   │
│  │ Save to Browser Storage             │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         5. Prescription View                 │
│  ┌─────────────────────────────────────┐   │
│  │ Display | Export PDF | Print        │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🎯 Component Architecture

### Main Application Flow

```
app/page.tsx (Main Controller)
│
├─ State Management
│  ├─ currentStep: Step
│  ├─ patientData: Patient | null
│  └─ prescriptionData: PrescriptionData | null
│
└─ Conditional Rendering
   │
   ├─ Step: 'home'
   │  └─ Home Screen (Cards)
   │
   ├─ Step: 'patient'
   │  └─ <PatientForm />
   │     └─ onSubmit → setPatientData()
   │
   ├─ Step: 'doctor'
   │  └─ <DoctorForm />
   │     └─ onSubmit → setPrescriptionData()
   │
   ├─ Step: 'template'
   │  └─ <TemplateSelector />
   │     ├─ Preview Templates
   │     └─ onSelect → savePrescription()
   │
   ├─ Step: 'preview'
   │  └─ <PrescriptionView />
   │     ├─ Display Template
   │     ├─ Export PDF
   │     └─ Print
   │
   └─ Step: 'history'
      └─ <PrescriptionHistory />
         ├─ Load from Storage
         ├─ Search/Filter
         └─ View/Delete
```

---

## 🔌 API Architecture

### RESTful Endpoints

```
/api/
│
├─ /prescriptions
│  ├─ GET     → Fetch all prescriptions
│  ├─ POST    → Create new prescription
│  └─ DELETE  → Remove prescription (by ID)
│
├─ /doctor
│  ├─ GET     → Fetch doctor profile
│  └─ PUT     → Update doctor profile
│
└─ /export
   └─ /pdf
      └─ POST → Generate PDF (server-side)
```

### API Request/Response Flow

```
Client Component
      │
      │ fetch('/api/prescriptions')
      ▼
┌─────────────────┐
│  API Route      │
│  route.ts       │
└────────┬────────┘
         │
         │ Process Request
         ▼
┌─────────────────┐
│  Business Logic │
│  (lib/)         │
└────────┬────────┘
         │
         │ Data Operations
         ▼
┌─────────────────┐
│  Data Store     │
│  (LocalStorage  │
│   or Database)  │
└────────┬────────┘
         │
         │ Return Response
         ▼
    Client Component
```

---

## 💾 Data Storage Architecture

### Current: LocalStorage

```
Browser LocalStorage
│
├─ prescriptions_history
│  └─ Array<PrescriptionData>
│     ├─ [0] Prescription 1
│     ├─ [1] Prescription 2
│     └─ ... (up to 50)
│
└─ doctor_info
   └─ Doctor Profile Object
```

### Future: Database Ready

```
Database (PostgreSQL/MongoDB)
│
├─ prescriptions
│  ├─ id (Primary Key)
│  ├─ patient_id (Foreign Key)
│  ├─ doctor_id (Foreign Key)
│  ├─ diagnosis
│  ├─ medications (JSON)
│  ├─ tests (JSON)
│  ├─ created_at
│  └─ updated_at
│
├─ patients
│  ├─ id (Primary Key)
│  ├─ name
│  ├─ age
│  └─ ... (other fields)
│
└─ doctors
   ├─ id (Primary Key)
   ├─ name
   ├─ qualification
   └─ ... (other fields)
```

---

## 🎨 Template Architecture

### Template System

```
TemplateSelector
      │
      ├─ Modern Template
      │  ├─ Gradient Header
      │  ├─ Card Layout
      │  └─ Blue Accent Colors
      │
      ├─ Classic Template
      │  ├─ Serif Fonts
      │  ├─ Formal Layout
      │  └─ Traditional Styling
      │
      └─ Minimal Template
         ├─ Lots of Whitespace
         ├─ Subtle Colors
         └─ Clean Typography
```

### Template Props Flow

```
PrescriptionData
      │
      ├─ patient: Patient
      ├─ doctor: Doctor
      ├─ diagnosis: string
      ├─ medications: Medication[]
      ├─ tests: Test[]
      ├─ advice: string
      ├─ date: Date
      ├─ followUpDate?: Date
      └─ templateId: TemplateType
      │
      ▼
Template Component
      │
      ├─ Header Section
      │  └─ Doctor Info
      │
      ├─ Patient Section
      │  └─ Patient Details
      │
      ├─ Diagnosis Section
      │  └─ Diagnosis Text
      │
      ├─ Medications Section
      │  └─ Medications Table
      │
      ├─ Tests Section
      │  └─ Tests List
      │
      ├─ Advice Section
      │  └─ Medical Advice
      │
      └─ Footer Section
         └─ Signature & Date
```

---

## 🔒 Security Architecture

### Current Implementation

```
Client-Side
│
├─ Input Validation
│  ├─ Form validation
│  ├─ Required fields
│  └─ Data type checking
│
└─ Data Sanitization
   └─ XSS prevention (React default)
```

### Production Recommendations

```
┌─────────────────────────────────────┐
│     Authentication Layer             │
│  (NextAuth.js / Custom Auth)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Authorization Layer              │
│  (Role-based access control)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     API Middleware                   │
│  (Rate limiting, CORS, etc.)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Business Logic                   │
│  (Validated & Sanitized)            │
└─────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

### Development

```
Local Machine
│
├─ npm run dev
│  └─ Next.js Dev Server
│     ├─ Hot Reload
│     ├─ Fast Refresh
│     └─ Source Maps
│
└─ http://localhost:3000
```

### Production

```
Build Process
│
├─ npm run build
│  ├─ TypeScript Compilation
│  ├─ Tailwind CSS Purging
│  ├─ Code Minification
│  ├─ Image Optimization
│  └─ Static Generation
│
└─ .next/ (Build Output)
   │
   ├─ Static Assets
   ├─ Server Bundles
   └─ Client Bundles
   │
   ▼
Deployment Platform
│
├─ Vercel (Recommended)
│  ├─ Edge Network
│  ├─ Automatic HTTPS
│  └─ Zero Config
│
├─ Netlify
│  └─ Similar features
│
└─ Custom Server
   ├─ Node.js Server
   └─ npm start
```

---

## 📊 Performance Architecture

### Optimization Strategies

```
Next.js 14 Optimizations
│
├─ Server Components (Default)
│  └─ Reduced JavaScript bundle
│
├─ Client Components ('use client')
│  └─ Interactive components only
│
├─ Code Splitting
│  └─ Automatic route-based splitting
│
├─ Image Optimization
│  └─ Next.js Image component
│
└─ CSS Optimization
   └─ Tailwind CSS purging
```

---

## 🔄 State Management Architecture

### Current: React State

```
Component State (useState)
│
├─ Local Component State
│  ├─ Form inputs
│  ├─ UI state
│  └─ Temporary data
│
└─ Props Drilling
   └─ Parent → Child communication
```

### Future: Advanced State

```
Context API / Zustand
│
├─ Global State
│  ├─ User session
│  ├─ Doctor profile
│  └─ App settings
│
└─ Persistent State
   ├─ LocalStorage sync
   └─ Database sync
```

---

## 📱 Responsive Architecture

### Breakpoint Strategy

```
Mobile First Approach
│
├─ Base (< 640px)
│  └─ Mobile phones
│
├─ sm (≥ 640px)
│  └─ Large phones
│
├─ md (≥ 768px)
│  └─ Tablets
│
├─ lg (≥ 1024px)
│  └─ Laptops
│
└─ xl (≥ 1280px)
   └─ Desktops
```

---

## 🧪 Testing Architecture (Future)

```
Testing Pyramid
│
├─ E2E Tests (Playwright)
│  └─ Full user flows
│
├─ Integration Tests (Jest + RTL)
│  └─ Component interactions
│
└─ Unit Tests (Jest)
   └─ Individual functions
```

---

## 📚 Documentation Architecture

```
Documentation Structure
│
├─ README.md
│  └─ Project overview & features
│
├─ QUICKSTART.md
│  └─ Fast setup guide
│
├─ PROJECT_STRUCTURE.md
│  └─ Folder organization
│
├─ ARCHITECTURE.md (This file)
│  └─ System design
│
├─ SETUP_INSTRUCTIONS.md
│  └─ Detailed setup
│
└─ Inline Code Comments
   └─ Component documentation
```

---

## 🎯 Scalability Considerations

### Current Capacity
- ✅ Handles 50 prescriptions (LocalStorage)
- ✅ Single doctor profile
- ✅ Client-side processing

### Future Scalability
- 🔄 Database integration (unlimited prescriptions)
- 🔄 Multi-doctor support
- 🔄 Server-side processing
- 🔄 Real-time collaboration
- 🔄 Cloud storage
- 🔄 Analytics & reporting

---

**Architecture Version**: 2.0.0  
**Last Updated**: 2024  
**Status**: Production Ready
