# PRIS Project Structure Documentation

## 📁 Complete Directory Structure

```
PRIS/
│
├── app/                                    # Next.js 14 App Router
│   ├── layout.tsx                         # Root layout with metadata
│   ├── page.tsx                           # Main home page (client component)
│   │
│   └── api/                               # API Routes (Server-side)
│       ├── prescriptions/
│       │   └── route.ts                   # GET, POST, DELETE prescriptions
│       ├── doctor/
│       │   └── route.ts                   # GET, PUT doctor profile
│       └── export/
│           └── pdf/
│               └── route.ts               # PDF generation endpoint
│
├── components/                            # React UI Components (Client-side)
│   ├── PatientForm.tsx                   # Patient registration form
│   ├── DoctorForm.tsx                    # Prescription details form
│   ├── TemplateSelector.tsx              # Template selection UI
│   ├── PrescriptionView.tsx              # Final prescription display
│   ├── PrescriptionHistory.tsx           # History management
│   │
│   └── templates/                        # Prescription Templates
│       ├── ModernTemplate.tsx            # Modern design
│       ├── ClassicTemplate.tsx           # Classic design
│       └── MinimalTemplate.tsx           # Minimal design
│
├── lib/                                  # Utility Libraries
│   ├── storage.ts                        # LocalStorage management
│   └── pdfExport.ts                      # PDF generation utilities
│
├── types/                                # TypeScript Type Definitions
│   └── index.ts                          # All interfaces and types
│
├── styles/                               # Stylesheets
│   └── globals.css                       # Global CSS with Tailwind
│
├── public/                               # Static Assets (create as needed)
│   └── favicon.ico
│
├── Configuration Files
├── package.json                          # Dependencies and scripts
├── tsconfig.json                         # TypeScript configuration
├── tailwind.config.js                    # Tailwind CSS configuration
├── postcss.config.js                     # PostCSS configuration
├── next.config.js                        # Next.js configuration
├── .gitignore                            # Git ignore rules
│
└── Documentation
    ├── README.md                         # Comprehensive documentation
    ├── QUICKSTART.md                     # Quick setup guide
    └── PROJECT_STRUCTURE.md              # This file
```

## 🎯 Component Hierarchy

```
app/page.tsx (Main App)
│
├── PatientForm
│   └── Form inputs with validation
│
├── DoctorForm
│   ├── Diagnosis input
│   ├── Medications (dynamic list)
│   ├── Tests (dynamic list)
│   └── Advice textarea
│
├── TemplateSelector
│   ├── Template cards
│   └── Preview modal
│       ├── ModernTemplate
│       ├── ClassicTemplate
│       └── MinimalTemplate
│
├── PrescriptionView
│   ├── Action buttons (PDF, Print)
│   └── Selected Template
│       └── Prescription content
│
└── PrescriptionHistory
    ├── Search bar
    └── Prescription list
        └── Individual prescription cards
```

## 📦 Module Dependencies

### Core Dependencies
- **next**: ^14.2.33 - React framework
- **react**: ^18 - UI library
- **react-dom**: ^18 - React DOM renderer
- **typescript**: ^5 - Type safety

### UI & Styling
- **tailwindcss**: ^3.4.1 - Utility-first CSS
- **postcss**: ^8 - CSS processor
- **autoprefixer**: ^10 - CSS vendor prefixes
- **lucide-react**: ^0.344.0 - Icon library

### Utilities
- **date-fns**: ^3.3.1 - Date formatting
- **html2canvas**: ^1.4.1 - HTML to canvas
- **jspdf**: ^2.5.1 - PDF generation

## 🔄 Data Flow

### Creating a Prescription

```
1. User Input (PatientForm)
   ↓
2. Patient Data → State
   ↓
3. User Input (DoctorForm)
   ↓
4. Prescription Data → State
   ↓
5. Template Selection (TemplateSelector)
   ↓
6. Complete Prescription → LocalStorage
   ↓
7. Display (PrescriptionView)
   ↓
8. Export (PDF/Print)
```

