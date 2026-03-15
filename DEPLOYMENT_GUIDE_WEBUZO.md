# Blog.pinesaas.com Setup Guide - WebUzo Panel (No Shell Access)

## Your Database Credentials
- **Database Name:** `pinesaas_blog`
- **Database User:** `pinesaas_userblg`
- **Password:** `fahim123##`
- **Host:** `localhost` (or `127.0.0.1`)

---

## STEP 1: Import Database Schema

### 1.1 Open phpMyAdmin
1. Go to **WebUzo Control Panel** → **Database** → **phpMyAdmin**
2. Login with your database credentials (or root if prompted)

### 1.2 Import the SQL File
1. Click on database `pinesaas_blog` (select it from left sidebar)
2. Go to **Import** tab
3. Click **Choose File** and select `schema.sql`
4. Click **Import** button
5. Wait for success message ✓

**Result:** All 20 tables created automatically

---

## STEP 2: Create .env Files for Backend

Your backend needs a `.env` file with database credentials.

### 2.1 Create Backend .env File

**Path:** `/home/pinesaas/public_html/blog/backend/.env`

**Content:**
```env
# Database Configuration
DATABASE_URL="mysql://pinesaas_userblg:fahim123##@localhost:3306/pinesaas_blog"

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (Generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# Cloudinary (if using image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_preset

# CORS Settings
CORS_ORIGIN=https://blog.pinesaas.com

# Email Configuration (if needed)
EMAIL_FROM=noreply@pinesaas.com
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

**How to create:**
1. Open **File Manager** in WebUzo
2. Navigate to `/public_html/blog.pinesaas.com/backend/`
3. Create a new file named `.env`
4. Paste the content above
5. Update JWT_SECRET with a random string (use: https://generate-random.org/)

---

## STEP 3: Create .env File for Frontend

### 3.1 Create Frontend .env.local File

**Path:** `/home/pinesaas/public_html/blog/pinesaas-blogs/.env.local`

**Content:**
```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=https://blog.pinesaas.com/api

# Database (for NextAuth)
DATABASE_URL="mysql://pinesaas_userblg:fahim123##@localhost:3306/pinesaas_blog"

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-this-to-random-string
NEXTAUTH_URL=https://blog.pinesaas.com

# OAuth Providers (if configured)
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
GOOGLE_ID=your_google_id
GOOGLE_SECRET=your_google_secret

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

**How to create:**
1. Open **File Manager** in WebUzo
2. Navigate to `/public_html/blog.pinesaas.com/pinesaas-blogs/`
3. Create a new file named `.env.local`
4. Paste the content above
5. Update NEXTAUTH_SECRET with a random string

---

## STEP 4: Directory Structure Setup

Your subdomain directory should look like this:

```
/home/pinesaas/public_html/blog/
│
├── backend/                          # Express backend
│   ├── src/
│   ├── node_modules/
│   ├── package.json
│   ├── .env                          # Create this (Step 2)
│   └── dist/                         # Will be created after build
│
├── pinesaas-blogs/                   # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── node_modules/
│   ├── package.json
│   ├── next.config.ts
│   ├── .env.local                    # Create this (Step 3)
│   └── .next/                        # Will be created after build
│
├── public/                           # Shared public folder (optional)
│
└── .htaccess                         # Apache config (see Step 5)
```

---

## STEP 5: Configure Apache (.htaccess)

### 5.1 Create .htaccess for Subdomain Root

**Path:** `/home/pinesaas/public_html/blog/.htaccess`

**Content:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Prevent direct access to backend directory
  RewriteRule ^backend/\.env - [F]
  RewriteRule ^pinesaas-blogs/\.env - [F]
  
  # Frontend routes (Next.js)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(?!api/).*$ pinesaas-blogs/.next/server/pages/404.js [L]
</IfModule>
```

### 5.2 Create .htaccess for Backend API

**Path:** `/home/pinesaas/public_html/blog/backend/.htaccess`

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /backend/
  
  # Block .env files
  <Files .env>
    Order allow,deny
    Deny from all
  </Files>
  
  # Redirect API requests to Node.js
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /backend/dist/index.js [QSA,L]
</IfModule>
```

---

## STEP 6: Install Dependencies

### 6.1 Backend Installation

**Using WebUzo File Manager + Terminal Alternative:**

Since you don't have shell access, you'll need to use a workaround:

**Option A: Use cPanel Node.js App Manager (if available)**
1. Go to **cPanel** → **Node.js Selector** (or **Ruby/Python Selector**)
2. Create a new Node.js application
3. Set **App root:** `/home/pinesaas/public_html/blog/backend`
4. Set **App URL:** `blog.pinesaas.com/api`
5. Set **Application startup file:** `dist/index.js`

**Option B: Pre-build locally and upload**
1. On your local machine, run in the backend folder:
   ```bash
   npm install
   npm run build
   ```
2. Upload the `dist/` and `node_modules/` folders to `/home/pinesaas/public_html/blog/backend/`

### 6.2 Frontend Installation

**Similar approach:**
1. On your local machine, in the frontend folder:
   ```bash
   npm install
   npm run build
   ```
2. Upload `node_modules/`, `.next/` folders to `/home/pinesaas/public_html/blog/pinesaas-blogs/`

---

## STEP 7: Configure Next.js Frontend

### 7.1 Update next.config.ts

**Path:** `/public_html/blog.pinesaas.com/pinesaas-blogs/next.config.ts`

