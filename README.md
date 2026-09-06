# 📰 News & Blogs Portal

A modern full-stack **News & Blogs Portal** for publishing and consuming long-form stories, blog posts, and newsroom content.

The platform provides a complete publishing workflow where readers can discover articles, open an immersive reader view, rate and comment on posts, and subscribe to newsletters. Registered users can manage their accounts, while administrators have a dedicated workspace for managing content, categories, comments, and users.

🌐 **Live Application:** https://itms.cloudafk.xyz/

---

# Admin Login: 
  email: admin@pinesaas.local
  pass: AdminSeed2026!


## ✨ Overview

This project is designed as a complete digital publishing platform rather than a CRM or business management system.

The application focuses on the entire content lifecycle:

```text
Create Content
      │
      ▼
Organize into Categories
      │
      ▼
Publish Stories / Blogs / News
      │
      ▼
Readers Discover Content
      │
      ├── Read Articles
      ├── Rate Posts
      ├── Comment
      └── Subscribe to Newsletter
```

The system uses a separate **React + TypeScript frontend** and **Express + TypeScript REST API**, with **Prisma ORM and MySQL** providing the persistence layer.

---

# 🚀 Live Demo

### Production Application

**News & Blogs Portal:**
https://itms.cloudafk.xyz/

The production application provides the complete reader experience together with authenticated user functionality and an administrative content-management workspace.

---

# 🎯 Core Features

## 📰 Newsroom & Publishing

The platform supports multiple types of editorial content:

* News articles
* Blog posts
* Long-form stories
* Categorized content
* Reader-friendly article pages
* Reading-time information
* View metadata
* Content discovery

The publishing architecture allows content to be organized and presented according to its type and category.

---

## 📖 Reader Experience

The frontend provides a dedicated reading experience designed around content consumption.

Readers can:

* Browse published content
* Open individual articles
* Read long-form stories
* View reading-time information
* View article metadata
* Interact with published posts
* Rate articles
* Leave comments

The application separates content discovery from the full reader experience so users can move naturally from browsing to reading.

---

## 👤 User Authentication

Registered users can create accounts and authenticate securely.

Authentication includes:

* User registration
* Login
* JWT-based authentication
* Session persistence
* Protected API endpoints
* Account management

Passwords are protected using **bcrypt hashing** rather than storing plaintext credentials.

---

## 💬 Comments & Ratings

The platform provides reader interaction through:

* Article comments
* Ratings
* Authenticated user interactions
* Comment management from the admin workspace

This creates a feedback layer around published content rather than treating articles as static pages.

---

## 📧 Newsletter Subscription

Visitors can subscribe to the newsletter directly from the publishing platform.

This provides a foundation for building a future editorial distribution system where new stories and news can be delivered to subscribers.

---

# 🛠️ Admin Workspace

The platform includes a dedicated administrative workspace for managing the publishing ecosystem.

Administrators can manage:

### 📝 Content

* Create content
* Edit content
* Manage published material
* Organize articles
* Maintain editorial information

### 🗂️ Categories

* Create categories
* Edit categories
* Organize published content

### 💬 Comments

* Review comments
* Manage reader feedback
* Moderate content interactions

### 👥 Users

* View users
* Manage registered accounts
* Maintain platform access

The admin workspace keeps editorial and moderation operations separate from the public reader experience.

---

# 🧠 Application Architecture

The application follows a **separated frontend/backend architecture**.

```text
                         Internet
                            │
                            ▼
                  ┌───────────────────┐
                  │   React Frontend  │
                  │                   │
                  │ React 19          │
                  │ TypeScript        │
                  │ Vite              │
                  └─────────┬─────────┘
                            │
                         REST API
                            │
                            ▼
                  ┌───────────────────┐
                  │   Express API     │
                  │                   │
                  │ TypeScript        │
                  │ Authentication    │
                  │ Business Logic    │
                  │ API Routes        │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │      Prisma       │
                  │       ORM         │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │      MySQL        │
                  │    Database       │
                  └───────────────────┘

                            │
                            ├──────────────► Cloudinary
                            │                 Cover Images
                            │
                            └──────────────► JWT
                                              Authentication
```

The architecture separates:

**Presentation → API → Business Logic → Data Access → Database**

This makes the system easier to maintain and allows the frontend and backend to evolve independently.

---

# 💻 Frontend Architecture

The frontend is built with:

* React 19
* TypeScript
* Vite

The frontend is responsible for:

* Content discovery
* Article rendering
* Reader experience
* Authentication interfaces
* Comments
* Ratings
* Newsletter signup
* User account interfaces
* Administrative screens
* API communication

