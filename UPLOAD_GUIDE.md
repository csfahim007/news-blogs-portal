# Upload & File Structure Guide for blog.pinesaas.com

## STEP 1: Prepare Files for Upload

### No Need to Zip - Direct Upload (Recommended)

You can upload directly using WebUzo File Manager. However, if file size is large, follow the steps below.

---

## STEP 2: What to Upload to Cloud

Your cloud directory structure should look like this:

```
/home/pinesaas/public_html/blog/
│
├── backend/                              # Express.js Backend
│   ├── src/                              # Source files
│   ├── dist/                             # Compiled files (build locally first)
│   ├── node_modules/                     # Dependencies (build locally first)
│   ├── package.json                      # Dependencies list
│   ├── tsconfig.json                     # TypeScript config
│   ├── .env                              # ✅ ALREADY CONFIGURED (database credentials)
│   └── .htaccess                         # ✅ CREATED (security settings)
│
├── pinesaas-blogs/                       # Next.js Frontend
│   ├── app/                              # Pages and layouts
│   ├── components/                       # React components
│   ├── lib/                              # Utilities
│   ├── public/                           # Static assets
│   ├── prisma/                           # Database schema
│   ├── node_modules/                     # Dependencies (build locally first)
│   ├── .next/                            # Build output (build locally first)
│   ├── package.json                      # Dependencies list
│   ├── next.config.ts                    # Next.js configuration
│   ├── tsconfig.json                     # TypeScript config
│   └── .env.local                        # ✅ ALREADY CONFIGURED (API URLs & database)
│
├── schema.sql                            # ✅ Database schema file (import to phpMyAdmin)
├── .htaccess                             # ✅ CREATED (routing & security)
│
└── Other optional files (README.md, etc)
```

---

## STEP 3: Build Locally BEFORE Upload

You need to build both applications locally, then upload the compiled files.

### IMPORTANT: Do this on your local machine (Windows, Mac, or Linux)

#### Step 3.1: Build Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Build TypeScript to JavaScript
npm run build

# You'll see a new "dist" folder created
```

**What gets created:**
- `backend/dist/` - Compiled JavaScript files (ready for production)

#### Step 3.2: Build Frontend

```bash
# Navigate to frontend directory
cd pinesaas-blogs

# Install dependencies (if not already done)
npm install

# Build Next.js
npm run build

# You'll see a new ".next" folder created
```

**What gets created:**
- `pinesaas-blogs/.next/` - Compiled Next.js application (ready for production)

---

## STEP 4: Files to Upload to Cloud

### Upload BOTH of these folder structures to `/public_html/blog.pinesaas.com/`:

#### Option A: Individual Folder Upload (Recommended for WebUzo)

**Upload these folders separately:**

1. **Backend Folder**
   - From: `backend/`
   - To: `/home/pinesaas/public_html/blog/backend/`
   - Includes:
     - `src/` (source code)
     - `dist/` (compiled code) ✅ **REQUIRED**
     - `node_modules/` (dependencies) ✅ **REQUIRED**
     - `package.json`
     - `tsconfig.json`
     - `.env` ✅ **ALREADY UPDATED WITH YOUR CREDENTIALS**
     - `.htaccess` ✅ **CREATED**

2. **Frontend Folder**
   - From: `pinesaas-blogs/`
   - To: `/home/pinesaas/public_html/blog/pinesaas-blogs/`
   - Includes:
     - `app/` (pages and routes)
     - `components/` (React components)
     - `public/` (static files)
     - `prisma/` (database schema)
     - `.next/` (compiled app) ✅ **REQUIRED**
     - `node_modules/` (dependencies) ✅ **REQUIRED**
     - `package.json`
     - `next.config.ts`
     - `tsconfig.json`
     - `.env.local` ✅ **ALREADY UPDATED WITH YOUR CREDENTIALS**

3. **Root Level Files**
   - `.htaccess` ✅ **CREATED** → Root of `/home/pinesaas/public_html/blog/`
   - `schema.sql` ✅ **FOR DATABASE IMPORT**

#### Option B: Zip Upload (If File Manager has issues)

**If you want to zip:**

```
1. Zip backend folder:
   - Zip: backend/dist, backend/node_modules, backend/src, backend/.env, backend/package.json, backend/tsconfig.json, backend/.htaccess
   - Save as: backend.zip

