# Production Deployment

## Architecture

```text
Cloudflare
  -> Cloudflare Tunnel
     -> itms.cloudafk.xyz      -> 127.0.0.1:5174 (Vite preview)
     -> api-itms.cloudafk.xyz  -> 127.0.0.1:30001 (Express)
                                  -> MongoDB Atlas
```

The tunnel and DNS records already exist. Do not add Nginx, public port rules,
additional DNS records, or another proxy layer.

Production domains:

- Frontend: https://itms.cloudafk.xyz
- Backend: https://api-itms.cloudafk.xyz
- Source: https://github.com/csfahim007/It-Management-System

## Required environment

Keep backend secrets in `backend/.env` on the VPS. Never commit them.

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=30001
FRONTEND_URL=https://itms.cloudafk.xyz
DATABASE_URL=mongodb+srv://...
JWT_SECRET=<long random production secret>
CLOUDINARY_CLOUD_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_API_SECRET=<optional>
```

`JWT_REFRESH_SECRET` may remain configured for compatibility, but the current
application signs and verifies tokens with `JWT_SECRET`. The frontend production
build uses the public, non-secret value:

```dotenv
VITE_API_URL=https://api-itms.cloudafk.xyz/api
```

MongoDB Atlas must allow the VPS egress IP and the database user must have the
permissions required by the application. Cloudinary values are only required
when image uploads are enabled.

## First-time VPS setup

Run as the application user where possible. The repository is expected at the
path below.

```bash
cd /home/administrator/projects/pinesaas-crm
cp backend/.env.production.example backend/.env
chmod 600 backend/.env
mkdir -p backend/logs pinesaas-blogs/logs
sudo cp scripts/supervisor/pinesaas-crm.conf /etc/supervisor/conf.d/pinesaas-crm.conf
sudo supervisorctl reread
sudo supervisorctl update
```

Before the first production start, replace all placeholder secrets in
`backend/.env` with production values. If the seed data was used, change the
seeded administrator password before production use. Do not put that demo
credential in production documentation or source control.

Supervisor runs both services as `administrator`, restarts them on failure, and
starts them with Supervisor at boot. The backend and frontend commands are
`npm run start:prod` and `npm run preview -- --host 127.0.0.1 --port 5174`.

## Deploying

From a development checkout:

```bash
git status
git add .
git commit -m "Describe the change"
git push origin main
```

On the VPS:

```bash
cd /home/administrator/projects/pinesaas-crm
./scripts/deploy.sh
```

The script requires branch `main`, a clean tracked worktree, and a fast-forward
update from `origin/main`. It runs `npm ci`, Prisma client generation, the
backend build, the frontend build, Supervisor restarts, local checks, and HTTPS
checks. This MongoDB Prisma setup has no SQL migration workflow, so migrations
are skipped.

## Health checks and operations

```bash
curl -fsS http://127.0.0.1:30001/api/health
curl -fsS https://api-itms.cloudafk.xyz/api/health
curl -fsS https://itms.cloudafk.xyz/
sudo supervisorctl status pinesaas-backend pinesaas-frontend
sudo supervisorctl restart pinesaas-backend pinesaas-frontend
sudo supervisorctl tail -f pinesaas-backend stderr
sudo supervisorctl tail -f pinesaas-frontend stderr
```

The tunnel should remain configured for localhost targets only. Confirm listeners
with `ss -ltnp | grep -E '(:30001|:5174)'`; both should show `127.0.0.1`.

## Rollback

Inspect the previous deployed commit, then deploy it explicitly after confirming
the working tree is clean:

```bash
cd /home/administrator/projects/pinesaas-crm
git log --oneline -5
git checkout -B main <known-good-commit>
./scripts/deploy.sh
```

After recovery, return the branch to `origin/main` with a normal fast-forward
deployment. Coordinate any database changes separately; this application
does not currently use Prisma migrations for MongoDB.

## Troubleshooting

- `deploy.sh` rejects `master`: rename/push the deployment branch as `main`, or
  coordinate a repository branch policy change before deploying.
- Supervisor reports an unknown program: install the checked-in config and run
  `sudo supervisorctl reread && sudo supervisorctl update`.
- A port is busy: inspect `ss -ltnp`, stop the old process through Supervisor,
  and do not expose either port publicly.
- API calls fail in the browser: verify `VITE_API_URL`, `FRONTEND_URL`, and the
  tunnel routes, then rebuild the frontend.
- Database requests fail: check `DATABASE_URL`, Atlas network access, and the
  application logs without printing credentials.

## Security notes

Rotate any database or JWT credentials that have ever been committed or shared.
The repository's seed script contains demo administrator data; change that
password before production use. The current authentication uses bcrypt password
hashing and JWT bearer tokens. Authentication and authorization business logic
was intentionally left unchanged by the deployment configuration.