The application uses a component-based architecture to keep the UI reusable and maintainable.

---

# ⚙️ Backend Architecture

The backend is a TypeScript-based **Express REST API**.

```text
Frontend Request
       │
       ▼
   Express API
       │
       ▼
Authentication Middleware
       │
       ▼
   API Routes
       │
       ▼
Business Logic
       │
       ▼
 Prisma Client
       │
       ▼
    MySQL
       │
       ▼
   JSON Response
```

The API acts as the central boundary between the frontend and persistent application data.

This prevents the frontend from directly accessing the database and allows authentication and authorization rules to be enforced server-side.

---

# 🔐 Authentication & Security

Security is handled primarily at the backend layer.

## JWT Authentication

The application uses **JSON Web Tokens** for authenticated sessions.

A typical flow is:

```text
User
 │
 ▼
Login
 │
 ▼
Express Authentication Endpoint
 │
 ▼
Validate Credentials
 │
 ▼
bcrypt Password Verification
 │
 ▼
Generate JWT
 │
 ▼
Frontend Session
 │
 ▼
Authenticated API Requests
 │
 ▼
JWT Verification Middleware
 │
 ▼
Protected Resource
```

This allows the API to distinguish between public content requests and authenticated operations.

---

# 🔑 Password Security

User passwords are not stored as plaintext.

The backend uses **bcrypt** for password hashing and verification.

```text
Plain Password
      │
      ▼
   bcrypt
      │
      ▼
Password Hash
      │
      ▼
     MySQL
```

During authentication, the supplied password is compared against the stored hash.

---

# 🗄️ Prisma & MySQL

The persistence layer uses:

**Prisma ORM + MySQL**

Prisma provides a strongly typed database client for the TypeScript backend.

```text
Express
   │
   ▼
Prisma Client
   │
   ▼
MySQL
```

The Prisma schema defines the application's data model and provides a single source of truth for database operations.

The schema is located at:

```text
pinesaas-blogs/prisma/schema.prisma
```

---

# 🖼️ Cloudinary Integration

The platform supports optional **Cloudinary** integration for cover-image uploads.

The intended flow is:

```text
Admin
  │
  ▼
Upload Cover Image
  │
  ▼
Backend
  │
  ▼
Cloudinary
  │
  ▼
Image URL / Asset Reference
  │
  ▼
Content Record
  │
  ▼
Reader
```

Keeping image storage outside the application server helps avoid storing large media files directly inside the application filesystem.

Cloudinary configuration is optional for local development.

---

# 📡 API Architecture

The backend exposes API functionality for the major areas of the platform.

The API supports functionality around:

* Authentication
* Users
* Content
* Categories
* Comments
* Ratings
* Newsletter subscriptions
* Administrative operations
* Health and operational checks

The frontend communicates with the backend through the configured API base URL.

By default, the frontend uses:

```text
/api
```

---

# 📁 Repository Structure

```text
.
├── backend/
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── ...
│
├── pinesaas-blogs/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── dist/
│   ├── package.json
│   └── ...
│
├── docs/
│   └── DEPLOYMENT.md
│
├── scripts/
│   └── ...
│
└── README.md
```

### Directory responsibilities

| Directory                | Responsibility                                  |
| ------------------------ | ----------------------------------------------- |
| `backend/`               | Express API and backend business logic          |
| `pinesaas-blogs/`        | React frontend                                  |
| `pinesaas-blogs/prisma/` | Prisma database schema                          |
| `docs/`                  | Deployment and operational documentation        |
| `scripts/`               | Deployment and process-management configuration |

---

# 🧩 Technology Stack

## Frontend

| Technology | Purpose                                  |
| ---------- | ---------------------------------------- |
| React 19   | UI framework                             |
| TypeScript | Type-safe frontend development           |
| Vite       | Development server and production builds |
| ESLint     | Code quality and linting                 |

## Backend

| Technology | Purpose                       |
| ---------- | ----------------------------- |
| Node.js    | JavaScript runtime            |
| Express    | REST API framework            |
| TypeScript | Type-safe backend development |
| Prisma     | ORM and database client       |
| MySQL      | Relational database           |

## Security

| Technology | Purpose          |
| ---------- | ---------------- |
| JWT        | Authentication   |
| bcrypt     | Password hashing |

## Media

| Technology | Purpose                      |
| ---------- | ---------------------------- |
| Cloudinary | Optional cover-image storage |

---

# 🏗️ Requirements

Before running the project locally, install:

* Node.js 20+
* npm
* MySQL 8 or compatible MySQL instance

