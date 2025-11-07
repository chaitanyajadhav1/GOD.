# PRIS - Prescription Builder Application

A comprehensive medical prescription builder application built with Next.js 14 (App Router), React, and TypeScript. Create professional prescriptions with multiple template options, patient management, and PDF export capabilities.

## 🏗️ Project Structure

```
PRIS/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── api/                     # API Routes
│       ├── prescriptions/       # Prescription CRUD operations
│       │   └── route.ts
│       ├── doctor/              # Doctor profile management
│       │   └── route.ts
│       └── export/              # PDF export endpoint
│           └── pdf/
│               └── route.ts
├── components/                   # React Components
│   ├── PatientForm.tsx          # Patient registration form
│   ├── DoctorForm.tsx           # Prescription details form
│   ├── TemplateSelector.tsx    # Template selection interface
│   ├── PrescriptionView.tsx    # Final prescription display
│   ├── PrescriptionHistory.tsx # History management
│   └── templates/               # Prescription Templates
│       ├── ModernTemplate.tsx   # Modern design
│       ├── ClassicTemplate.tsx  # Classic design
│       └── MinimalTemplate.tsx  # Minimal design
├── lib/                         # Utility Libraries
│   ├── storage.ts               # LocalStorage management
│   └── pdfExport.ts            # PDF generation utilities
├── types/                       # TypeScript Definitions
│   └── index.ts                 # Type definitions
├── styles/                      # Stylesheets
│   └── globals.css             # Global styles with Tailwind
├── public/                      # Static Assets
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── next.config.js              # Next.js configuration
```

## ✨ Features

### Core Functionality
- **Patient Registration** - Complete demographic capture with validation
- **Doctor Input Form** - Diagnosis, medications, tests, and advice
- **Multiple Templates** - Modern, Classic, and Minimal designs
- **Template Preview** - Interactive selection with full preview
- **PDF Export** - High-quality PDF generation
- **Prescription History** - LocalStorage-based persistence with search

### API Routes
- `GET/POST/DELETE /api/prescriptions` - Prescription management
- `GET/PUT /api/doctor` - Doctor profile operations
- `POST /api/export/pdf` - Server-side PDF generation (optional)

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF**: jsPDF + html2canvas
- **Date**: date-fns

## 🚀 Getting Started

### Installation

1. **Navigate to PRIS folder:**
```bash
cd PRIS
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 📁 Key Directories Explained

### `/app` - Next.js App Router
- Uses the new App Router architecture
- Server and client components
- API routes for backend functionality
- Automatic code splitting and optimization

### `/components` - React Components
- All UI components are client-side (`'use client'`)
- Reusable and modular design
- Well-documented with inline comments

### `/lib` - Utility Libraries
- Business logic separated from UI
- Storage management
- PDF export utilities
- Can be used across client and server

### `/app/api` - API Routes
- RESTful API endpoints
- Ready for database integration
- Currently returns mock data
- Easy to extend with real backend

## 🔧 Configuration

### TypeScript Paths
The project uses path aliases for clean imports:
```typescript
import { Patient } from '@/types';
import { savePrescription } from '@/lib/storage';
import PatientForm from '@/components/PatientForm';
```

### Tailwind Configuration
Custom colors and utilities defined in `tailwind.config.js`:
- Primary color scheme
- Custom font families
- Responsive breakpoints

## 📝 Usage Guide

### Creating a Prescription

1. **Home Page** → Click "New Prescription"
2. **Patient Form** → Enter patient details
3. **Doctor Form** → Add diagnosis, medications, tests
4. **Template Selection** → Choose and preview template
5. **Final View** → Export PDF or print

### Managing History

- View all prescriptions in History section
- Search by patient name, diagnosis, or contact
- Click "View" to see full prescription
- Delete unwanted prescriptions

## 🔌 API Integration

The API routes are ready for database integration. To connect to a real backend:

1. Install your database client (e.g., Prisma, MongoDB)
2. Update API routes in `/app/api`
3. Replace localStorage calls with database queries
4. Add authentication middleware

Example:
```typescript
// app/api/prescriptions/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const prescriptions = await prisma.prescription.findMany();
  return NextResponse.json({ data: prescriptions });
}
```

## 🎨 Customization

### Adding New Templates

1. Create new template in `components/templates/`
2. Add to `TemplateSelector.tsx`
3. Update `TemplateType` in `types/index.ts`

### Modifying Doctor Info

Edit `lib/storage.ts`:
```typescript
export function getSampleDoctorData(): Doctor {
  return {
    name: 'Your Name',
    // ... your details
  };
}
```

### Styling Changes

- Global styles: `styles/globals.css`
- Tailwind config: `tailwind.config.js`
- Component-specific: Use Tailwind classes

## 🔒 Security Considerations

For production deployment:
- Add authentication (NextAuth.js recommended)
- Implement authorization checks in API routes
- Use environment variables for sensitive data
- Enable CORS protection
- Add rate limiting
- Sanitize user inputs

## 📦 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
- Build: `npm run build`
- Start: `npm start`
- Ensure Node.js 18+ is available

## 🐛 Troubleshooting

**Port in use:**
```bash
npm run dev -- -p 3001
```

**TypeScript errors:**
```bash
npm install
```

**Clear cache:**
```bash
rm -rf .next
npm run dev
```

## 📚 Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## 🤝 Contributing

This is a professional medical application. When contributing:
- Follow existing code structure
- Add TypeScript types
- Document new features
- Test thoroughly

## 📄 License

This project is provided as-is for educational and professional use.

---

**Version**: 2.0.0 (App Router)  
**Built with**: Next.js 14, React 18, TypeScript, Tailwind CSS
