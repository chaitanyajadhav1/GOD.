# 🚀 PRIS Setup Instructions

## Quick Start (3 Commands)

```bash
cd PRIS
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## 📋 Detailed Setup

### Step 1: Navigate to PRIS Folder

```bash
cd c:/Users/amolj/Desktop/Prescription/PRIS
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- All required packages

**Expected output**: ~166 packages installed

### Step 3: Start Development Server

```bash
npm run dev
```

**Expected output**:
```
▲ Next.js 14.2.33
- Local:        http://localhost:3000
✓ Ready in 2-3s
```

### Step 4: Open in Browser

Navigate to: **http://localhost:3000**

You should see the Prescription Builder home page.

---

## ✅ Verify Installation

### Check 1: Home Page Loads
- ✅ See "Prescription Builder" title
- ✅ Two cards: "New Prescription" and "Prescription History"
- ✅ Features section at bottom

### Check 2: Create Prescription
1. Click "New Prescription"
2. Fill patient form
3. Click "Continue to Prescription"
4. Add diagnosis and medications
5. Select template
6. View final prescription

### Check 3: Export Works
- ✅ Click "Export PDF" button
- ✅ PDF downloads successfully
- ✅ Print button opens print dialog

---

## 📁 Project Structure

```
PRIS/
├── app/              # Next.js App Router
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page
│   └── api/         # API routes
├── components/       # React components
├── lib/             # Utilities
├── types/           # TypeScript types
└── styles/          # CSS files
```

---

## 🔧 Configuration

### TypeScript
- ✅ Already configured in `tsconfig.json`
- ✅ Path aliases set up (`@/*`)
- ✅ Strict mode enabled

### Tailwind CSS
- ✅ Configured in `tailwind.config.js`
- ✅ Custom colors defined
- ✅ Responsive breakpoints set

### Next.js
- ✅ App Router enabled
- ✅ React strict mode on
- ✅ Optimizations enabled

---

## 🎨 Customization

### Change Doctor Information

Edit `lib/storage.ts`:

```typescript
export function getSampleDoctorData(): Doctor {
  return {
    name: 'Your Name Here',
    qualification: 'Your Qualifications',
    specialization: 'Your Specialization',
    registrationNumber: 'Your Reg Number',
    contact: 'Your Contact',
    email: 'your@email.com',
    clinicName: 'Your Clinic Name',
    clinicAddress: 'Your Clinic Address',
  };
}
```

### Modify Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#your-color',
    // ... more shades
  }
}
```

---

## 🔌 API Routes

Available endpoints:

### Prescriptions
- `GET /api/prescriptions` - Fetch all
- `POST /api/prescriptions` - Create new
- `DELETE /api/prescriptions?id=123` - Delete

### Doctor
- `GET /api/doctor` - Get profile
- `PUT /api/doctor` - Update profile

### Export
- `POST /api/export/pdf` - Generate PDF

---

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run dev -- -p 3001  # Use different port

# Production
npm run build        # Create optimized build
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
npm run dev -- -p 3001
```

### Module Not Found

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

1. Restart your IDE
2. Run: `npx tsc --noEmit`
3. Check `tsconfig.json` is present

### Styles Not Loading

1. Check `styles/globals.css` exists
2. Verify `app/layout.tsx` imports it
3. Clear `.next` folder: `rm -rf .next`

### Build Errors

```bash
rm -rf .next
npm run build
```

---

## 📚 Documentation

- **README.md** - Comprehensive guide
- **QUICKSTART.md** - Fast setup
- **PROJECT_STRUCTURE.md** - Architecture details
- **MIGRATION_GUIDE.md** - Migration from root folder

---

## 🎯 Next Steps

1. ✅ **Test all features**
   - Create prescription
   - View history
   - Export PDF
   - Try all templates

2. ✅ **Customize**
   - Update doctor info
   - Modify colors
   - Adjust templates

3. ✅ **Deploy** (when ready)
   - Vercel: `vercel`
   - Other: `npm run build && npm start`

---

## 🔒 Production Checklist

Before deploying:

- [ ] Update doctor information
- [ ] Test all features thoroughly
- [ ] Add authentication (if needed)
- [ ] Set up database (if needed)
- [ ] Configure environment variables
- [ ] Test on mobile devices
- [ ] Run production build locally
- [ ] Check console for errors
- [ ] Test PDF export
- [ ] Verify print functionality

---

## 📞 Getting Help

1. Check inline code comments
2. Review documentation files
3. Check Next.js docs: https://nextjs.org/docs
4. Check Tailwind docs: https://tailwindcss.com/docs

---

## ✨ Features Overview

### Patient Management
- Complete demographic capture
- Allergy tracking
- Blood group recording
- Form validation

### Prescription Creation
- Diagnosis entry
- Multiple medications
- Laboratory tests
- Medical advice
- Follow-up scheduling

### Templates
- **Modern**: Contemporary design
- **Classic**: Traditional medical format
- **Minimal**: Clean, spacious layout

### Export Options
- High-quality PDF export
- Direct browser printing
- Print-optimized layouts

### History Management
- Automatic saving
- Search functionality
- View and delete options
- Stores up to 50 prescriptions

---

## 🎉 You're All Set!

The PRIS application is now ready to use. Start creating professional medical prescriptions!

**Happy prescribing! 💊**
