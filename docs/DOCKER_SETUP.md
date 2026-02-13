# Docker Setup Guide - Antartur

This guide explains how to set up and run the Antartur project using Docker.

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)
- Node.js 20 (for local development without Docker)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install Prisma and all other dependencies.

### 2. Set Up Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env with your local values
nano .env
```

### 3. Start Docker Containers (Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 4. Initialize Database

```bash
# Generate Prisma Client
docker-compose exec app npx prisma generate

# Run migrations
docker-compose exec app npx prisma migrate dev --name init
```

### 5. Test Database Connection

Visit: http://localhost:3000/api/test-db

You should see:
```json
{
  "status": "success",
  "message": "Database connection successful",
  "database": "PostgreSQL",
  "connected": true,
  "timestamp": "..."
}
```

## Services

### Development (docker-compose.yml)

- **Next.js App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **pgAdmin**: http://localhost:5050
  - Email: admin@antartur.tur.ar
  - Password: admin

### Production (docker-compose.prod.yml)

- **Next.js App**: Port 3000 (internal)
- **PostgreSQL**: Internal only
- **Nginx**: Ports 80/443 (external)

## Useful Commands

### Development

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app
docker-compose logs -f postgres

# Rebuild after code changes
docker-compose up -d --build

# Access database
docker-compose exec postgres psql -U antartur -d antartur

# Run Prisma Studio (Database UI)
docker-compose exec app npx prisma studio
# Then visit: http://localhost:5555

# Run migrations
docker-compose exec app npx prisma migrate dev

# Reset database (WARNING: deletes all data)
docker-compose exec app npx prisma migrate reset
```

### Production

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update application
git pull
docker-compose -f docker-compose.prod.yml up -d --build app

# Database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U antartur antartur > backup.sql

# Database restore
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U antartur antartur < backup.sql
```

## Database Connection

### From Host Machine

```bash
# Using psql
psql -h localhost -p 5432 -U antartur -d antartur

# Password: antartur_dev_password (development)
```

### From Application

The application connects using the `DATABASE_URL` environment variable:

```
postgresql://antartur:password@postgres:5432/antartur
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Check if port is in use
lsof -i :3000
lsof -i :5432

# Remove and recreate
docker-compose down -v
docker-compose up -d --build
```

### Database connection fails

```bash
# Check if PostgreSQL is healthy
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection manually
docker-compose exec postgres pg_isready -U antartur
```

### Prisma errors

```bash
# Regenerate Prisma Client
docker-compose exec app npx prisma generate

# Reset database (if needed)
docker-compose exec app npx prisma migrate reset
```

## Production Deployment

### On VPS (CentOS 7)

1. **Install Docker** (if not installed):
```bash
sudo yum update -y
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

2. **Install Docker Compose**:
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Deploy Application**:
```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/antartur-site.git
cd antartur-site

# Create production environment
cp .env.example .env.production
nano .env.production  # Edit with production values

# Build and start
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Initialize database
docker-compose -f docker-compose.prod.yml exec app npx prisma generate
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

4. **Set Up SSL** (Let's Encrypt):
```bash
# Install certbot
sudo yum install -y certbot

# Get certificate
sudo certbot certonly --standalone -d antartur.com -d www.antartur.com

# Update nginx.conf with certificate paths
# Restart nginx container
docker-compose -f docker-compose.prod.yml restart nginx
```

## Environment Variables

### Required for Development

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SITE_URL` - Frontend URL

### Required for Production

- `POSTGRES_PASSWORD` - Strong database password
- `SITE_URL` - Production domain
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `SMTP_*` - Email configuration
- `RECAPTCHA_*` - reCAPTCHA keys

## Next Steps

1. ✅ Docker setup complete
2. ✅ PostgreSQL connection configured
3. ⏳ Define database schema (Tour, Booking, User models)
4. ⏳ Create API endpoints
5. ⏳ Migrate static data to database