Add/update:
```typescript
const nextConfig = {
  reactStrictMode: true,
  basePath: '',
  assetPrefix: '',
  
  // API routes configuration
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'https://blog.pinesaas.com/api/:path*',
        },
      ],
    }
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: 'https://blog.pinesaas.com/api',
  },
}

export default nextConfig
```

### 7.2 Update API Calls in Frontend

In your frontend components, API calls should be:
```typescript
const response = await fetch('https://blog.pinesaas.com/api/users', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
```

Or use environment variable:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL
const response = await fetch(`${API_URL}/users`, {
  method: 'GET',
})
```

---

## STEP 8: Configure Backend Express Server

### 8.1 Update Backend src/index.ts

Make sure CORS is configured:
```typescript
import cors from 'cors'

const app = express()

// CORS Configuration
app.use(cors({
  origin: 'https://blog.pinesaas.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Other middleware
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/categories', categoryRoutes)
// ... other routes

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

---

## STEP 9: Update Database Connection

### 9.1 Verify Backend Prisma Configuration

**Path:** `/backend/src/lib/prisma.ts`

Should look like:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

### 9.2 Update Backend package.json Scripts

**Path:** `/backend/package.json`

Update prisma commands:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate --schema ../pinesaas-blogs/prisma/schema.prisma",
    "prisma:migrate": "prisma migrate dev --schema ../pinesaas-blogs/prisma/schema.prisma",
    "prisma:push": "prisma db push --schema ../pinesaas-blogs/prisma/schema.prisma"
  }
}
```

---

## STEP 10: Deployment Checklist

### Pre-Deployment
- [ ] Import `schema.sql` into phpMyAdmin
- [ ] Create `.env` in backend folder
- [ ] Create `.env.local` in frontend folder
- [ ] Generate random JWT_SECRET and NEXTAUTH_SECRET
- [ ] Update Cloudinary credentials (if using)
- [ ] Test database connection
- [ ] Build backend: `npm run build`
- [ ] Build frontend: `npm run build`
- [ ] Upload both to subdomain directory

### Post-Deployment
- [ ] Test `/api/health` endpoint
- [ ] Test frontend loads at `https://blog.pinesaas.com`
- [ ] Test login/authentication
- [ ] Test blog creation
- [ ] Check browser console for errors (F12)
- [ ] Check server logs (if available in WebUzo)

---

## STEP 11: WebUzo Specific Configurations

### 11.1 Set Correct Permissions
1. Go to **File Manager** in WebUzo
2. Right-click on folders:
   - `backend/` - Set to **755** (read-execute)
   - `pinesaas-blogs/` - Set to **755**
   - `.env` files - Set to **600** (read/write owner only)
   - `node_modules/` - Set to **755**

### 11.2 Enable Node.js (if available)
1. Go to **WebUzo** → **Manage Node.js Applications**
2. Create new app:
   - **Name:** pinesaas-blog-api
   - **Domain:** blog.pinesaas.com
   - **Port:** 5000
   - **App path:** `/backend`
   - **Startup file:** `dist/index.js`
   - **Node version:** 18+ (recommended)

---

## STEP 12: Troubleshooting

### Issue: Database connection fails
**Solution:**
- Verify credentials in `.env`: `DATABASE_URL="mysql://pinesaas_userblg:fahim123##@localhost:3306/pinesaas_blog"`
- Check if database `pinesaas_blog` exists in phpMyAdmin
- Verify user `pinesaas_userblg` has privileges on `pinesaas_blog`

### Issue: Frontend can't connect to backend
**Solution:**
- Check CORS in backend (should allow `https://blog.pinesaas.com`)
- Verify API URL in frontend `.env.local`: `NEXT_PUBLIC_API_URL=https://blog.pinesaas.com/api`
- Check Network tab in browser DevTools for API call errors

### Issue: Static files not loading
**Solution:**
- Ensure `.htaccess` allows access to `/public/` folder
- Check file permissions (755 for directories, 644 for files)

### Issue: .env files exposed
**Solution:**
- Update `.htaccess` to block `.env` files (included in Step 5)
- Verify with browser: `https://blog.pinesaas.com/backend/.env` should return 403

---

## STEP 13: Access Your Application

After deployment:
- **Frontend:** `https://blog.pinesaas.com`
- **API Documentation:** `https://blog.pinesaas.com/api`
- **Admin Panel:** `https://blog.pinesaas.com/admin` (if configured)
- **Database:** Go to **cPanel phpMyAdmin** → `pinesaas_blog`

---

## Quick Summary of Files to Create/Update

1. ✅ **schema.sql** - Import into phpMyAdmin (already created)
2. ⚙️ **/backend/.env** - Create with credentials
3. ⚙️ **/pinesaas-blogs/.env.local** - Create with credentials
4. ⚙️ **/backend/dist/** - Build locally, upload
5. ⚙️ **/pinesaas-blogs/.next/** - Build locally, upload
6. ⚙️ **/.htaccess** - Create for security
7. ⚙️ **/backend/.htaccess** - Create for security

---

## Need Help?

If you encounter issues:
1. Check browser DevTools (F12) → Console & Network tabs
2. Check WebUzo error logs
3. Verify all `.env` credentials match your database
4. Ensure all files are uploaded to correct paths
5. Verify file permissions are correct (755/644)

---

**Good luck with your deployment! 🚀**