2. Zip frontend folder:
   - Zip: pinesaas-blogs/.next, pinesaas-blogs/node_modules, pinesaas-blogs/app, pinesaas-blogs/components, pinesaas-blogs/public, pinesaas-blogs/prisma, pinesaas-blogs/.env.local, pinesaas-blogs/package.json, pinesaas-blogs/next.config.ts, pinesaas-blogs/tsconfig.json
   - Save as: frontend.zip

3. Upload both zips to /home/pinesaas/public_html/blog/

4. Extract in WebUzo File Manager:
   - Extract backend.zip → will create backend/ folder
   - Extract frontend.zip → will create pinesaas-blogs/ folder
```

---

## STEP 5: Upload Checklist

### Before Uploading:

- [ ] Build backend locally: `cd backend && npm install && npm run build`
- [ ] Build frontend locally: `cd pinesaas-blogs && npm install && npm run build`
- [ ] Verify `backend/dist/` folder exists
- [ ] Verify `pinesaas-blogs/.next/` folder exists
- [ ] Check `.env` files are configured (should be already)
- [ ] Verify `.htaccess` files exist

### During Upload:

- [ ] Upload `backend/` folder to `/home/pinesaas/public_html/blog/backend/`
- [ ] Upload `pinesaas-blogs/` folder to `/home/pinesaas/public_html/blog/pinesaas-blogs/`
- [ ] Upload `.htaccess` to `/home/pinesaas/public_html/blog/.htaccess`
- [ ] Upload `schema.sql` to `/home/pinesaas/public_html/blog/schema.sql`

### After Upload:

- [ ] Go to phpMyAdmin
- [ ] Select `pinesaas_blog` database
- [ ] Import `schema.sql` (creates all 20 tables)
- [ ] Set file permissions:
  - `backend/` → 755
  - `pinesaas-blogs/` → 755
  - `.env` files → 600
- [ ] Test access: `http://blog.pinesaas.com`

---

## STEP 6: File Permissions in WebUzo

After uploading, set these permissions:

| Path | Permission | Type |
|------|-----------|------|
| `backend/` | 755 | Directory |
| `backend/.env` | 600 | File (owner only) |
| `pinesaas-blogs/` | 755 | Directory |
| `pinesaas-blogs/.env.local` | 600 | File (owner only) |
| `pinesaas-blogs/.next/` | 755 | Directory |
| `pinesaas-blogs/node_modules/` | 755 | Directory |
| `.htaccess` | 644 | File |

**How to set permissions in WebUzo:**
1. Right-click file/folder
2. Select "Permissions"
3. Set the numbers above
4. Click Save

---

## STEP 7: Verify Everything Works

1. **Database Import:**
   - Go to phpMyAdmin
   - Import `schema.sql`
   - Should see all 20 tables created ✓

2. **Test Frontend:**
   - Visit `http://blog.pinesaas.com`
   - Should see the blog homepage

3. **Test Backend API:**
   - Visit `http://blog.pinesaas.com/api/health`
   - Should see: `{"status":"OK","message":"Server is running"}`

4. **Test Database Connection:**
   - Try to login or create a post
   - Should connect without errors

---

## STEP 8: Troubleshooting

### Frontend won't load
- Check browser console (F12)
- Verify `.next/` folder exists
- Verify `node_modules/` exists
- Check file permissions (755)

### API won't respond
- Check `backend/dist/` exists
- Verify `backend/node_modules/` exists
- Check `.env` database credentials
- Test: `http://blog.pinesaas.com/api/health`

### Database connection fails
- Import `schema.sql` in phpMyAdmin
- Verify user `pinesaas_userblg` has access to `pinesaas_blog` database
- Check `.env` and `.env.local` have correct credentials

### .env files exposed
- Update `.htaccess` (already done)
- Test: `http://blog.pinesaas.com/backend/.env` should return 403

---

## Summary

**Files already configured and ready:**
✅ `backend/.env` - with pinesaas_userblg credentials
✅ `pinesaas-blogs/.env.local` - with API URLs
✅ `.htaccess` files - for security
✅ `backend/src/index.ts` - CORS updated

**What you need to do:**
1. Build locally (`npm install && npm run build` in both directories)
2. Upload `backend/` and `pinesaas-blogs/` folders
3. Upload `.htaccess` to root
4. Import `schema.sql` to database
5. Set permissions correctly
6. Test the URLs

**That's it! Your blog will be live.** 🚀