### Viewing History

```
1. Load from LocalStorage
   ↓
2. Display in PrescriptionHistory
   ↓
3. Search/Filter
   ↓
4. Select Prescription
   ↓
5. Display in PrescriptionView
```

## 🔌 API Routes Structure

### `/api/prescriptions`
- **GET**: Fetch all prescriptions
- **POST**: Create new prescription
- **DELETE**: Remove prescription by ID

### `/api/doctor`
- **GET**: Fetch doctor profile
- **PUT**: Update doctor profile

### `/api/export/pdf`
- **POST**: Generate PDF server-side (optional)

## 🎨 Styling Architecture

### Tailwind Configuration
```javascript
// tailwind.config.js
{
  colors: {
    primary: { ... },  // Main brand colors
    secondary: { ... } // Secondary colors
  },
  fontFamily: {
    sans: [...],       // Default font
    serif: [...]       // For classic template
  }
}
```

### Global Styles
```css
/* globals.css */
@layer base { ... }       // Base HTML elements
@layer components { ... } // Reusable components
@layer utilities { ... }  // Custom utilities
```

### Component-Specific
- Inline Tailwind classes
- Print-specific styles (@media print)
- Responsive breakpoints

## 🔐 Type Safety

### Main Types (`types/index.ts`)
- **Patient**: Patient demographics
- **Doctor**: Doctor information
- **Medication**: Medication details
- **Test**: Laboratory test
- **PrescriptionData**: Complete prescription
- **TemplateType**: Template identifiers

## 🚀 Build & Deployment

### Development
```bash
npm run dev      # Start dev server
npm run lint     # Run ESLint
```

### Production
```bash
npm run build    # Create optimized build
npm start        # Start production server
```

### Output
```
.next/           # Build output
├── static/      # Static assets
├── server/      # Server bundles
└── cache/       # Build cache
```

## 📝 File Naming Conventions

- **Components**: PascalCase (e.g., `PatientForm.tsx`)
- **Utilities**: camelCase (e.g., `storage.ts`)
- **API Routes**: lowercase (e.g., `route.ts`)
- **Types**: PascalCase interfaces (e.g., `Patient`)
- **Constants**: UPPER_SNAKE_CASE

## 🔧 Configuration Files Explained

### `tsconfig.json`
- TypeScript compiler options
- Path aliases (`@/*`)
- Next.js plugin integration

### `tailwind.config.js`
- Content paths for purging
- Theme customization
- Plugin configuration

### `next.config.js`
- Next.js framework settings
- Build optimizations
- Environment variables

### `postcss.config.js`
- Tailwind CSS processing
- Autoprefixer for browser compatibility

## 📚 Import Path Aliases

```typescript
@/types          → ./types
@/lib            → ./lib
@/components     → ./components
@/app            → ./app
@/styles         → ./styles
```

## 🎯 Key Features by Directory

### `/app`
- Server and client components
- API route handlers
- Layouts and metadata
- App Router navigation

### `/components`
- Reusable UI components
- Client-side interactivity
- Form validation
- Template rendering

### `/lib`
- Business logic
- Data persistence
- Utility functions
- PDF generation

### `/types`
- TypeScript interfaces
- Type definitions
- Shared types

## 🔄 State Management

- **React useState**: Local component state
- **Props drilling**: Parent-child communication
- **LocalStorage**: Persistent data
- **Future**: Can add Context API or Zustand

## 📱 Responsive Design

- **Mobile-first**: Tailwind's default approach
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Print styles**: Optimized for printing
- **Touch-friendly**: Large click targets

## 🧪 Testing Structure (Future)

```
PRIS/
├── __tests__/
│   ├── components/
│   ├── lib/
│   └── api/
└── jest.config.js
```

---

**Last Updated**: 2024  
**Version**: 2.0.0 (App Router Architecture)
