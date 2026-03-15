# 🚀 Quick Deployment Guide

## Files Already Updated ✅
- ✅ `backend/.env` - Production credentials
- ✅ `backend/src/index.ts` - Security headers + logging
- ✅ `backend/tsconfig.json` - Production optimized
- ✅ `backend/src/lib/prisma.ts` - Production logging
- ✅ `pinesaas-blogs/.env.local` - Production URLs
- ✅ `pinesaas-blogs/next.config.ts` - Security headers
- ✅ `pinesaas-blogs/lib/prisma.ts` - Production logging
- ✅ `.htaccess` - Routing & security
- ✅ `schema.sql` - Database schema

---

## 3-Step Deployment Process

### Step 1: Build (5 minutes)
```powershell
# Terminal 1: Backend
cd backend
npm install --omit=dev
npm run build

# Terminal 2: Frontend (different terminal)
cd pinesaas-blogs
npm install --omit=dev
npm run build
```

### Step 2: Upload (10 minutes)
Upload these folders to `/home/pinesaas/public_html/blog/`:
```
backend/          (entire folder with dist/ and node_modules/)
pinesaas-blogs/   (entire folder with .next/ and node_modules/)
.htaccess         (file)
schema.sql        (file)
```

### Step 3: Setup Database (5 minutes)
1. phpMyAdmin → `pinesaas_blog` database
2. Import → `schema.sql`
3. Done ✓

---

## Test URLs After Upload

| Test | URL | Expected |
|------|-----|----------|
| Frontend | `https://blog.pinesaas.com` | Blog homepage loads |
| API Health | `https://blog.pinesaas.com/api/health` | `{"status":"OK","message":"Server is running"}` |
| Database | Create blog post | Data saves to DB |
| Security | `https://blog.pinesaas.com/backend/.env` | 403 Forbidden |

---

## Database Credentials

```
Database: pinesaas_blog
User: pinesaas_userblg
Password: fahim123##
Host: localhost
```

---

## Key Settings

**Backend Port:** 5000
**Frontend:** Next.js optimized for production
**Database:** MySQL + Prisma
**Logging:** Errors only (production)
**CORS:** https://blog.pinesaas.com only

---

## File Permissions After Upload

```
backend/: 755
backend/.env: 600
pinesaas-blogs/: 755
pinesaas-blogs/.env.local: 600
.htaccess: 644
```

---

## If You Need Help

- **Frontend issues?** See `PRODUCTION_CHECKLIST.md`
- **Backend issues?** Check `backend/dist/` exists
- **Database issues?** Run `schema.sql` import again
- **Upload issues?** Use `UPLOAD_GUIDE.md`

---

## Everything Is Ready! 🎉

Just build → upload → import database → test

No additional configuration needed!
