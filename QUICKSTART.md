# Quick Start Guide - PRIS

## 🚀 Installation (3 Steps)

```bash
# 1. Navigate to PRIS folder
cd PRIS

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure Overview

```
PRIS/
├── app/              # Pages & API routes (App Router)
├── components/       # UI components
├── lib/             # Utilities (storage, PDF)
├── types/           # TypeScript types
└── styles/          # Global CSS
```

## 🎯 Key Features

✅ **Patient Registration** - Complete form with validation  
✅ **Doctor Input** - Diagnosis, medications, tests  
✅ **3 Templates** - Modern, Classic, Minimal  
✅ **PDF Export** - High-quality output  
✅ **History** - LocalStorage persistence  
✅ **API Routes** - Ready for backend integration  

## 🔧 Common Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Type checking
npx tsc --noEmit

# Lint
npm run lint
```

## 🎨 Customization

### Change Doctor Info
Edit `lib/storage.ts` → `getSampleDoctorData()`

### Add New Template
1. Create in `components/templates/`
2. Add to `TemplateSelector.tsx`
3. Update types in `types/index.ts`

### Modify Colors
Edit `tailwind.config.js` → `colors.primary`

## 🔌 API Routes

- `GET /api/prescriptions` - Fetch all
- `POST /api/prescriptions` - Create new
- `DELETE /api/prescriptions?id=123` - Delete
- `GET /api/doctor` - Get doctor info
- `PUT /api/doctor` - Update doctor info

## 📱 App Router vs Pages Router

This project uses **Next.js 14 App Router**:
- ✅ Better performance
- ✅ Server components by default
- ✅ Improved routing
- ✅ Built-in API routes
- ✅ Modern architecture

## 🐛 Troubleshooting

**Port already in use?**
```bash
npm run dev -- -p 3001
```

**Module not found?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Clear Next.js cache:**
```bash
rm -rf .next
npm run dev
```

## 📚 Learn More

- **App Router**: [Next.js Docs](https://nextjs.org/docs/app)
- **API Routes**: [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- **Components**: Check inline documentation

## ✨ What's New in PRIS v2.0

- 🎯 App Router architecture
- 🔌 API routes structure
- 📁 Better organized folders
- 🚀 Improved performance
- 📝 Enhanced documentation

---

**Ready to start?** Run `npm install && npm run dev` in the PRIS folder!
