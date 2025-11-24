# 🚀 Quick Start - Docker & PostgreSQL Setup

## ✅ What Was Created

### Docker Files
- ✅ `docker/Dockerfile.nextjs` - Next.js production image
- ✅ `docker/nginx.conf` - Nginx reverse proxy config
- ✅ `docker-compose.yml` - Development setup
- ✅ `docker-compose.prod.yml` - Production setup
- ✅ `.dockerignore` - Exclude files from Docker build

### Database Files
- ✅ `prisma/schema.prisma` - Empty database schema (to be defined)
- ✅ `src/lib/db.ts` - Prisma client connection
- ✅ `src/app/api/test-db/route.ts` - Database connection test endpoint

### Configuration
- ✅ `next.config.ts` - Updated with `output: 'standalone'` for Docker
- ✅ `package.json` - Added Prisma dependencies
- ✅ `.env.example` - Environment variables template

## 🎯 Next Steps

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `@prisma/client` - Database client
- `prisma` - Database toolkit

### 2. Create Local Environment File

```bash
cp .env.example .env
```

Edit `.env` and update:
- Database password (or keep default for dev)
- Your existing SMTP credentials
- Your existing reCAPTCHA keys

### 3. Start Docker (Local Development)

```bash
# Start all services
docker-compose up -d

# Check services are running
docker ps

# View logs
docker-compose logs -f app
```

**Services will be available:**
- Next.js: http://localhost:3000
- PostgreSQL: localhost:5432
- pgAdmin: http://localhost:5050 (admin@antartur.com / admin)

### 4. Initialize Database

```bash
# Generate Prisma Client
docker-compose exec app npx prisma generate

# Create database tables
docker-compose exec app npx prisma migrate dev --name init
```

### 5. Test Database Connection

Visit: **http://localhost:3000/api/test-db**

You should see:
```json
{
  "status": "success",
  "message": "Database connection successful",
  "database": "PostgreSQL",
  "connected": true
}
```

## 📋 Current Database Schema

The schema currently has **empty placeholder tables**:

- `Tour` - Will store tour information
- `Booking` - Will store booking/order data
- `User` - Will store admin users

**Next step:** We'll define the complete structure together.

## 🔧 Useful Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app
docker-compose logs -f postgres

# Rebuild after changes
docker-compose up -d --build

# Access database directly
docker-compose exec postgres psql -U antartur -d antartur

# Prisma Studio (Database UI)
docker-compose exec app npx prisma studio
# Visit: http://localhost:5555

# Run migrations
docker-compose exec app npx prisma migrate dev
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Or use different port in docker-compose.yml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

### Database Connection Fails

```bash
# Check PostgreSQL is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U antartur
```

### Prisma Errors

```bash
# Regenerate client
docker-compose exec app npx prisma generate

# Reset database (WARNING: deletes data)
docker-compose exec app npx prisma migrate reset
```

## 📦 What's Next?

1. ✅ Docker setup - **DONE**
2. ✅ PostgreSQL connection - **DONE**
3. ⏳ Define database schema (Tour, Booking, User models)
4. ⏳ Create API endpoints
5. ⏳ Migrate static JSON data to database

## 📚 Full Documentation

See `DOCKER_SETUP.md` for complete documentation.

