# UniInnovate Backend

NestJS + Prisma + PostgreSQL backend for the UniInnovate Platform.

## Quick Start

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed database
npx prisma db seed

# 6. Start dev server
npm run start:dev
```

API runs at `http://localhost:3000/api/v1`  
Swagger docs at `http://localhost:3000/api/docs`

## Demo Login

All demo accounts use password: `password123`

| Role | Email |
|------|-------|
| Super Admin | admin@tto.edu |
| TTO Staff | tto@university.edu |
| University Admin | university.admin@tto.edu |
| Company | company@tech.com |
| Student | student@university.edu |
| Researcher | researcher@university.edu |
| Mentor | mentor@university.edu |
| Reviewer | reviewer@university.edu |
| Legal/IP | legal@university.edu |

## Git Init

```bash
cd backend
git init -b main
git add -A
git commit -m "feat: initial NestJS backend implementation"
```