---

# 🚀 Local Development

Clone the repository and enter the project directory:

```bash
git clone <your-repository-url>
cd <project-directory>
```

---

## 1. Install Backend Dependencies

```bash
cd backend
npm install
npm run prisma:generate
```

---

## 2. Configure Backend Environment

Create:

```text
backend/.env
```

Example:

```env
PORT=30001

FRONTEND_URL=http://localhost:5174

DATABASE_URL="mysql://root:password@localhost:3306/pinesaas_blogs"

JWT_SECRET=replace-with-a-long-local-secret

# Optional image uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> Never commit production credentials, database passwords, JWT secrets, or Cloudinary secrets to Git.

---

## 3. Initialize the Database

Apply the Prisma schema:

```bash
npm run prisma:push
```

Seed demo data when required:

```bash
npm run seed
```

---

## 4. Start the Backend

From the `backend/` directory:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:30001
```

---

## 5. Start the Frontend

Open another terminal:

```bash
cd pinesaas-blogs
npm install
npm run dev
```

Vite runs on:

```text
http://localhost:5174
```

The development frontend proxies `/api` requests to the local backend.

---

# 🌐 Frontend API Configuration

By default, the frontend uses:

```text
/api
```

No additional API URL configuration is required for the standard local setup.

If you need to use a different API server, create:

```text
pinesaas-blogs/.env
```

and configure:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 📜 Frontend Commands

Run from:

```text
pinesaas-blogs/
```

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start Vite development server                |
| `npm run build`     | Type-check and create production build       |
| `npm run typecheck` | Run TypeScript checks without emitting files |
| `npm run lint`      | Run ESLint                                   |
| `npm run preview`   | Preview the production build                 |

---

# ⚙️ Backend Commands

Run from:

```text
backend/
```

| Command                   | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `npm run dev`             | Start TypeScript API with reloads          |
| `npm run build`           | Compile API to `backend/dist/`             |
| `npm start`               | Start compiled API                         |
| `npm run seed`            | Insert demo users, categories, and content |
| `npm run prisma:generate` | Generate Prisma Client                     |
| `npm run prisma:push`     | Apply Prisma schema                        |
| `npm run prisma:migrate`  | Create/apply development migration         |

---

# 🚢 Production Deployment

The production application is deployed at:

**https://itms.cloudafk.xyz/**

The production environment uses:

* React production build
* Vite Preview
* Express API
* Prisma
* MySQL
* Supervisor
* Cloudflare Tunnel

The frontend is served through Vite Preview, while the backend API listens on localhost and is exposed through the same production infrastructure.

---

# 🔄 Production Architecture

```text
                         Internet
                            │
                            ▼
                   ┌─────────────────┐
                   │ Cloudflare      │
                   │ Tunnel          │
                   └────────┬────────┘
                            │
               ┌────────────┴────────────┐
               │                         │
               ▼                         ▼
       ┌────────────────┐       ┌────────────────┐
       │ React Frontend │       │ Express API    │
       │ Vite Preview   │       │ Node.js        │
       │                │       │                │
       └────────────────┘       └───────┬────────┘
                                        │
                                        ▼
                                ┌────────────────┐
                                │     Prisma     │
                                └───────┬────────┘
                                        │
                                        ▼
                                ┌────────────────┐
                                │     MySQL      │
                                └────────────────┘

                                        │
                                        └──────► Cloudinary
```

This keeps the frontend, API, database, and media infrastructure logically separated.

---

# 🔄 Deployment Workflow

The deployment process is documented in:

```text
docs/DEPLOYMENT.md
```

The deployment environment includes Supervisor configuration for keeping the application services running.

A typical deployment flow is:

```text
Developer
    │
    ▼
Push Changes
    │
    ▼
Production Server
    │
    ▼
Install / Build
    │
    ├── Frontend Build
    │
    ├── Backend Build
    │
    ├── Prisma Client
    │
    └── Production Configuration
            │
            ▼
       Supervisor
            │
       ┌────┴────┐
       ▼         ▼
   Frontend     API
       │         │
       └────┬────┘
            ▼
       Live Portal
```

---

# 🩺 Operational Reliability

The production setup includes operational documentation covering:

* Environment configuration
* Supervisor configuration
* Deployment
* Health checks
* Rollback procedures
* Troubleshooting

This makes deployment and service recovery more repeatable than manually starting application processes.

---

# 🔒 Production Security

Before deploying the application, production environments should use unique secrets and credentials.

Important configuration includes:

```env
DATABASE_URL=...
JWT_SECRET=...
CLOUDINARY_API_SECRET=...
```

Production secrets should remain on the server and should **never** be committed to Git or embedded in frontend source code.

If a secret has ever been exposed, it should be rotated before production use.

---

# 📊 Content Lifecycle

One of the central workflows of the application is the editorial content lifecycle.

```text
Admin
 │
 ▼
Create Article
 │
 ▼
Assign Category
 │
 ▼
Add Cover Image
 │
 ▼
Publish Content
 │
 ▼
Public News / Blog Portal
 │
 ▼
Reader
 │
 ├── Read
 ├── Rate
 ├── Comment
 └── Subscribe
```

This makes the platform suitable as a foundation for a digital publication, editorial blog, or newsroom-style website.

---

# 🧑‍💻 User Journey

A typical reader journey looks like:

```text
Landing Page
     │
     ▼
Browse Stories / News / Blogs
     │
     ▼
Open Article
     │
     ▼
Full Reader Experience
     │
     ├── View metadata
     ├── Read content
     ├── Rate article
     └── Comment
             │
             ▼
        Newsletter Signup
```

Authenticated users receive additional account-level capabilities, while administrators receive access to the management workspace.

---

# 🏛️ Why This Architecture?

### Separation of Concerns

The React frontend is responsible for presentation and user interaction, while Express owns API and business logic.

### Type Safety

TypeScript is used across the frontend and backend to reduce runtime errors and make the codebase easier to maintain.

### Structured Data Access

Prisma provides a strongly typed database access layer over MySQL.

### Secure Authentication

JWT authentication combined with bcrypt password hashing provides a standard authentication architecture.

### Scalable Media Handling

Cloudinary provides an external media layer instead of requiring the application server to manage image storage directly.

### Maintainable Deployment

Supervisor and documented deployment procedures make production process management more predictable.

---



# 📋 Feature Matrix

| Feature                       | Status |
| ----------------------------- | :----: |
| Newsroom                      |    ✅   |
| Blog Publishing               |    ✅   |
| Long-Form Stories             |    ✅   |
| Content Categories            |    ✅   |
| Reader View                   |    ✅   |
| Reading-Time Metadata         |    ✅   |
| View Metadata                 |    ✅   |
| User Registration             |    ✅   |
| User Login                    |    ✅   |
| JWT Authentication            |    ✅   |
| bcrypt Password Hashing       |    ✅   |
| Comments                      |    ✅   |
| Ratings                       |    ✅   |
| Newsletter Signup             |    ✅   |
| Admin Workspace               |    ✅   |
| Content Management            |    ✅   |
| Category Management           |    ✅   |
| Comment Management            |    ✅   |
| User Management               |    ✅   |
| MySQL Database                |    ✅   |
| Prisma ORM                    |    ✅   |
| Cloudinary Integration        |    ✅   |
| TypeScript Frontend           |    ✅   |
| TypeScript Backend            |    ✅   |
| Production Deployment         |    ✅   |
| Supervisor Process Management |    ✅   |
| Cloudflare Tunnel             |    ✅   |

---

# 🔮 Future Improvements

Potential improvements for the platform include:

* 🔎 Full-text article search
* 🏷️ Advanced content tagging
* 📰 Author profiles
* 📅 Scheduled publishing
* 📝 Draft and review workflows
* 📈 Editorial analytics
* 🔔 Subscriber notifications
* 📧 Automated newsletter campaigns
* 🖼️ Advanced image optimization
* 💬 Enhanced comment moderation
* 🔐 Refresh-token authentication
* 🛡️ API rate limiting
* 📚 OpenAPI/Swagger documentation
* 🧪 Expanded automated test coverage
* 📊 Advanced reader analytics

---

# 📄 License

**Copyright © 2026 Fahim. All Rights Reserved.**

This News & Blogs Portal is proprietary software created for portfolio, demonstration, and interview purposes.

The source code may be viewed for technical evaluation and learning, but may not be copied, redistributed, republished, commercially exploited, or presented as another person's work without prior written permission from Fahim.

Public availability of this repository does not grant permission to reuse or redistribute the source code.

For licensing or commercial-use inquiries, contact Fahim.

---

# 👨‍💻 Author

**Fahim**

Full-stack web application development with:

**React · TypeScript · Vite · Node.js · Express · Prisma · MySQL · JWT · Cloudinary**

---

## 🌐 Live Application

**News & Blogs Portal:**
https://itms.cloudafk.xyz/

Built as a full-stack publishing platform demonstrating modern frontend architecture, REST API development, authentication, relational data modeling, content management, media integration, and production deployment.
