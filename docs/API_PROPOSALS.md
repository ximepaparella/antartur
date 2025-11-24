# Antartur - API & Backend Proposals

**Version:** 1.0  
**Date:** November 2025  
**Purpose:** Comprehensive analysis of backend API options

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Requirements Analysis](#requirements-analysis)
3. [Proposal 1: Next.js API Routes](#proposal-1-nextjs-api-routes)
4. [Proposal 2: External Node.js API](#proposal-2-external-nodejs-api)
5. [Proposal 3: Supabase (BaaS)](#proposal-3-supabase-baas)
6. [Proposal 4: Firebase](#proposal-4-firebase)
7. [Proposal 5: Hybrid Approach](#proposal-5-hybrid-approach)
8. [Proposal 6: Headless CMS](#proposal-6-headless-cms)
9. [Database Considerations](#database-considerations)
10. [Docker & Deployment](#docker--deployment)
11. [Comparison Matrix](#comparison-matrix)
12. [Recommended Solution](#recommended-solution)
13. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Decision Criteria

Before choosing an approach, we need to establish decision criteria based on your answers to the questions I asked earlier. Here's how each criterion affects the choice:

| Criterion | Impact | Questions to Consider |
|-----------|--------|----------------------|
| **Team Expertise** | HIGH | Node.js? PostgreSQL? Docker? Cloud platforms? |
| **Budget** | HIGH | Self-hosted OK? Managed services preferred? |
| **Scale** | MEDIUM | Expected bookings/month? Tours count? |
| **Speed to Market** | HIGH | Need MVP in weeks or months? |
| **Maintenance** | MEDIUM | Dev team size? Time for DevOps? |
| **Data Sovereignty** | LOW | Data must stay in Argentina? |

### Quick Recommendation Preview

**IF:**
- Small team (1-2 devs)
- Limited DevOps experience
- Need MVP fast (< 1 month)
- Budget allows managed services ($50-200/month)

**THEN:** ✅ **Supabase** (Proposal 3)

**IF:**
- Experienced team (3+ devs)
- Have DevOps capacity
- Need full control
- Planning microservices future

**THEN:** ✅ **External Node.js API** (Proposal 2)

**IF:**
- Next.js expertise
- Simple CRUD needs
- Tight budget
- Small scale (< 100 bookings/day)

**THEN:** ✅ **Next.js API Routes** (Proposal 1)

---

## Requirements Analysis

### Functional Requirements

**Core Features:**
1. **Tours Management (CRUD)**
   - Create/Read/Update/Delete tours
   - Manage pricing (ARS & USD)
   - Upload images
   - Set availability calendars

2. **Bookings Management**
   - Create bookings (orders)
   - Read booking details
   - Update booking status
   - Cancel bookings
   - Track payment status

3. **Availability Management**
   - Real-time capacity tracking
   - Conflict prevention
   - Date/time slot management

4. **User Management**
   - Admin authentication
   - Role-based access (Admin, Guide, Manager)
   - Optional customer accounts

5. **Notifications**
   - Email confirmations
   - Admin notifications
   - Reminder emails

6. **Reporting**
   - Booking statistics
   - Revenue reports
   - Occupancy rates

### Non-Functional Requirements

**Performance:**
- API response < 200ms (p95)
- Support 100 concurrent users
- Handle 1000 bookings/day

**Availability:**
- 99.5% uptime minimum
- Graceful degradation
- Quick recovery

**Security:**
- Authentication & authorization
- Data encryption at rest
- HTTPS only
- Input validation
- SQL injection prevention
- XSS prevention

**Scalability:**
- Horizontal scaling capability
- Database read replicas support
- CDN for static assets

### Technical Requirements

**Must Have:**
- RESTful API
- JSON responses
- TypeScript support
- CORS configuration
- Rate limiting
- Error handling

**Nice to Have:**
- GraphQL option
- WebSocket for real-time
- Caching layer
- API versioning
- OpenAPI documentation

---

## Proposal 1: Next.js API Routes

### Overview

Extend the current Next.js app with API Routes in the App Router, keeping everything in a single codebase (monolith).

### Architecture

```
antartur-site/ (Single Next.js Project)
├── src/
│   ├── app/
│   │   ├── (pages)
│   │   └── api/                    # API Routes
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   └── logout/route.ts
│   │       ├── tours/
│   │       │   ├── route.ts        # GET all, POST create
│   │       │   └── [id]/
│   │       │       └── route.ts    # GET, PUT, DELETE
│   │       ├── bookings/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       └── availability/
│   │           └── route.ts
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts           # Database client
│   │   │   ├── models/
│   │   │   │   ├── Tour.ts
│   │   │   │   ├── Booking.ts
│   │   │   │   └── User.ts
│   │   │   └── migrations/
│   │   └── services/
│   │       ├── tourService.ts
│   │       ├── bookingService.ts
│   │       └── emailService.ts
│   └── middleware.ts               # Auth & rate limiting
```

### Technology Stack

```json
{
  "database": "PostgreSQL or MySQL",
  "orm": "Prisma or Drizzle",
  "auth": "NextAuth.js",
  "validation": "Zod",
  "rate-limit": "rate-limiter-flexible (existing)",
  "email": "nodemailer (existing) or Resend"
}
```

### Example Implementation

**API Route Example:**
```typescript
// src/app/api/tours/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { tourSchema } from '@/lib/validations/tour';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const tours = await prisma.tour.findMany({
      where: category ? { category } : undefined,
      include: {
        pricing: true,
        availability: true,
      },
    });
    
    return NextResponse.json(tours);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth(request);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = tourSchema.parse(body);
    
    const tour = await prisma.tour.create({
      data: validatedData,
    });
    
    return NextResponse.json(tour, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create tour' },
      { status: 500 }
    );
  }
}
```

**Database Client:**
```typescript
// src/lib/db/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Service Layer:**
```typescript
// src/lib/services/tourService.ts
import { prisma } from '@/lib/db/client';
import type { Tour, Prisma } from '@prisma/client';

export class TourService {
  async getAllTours(filters?: { category?: string; search?: string }) {
    const where: Prisma.TourWhereInput = {};
    
    if (filters?.category) {
      where.category = filters.category;
    }
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    return prisma.tour.findMany({
      where,
      include: {
        pricing: true,
        availability: {
          where: {
            date: { gte: new Date() }
          },
          orderBy: { date: 'asc' }
        },
      },
    });
  }
  
  async getTourById(id: string) {
    return prisma.tour.findUnique({
      where: { id },
      include: {
        pricing: true,
        availability: true,
        testimonials: true,
        gallery: true,
      },
    });
  }
  
  async createTour(data: Prisma.TourCreateInput) {
    return prisma.tour.create({ data });
  }
  
  async updateTour(id: string, data: Prisma.TourUpdateInput) {
    return prisma.tour.update({
      where: { id },
      data,
    });
  }
  
  async deleteTour(id: string) {
    return prisma.tour.delete({ where: { id } });
  }
}

export const tourService = new TourService();
```

### Pros ✅

1. **Single Codebase:**
   - Frontend + backend in one project
   - Shared types between client and server
   - Easier deployments

2. **Type Safety:**
   - End-to-end TypeScript
   - Shared interfaces
   - Autocompletion everywhere

3. **Simple Deployment:**
   - Deploy to Vercel (zero-config)
   - Single Docker image
   - No CORS issues

4. **Fast Development:**
   - Hot reload for API changes
   - Use existing dependencies
   - No API client setup needed

5. **Built-in Features:**
   - Middleware for auth
   - Edge runtime option
   - Incremental Static Regeneration

### Cons ❌

1. **Scaling Limitations:**
   - API and frontend scale together
   - Can't scale API independently
   - Serverless cold starts

2. **Vendor Lock-in:**
   - Tied to Next.js/Vercel
   - Harder to migrate later

3. **Performance:**
   - Serverless timeout limits (10-60s)
   - Cold start latency
   - Not ideal for long-running tasks

4. **Database Connections:**
   - Serverless connection pooling issues
   - Need connection pooler (PgBouncer)

5. **Complexity Growth:**
   - Monolith can become unwieldy
   - API logic mixed with pages

### Recommended Database

**Option A: Vercel Postgres**
```bash
npm install @vercel/postgres
```
- Managed PostgreSQL
- Automatic connection pooling
- $20-50/month
- Integrated with Vercel

**Option B: Neon (PostgreSQL)**
```bash
npm install @neondatabase/serverless
```
- Serverless Postgres
- Generous free tier
- Auto-scaling
- Connection pooling built-in

**Option C: PlanetScale (MySQL)**
```bash
npm install @planetscale/database
```
- Serverless MySQL
- Branching (like Git)
- Free tier available
- No connection pooling needed

### Cost Estimate

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **Vercel Hosting** | Yes (hobby) | $20/month (Pro) |
| **Database (Neon)** | 512MB free | $19/month (1GB) |
| **Storage (Vercel Blob)** | 1GB free | $0.15/GB/month |
| **Email (Resend)** | 100/day | $20/month (10k) |
| **Total** | $0 (MVP) | ~$60-80/month |

### When to Choose This

✅ **Choose if:**
- Small to medium scale (< 10k bookings/month)
- Team experienced with Next.js
- Want fastest time to market
- Comfortable with Vercel
- Budget is flexible

❌ **Avoid if:**
- Need independent API scaling
- Planning microservices
- Have long-running jobs
- Need multi-region deployment

---

## Proposal 2: External Node.js API

### Overview

Build a separate Node.js/Express API as a standalone service, completely decoupled from the Next.js frontend.

### Architecture

```
Project Structure (Two Repositories):

1. antartur-site/ (Next.js Frontend)
└── (existing structure)

2. antartur-api/ (Node.js Backend)
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── tours.controller.ts
│   │   ├── bookings.controller.ts
│   │   └── auth.controller.ts
│   ├── services/
│   │   ├── tours.service.ts
│   │   ├── bookings.service.ts
│   │   └── email.service.ts
│   ├── models/
│   │   ├── Tour.ts
│   │   ├── Booking.ts
│   │   └── User.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rateLimit.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── tours.routes.ts
│   │   ├── bookings.routes.ts
│   │   └── auth.routes.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   └── logger.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   └── integration/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── package.json
└── tsconfig.json
```

### Technology Stack

```json
{
  "runtime": "Node.js 20 LTS",
  "framework": "Express or Fastify",
  "language": "TypeScript",
  "database": "PostgreSQL 16",
  "orm": "Prisma or TypeORM",
  "auth": "Passport.js + JWT",
  "validation": "Zod or Joi",
  "logging": "Winston or Pino",
  "testing": "Jest + Supertest",
  "docs": "Swagger/OpenAPI"
}
```

### Example Implementation

**Main Server:**
```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { toursRouter } from './routes/tours.routes';
import { bookingsRouter } from './routes/bookings.routes';
import { authRouter } from './routes/auth.routes';
import { logger } from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/bookings', bookingsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.PORT, () => {
  logger.info(`API server running on port ${config.PORT}`);
});
```

**Controller:**
```typescript
// src/controllers/tours.controller.ts
import { Request, Response, NextFunction } from 'express';
import { toursService } from '../services/tours.service';
import { CreateTourSchema, UpdateTourSchema } from '../validations/tour.schema';

export class ToursController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search } = req.query;
      const tours = await toursService.getAllTours({
        category: category as string,
        search: search as string,
      });
      res.json(tours);
    } catch (error) {
      next(error);
    }
  }
  
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tour = await toursService.getTourById(id);
      
      if (!tour) {
        return res.status(404).json({ error: 'Tour not found' });
      }
      
      res.json(tour);
    } catch (error) {
      next(error);
    }
  }
  
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateTourSchema.parse(req.body);
      const tour = await toursService.createTour(validatedData);
      res.status(201).json(tour);
    } catch (error) {
      next(error);
    }
  }
  
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = UpdateTourSchema.parse(req.body);
      const tour = await toursService.updateTour(id, validatedData);
      res.json(tour);
    } catch (error) {
      next(error);
    }
  }
  
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await toursService.deleteTour(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const toursController = new ToursController();
```

**Routes:**
```typescript
// src/routes/tours.routes.ts
import { Router } from 'express';
import { toursController } from '../controllers/tours.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { rateLimit } from '../middleware/rateLimit';

export const toursRouter = Router();

// Public routes
toursRouter.get('/', rateLimit({ max: 100 }), toursController.getAll);
toursRouter.get('/:id', rateLimit({ max: 100 }), toursController.getById);

// Admin routes
toursRouter.post(
  '/',
  authenticate,
  authorize(['admin']),
  toursController.create
);

toursRouter.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  toursController.update
);

toursRouter.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  toursController.delete
);
```

**Docker Setup:**
```dockerfile
# docker/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --production

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/antartur
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=antartur
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

### Pros ✅

1. **Complete Separation:**
   - API can be deployed independently
   - Different scaling strategies
   - Clear boundaries

2. **Technology Freedom:**
   - Not tied to Next.js
   - Choose any database
   - Any hosting platform

3. **Better Scaling:**
   - Scale API independently
   - Multiple instances
   - Load balancing easy

4. **Microservices Ready:**
   - Can split into services later
   - Each service independently deployable

5. **Long-Running Tasks:**
   - No serverless timeouts
   - Background jobs
   - WebSocket support

6. **Team Collaboration:**
   - Frontend/backend teams work independently
   - Different deployment cycles
   - Clear API contract

### Cons ❌

1. **More Complexity:**
   - Two codebases
   - Two deployment pipelines
   - CORS configuration needed

2. **Development Overhead:**
   - Run two servers locally
   - Type syncing between projects
   - More infrastructure

3. **Higher Costs:**
   - Need server hosting ($10-50/month minimum)
   - Database hosting
   - Potentially CDN

4. **DevOps Required:**
   - Manage deployments
   - Monitor two services
   - Handle networking

5. **Slower Development:**
   - API changes require both repos
   - More boilerplate
   - Need API client generation

### Infrastructure Requirements

**Development:**
```bash
# Terminal 1: Frontend
cd antartur-site
npm run dev

# Terminal 2: Backend
cd antartur-api
npm run dev

# Terminal 3: Database
docker-compose up db redis
```

**Production Options:**

**Option A: VPS (DigitalOcean, Linode, Hetzner)**
- 2GB RAM VPS: $12/month
- Managed PostgreSQL: $15/month
- Total: ~$30/month

**Option B: Container Platform (Fly.io, Railway)**
- API container: $10-20/month
- Database: $10-15/month
- Total: ~$25-35/month

**Option C: AWS/GCP**
- ECS/Cloud Run: $20-40/month
- RDS: $15-30/month
- Total: ~$40-70/month

### Cost Estimate

| Component | Development | Production |
|-----------|-------------|------------|
| **API Hosting** | Free (local) | $15-40/month |
| **Database** | Free (Docker) | $15-30/month |
| **Redis** | Free (Docker) | $5-10/month |
| **CDN** | - | $0-10/month |
| **Monitoring** | - | $0-20/month |
| **Total** | $0 | $35-110/month |

### When to Choose This

✅ **Choose if:**
- Need full control over infrastructure
- Have DevOps capacity
- Planning to scale significantly
- Want technology flexibility
- Team experienced with backend development

❌ **Avoid if:**
- Small team (< 2 devs)
- Limited DevOps experience
- Need fast MVP
- Budget constrained

---

## Proposal 3: Supabase (BaaS)

### Overview

Use Supabase as a Backend-as-a-Service (BaaS) platform, providing database, authentication, storage, and real-time capabilities out of the box.

### What is Supabase?

**Supabase = PostgreSQL + Auth + Storage + Realtime + Edge Functions**

- Open-source Firebase alternative
- Built on PostgreSQL
- Auto-generated REST & GraphQL APIs
- Real-time subscriptions
- Row-level security
- File storage
- Hosted or self-hosted

### Architecture

```
Frontend (Next.js)
    ↓
Supabase Client Library
    ↓
Supabase Cloud/Self-hosted
├── PostgreSQL Database (with RLS)
├── Auth (JWT-based)
├── Storage (S3-compatible)
├── Realtime (WebSocket)
└── Edge Functions (Deno)
```

### Implementation

**1. Setup Supabase:**
```bash
npm install @supabase/supabase-js
npm install @supabase/ssr  # For Next.js App Router
```

**2. Initialize Client:**
```typescript
// src/lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/ssr';

export function createClient() {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
}
```

**3. Database Schema:**
```sql
-- migrations/001_initial_schema.sql

-- Tours table
CREATE TABLE tours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT CHECK (category IN ('winter', 'summer', 'antarctica')),
  difficulty TEXT,
  duration INTEGER, -- in minutes
  price_adult_ars INTEGER NOT NULL,
  price_child_ars INTEGER NOT NULL,
  price_adult_usd NUMERIC(10,2),
  price_child_usd NUMERIC(10,2),
  featured_image TEXT,
  hero_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery images
CREATE TABLE tour_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability
CREATE TABLE tour_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  capacity INTEGER NOT NULL,
  booked INTEGER DEFAULT 0,
  UNIQUE(tour_id, date, time_start)
);

-- Bookings
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  tour_id UUID REFERENCES tours(id),
  availability_id UUID REFERENCES tour_availability(id),
  booking_date DATE NOT NULL,
  time_slot_start TIME NOT NULL,
  time_slot_end TIME NOT NULL,
  adults INTEGER NOT NULL,
  children INTEGER DEFAULT 0,
  currency TEXT CHECK (currency IN ('ARS', 'USD')),
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_method TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Passengers
CREATE TABLE passengers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  document_number TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  email TEXT,
  phone TEXT,
  is_adult BOOLEAN NOT NULL,
  dietary_restrictions JSONB,
  health_restrictions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing info
CREATE TABLE billing_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT,
  document_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read access to tours
CREATE POLICY "Tours are viewable by everyone"
  ON tours FOR SELECT
  USING (true);

-- Admin can do everything
CREATE POLICY "Admins can do everything with tours"
  ON tours
  USING (auth.jwt() ->> 'role' = 'admin');

-- Users can read their own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Create indexes
CREATE INDEX idx_tours_category ON tours(category);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_availability_tour_date ON tour_availability(tour_id, date);
CREATE INDEX idx_bookings_order_number ON bookings(order_number);
CREATE INDEX idx_bookings_status ON bookings(status);
```

**4. Frontend Usage:**
```typescript
// Example: Fetching tours
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ToursGrid({ category }: { category?: string }) {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTours() {
      let query = supabase
        .from('tours')
        .select(`
          *,
          tour_gallery (*)
        `);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching tours:', error);
      } else {
        setTours(data);
      }
      setLoading(false);
    }
    
    fetchTours();
  }, [category]);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {tours.map(tour => (
        <TourCard key={tour.id} tour={tour} />
      ))}
    </div>
  );
}

// Example: Creating a booking
async function createBooking(bookingData) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Example: Real-time subscription
function useRealtimeAvailability(tourId: string) {
  const [availability, setAvailability] = useState([]);
  const supabase = createClient();
  
  useEffect(() => {
    // Initial fetch
    supabase
      .from('tour_availability')
      .select('*')
      .eq('tour_id', tourId)
      .then(({ data }) => setAvailability(data || []));
    
    // Subscribe to changes
    const channel = supabase
      .channel('availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tour_availability',
          filter: `tour_id=eq.${tourId}`,
        },
        (payload) => {
          // Update state with real-time changes
          setAvailability(current => {
            // Handle INSERT, UPDATE, DELETE
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tourId]);
  
  return availability;
}
```

**5. Edge Functions (for complex logic):**
```typescript
// supabase/functions/process-booking/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { booking } = await req.json();
  
  // Complex booking logic here
  // - Check availability
  // - Reserve slot
  // - Send emails
  // - Process payment
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Pros ✅

1. **Rapid Development:**
   - Auto-generated APIs
   - No backend code needed for CRUD
   - Built-in auth
   - Real-time out of the box

2. **Type Safety:**
   - Generate TypeScript types from schema
   - Type-safe queries
   - Autocomplete

3. **Built-in Features:**
   - Row-level security (RLS)
   - File storage
   - Real-time subscriptions
   - Auto-scaling

4. **Developer Experience:**
   - Dashboard for data management
   - Migration tools
   - Local development (Docker)
   - Good documentation

5. **Cost Effective:**
   - Generous free tier
   - Predictable pricing
   - Includes everything

6. **Open Source:**
   - Can self-host
   - No vendor lock-in (use PostgreSQL)
   - Community support

### Cons ❌

1. **Learning Curve:**
   - PostgreSQL RLS policies
   - Supabase-specific concepts
   - Edge Functions (Deno)

2. **Limited Complex Logic:**
   - Edge Functions have constraints
   - Not ideal for heavy processing
   - Deno vs Node.js differences

3. **Less Control:**
   - Managed infrastructure
   - Can't customize everything
   - Platform-specific features

4. **Potential Scaling Limits:**
   - Free tier limits
   - Need to upgrade for high traffic
   - Connection pooling important

### Cost Estimate

| Tier | Database | Bandwidth | Storage | Price |
|------|----------|-----------|---------|-------|
| **Free** | 500MB | 5GB | 1GB | $0 |
| **Pro** | 8GB | 250GB | 100GB | $25/month |
| **Team** | 32GB | 500GB | 200GB | $599/month |

**Recommended for Antartur:** Start Free, move to Pro when needed (~$25/month)

### When to Choose This

✅ **Choose if:**
- Want fastest development
- Need real-time features
- Small to medium team
- Limited backend experience
- Budget-conscious ($0-25/month)
- Like PostgreSQL

❌ **Avoid if:**
- Need complex business logic
- Want full infrastructure control
- Have existing backend team
- Need custom database (non-Postgres)

---

## Proposal 4: Firebase

### Overview

Use Google Firebase as a complete backend solution with Firestore NoSQL database, authentication, storage, and cloud functions.

### What is Firebase?

- Google's BaaS platform
- NoSQL database (Firestore)
- Real-time sync
- Authentication
- Cloud Storage
- Cloud Functions (Node.js)
- Hosting
- Analytics

### Quick Assessment

**Pros:**
- ✅ Mature platform
- ✅ Excellent documentation
- ✅ Easy real-time
- ✅ Google integration
- ✅ Generous free tier

**Cons:**
- ❌ NoSQL (less suitable for booking system)
- ❌ More expensive at scale
- ❌ Vendor lock-in
- ❌ Complex queries difficult

### Recommendation for Antartur

**🚫 NOT RECOMMENDED**

**Reason:** Booking systems with complex relationships (tours, availability, bookings, passengers) are better suited for relational databases (PostgreSQL). Firestore's NoSQL structure would make:
- Complex joins difficult
- Transaction management harder
- Reporting more complex
- Data consistency challenging

**Better Alternatives:** Supabase (Postgres-based) or traditional SQL database.

---

## Proposal 5: Hybrid Approach

### Overview

Combine Next.js API Routes for simple operations with an external API for complex logic.

### Architecture

```
Next.js App
├── API Routes (Simple Operations)
│   ├── /api/tours → Direct DB read (cached)
│   ├── /api/contact → Simple form submission
│   └── /api/availability → Read availability
│
└── External API (Complex Operations)
    ├── POST /bookings → Booking logic
    ├── POST /payments → Payment processing
    ├── Background jobs
    └── Admin operations
```

### When to Use

**Next.js API Routes for:**
- Public read operations (tours, availability)
- Contact forms
- Simple CRUD (with caching)

**External API for:**
- Booking creation (transaction-heavy)
- Payment processing
- Email sending
- Report generation
- Admin operations

### Pros ✅

- Best of both worlds
- Start simple, add complexity as needed
- Optimize costs (less external API usage)
- Gradual migration path

### Cons ❌

- More complex architecture
- Two APIs to maintain
- Potential consistency issues

### Recommendation

✅ **Good option** if you start with Next.js API Routes and need to scale specific features later.

---

## Proposal 6: Headless CMS

### Overview

Use a headless CMS like Strapi, Contentful, or Sanity for content management, with custom backend for bookings.

### CMS Options

**Strapi (Self-hosted):**
- Open-source
- PostgreSQL/MySQL
- REST & GraphQL
- Admin UI included
- Self-hosted or Strapi Cloud

**Contentful (SaaS):**
- Hosted solution
- GraphQL API
- Great for content
- $489/month for team

**Sanity (Hybrid):**
- React-based CMS
- Real-time collaboration
- Free tier available
- Good developer experience

### Recommendation for Antartur

**🤔 PARTIALLY USEFUL**

**Use CMS for:** Tour content, images, descriptions, SEO  
**Use custom backend for:** Bookings, payments, availability

**Why not full CMS?**
- Booking logic too complex for CMS
- Need real-time availability
- Payment integration
- Transaction management

**Hybrid Setup:**
```
Sanity CMS (Tours content) → Next.js Frontend
                                     ↓
                              Custom API (Bookings)
```

---

## Database Considerations

### SQL vs NoSQL

**For Booking System: Use SQL (PostgreSQL)**

**Why:**
- Strong ACID compliance
- Complex relationships (tours ↔ bookings ↔ passengers)
- Aggregations and reporting
- Referential integrity
- Transaction support

### Database Schema (PostgreSQL)

**Core Tables:**
1. `tours` - Tour information
2. `tour_availability` - Date/time slots with capacity
3. `bookings` - Order records
4. `passengers` - Passenger details (1-to-many with bookings)
5. `billing_info` - Billing details
6. `users` - Admin users
7. `payments` - Payment transactions

**Relationships:**
```
tours (1) ─────── (many) tour_availability
  │
  │
  └──────────── (many) bookings
                   │
                   ├─── (many) passengers
                   ├─── (1) billing_info
                   └─── (many) payments
```

### Database Hosting Options

**Managed PostgreSQL:**
- **Neon**: Serverless, free tier, great for Next.js
- **Supabase**: Full BaaS, includes more features
- **Railway**: Simple, good pricing
- **DigitalOcean Managed**: $15/month, reliable
- **AWS RDS**: Scalable but complex
- **Vercel Postgres**: Integrated but pricey

**Self-Hosted:**
- **Docker on VPS**: Cheapest, need DevOps
- **PostgreSQL on DigitalOcean Droplet**: $6-12/month

---

## Docker & Deployment

### Docker Setup (External API)

**Full Stack Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Next.js Frontend
  frontend:
    build:
      context: ./antartur-site
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001
    depends_on:
      - api

  # Node.js API
  api:
    build:
      context: ./antartur-api
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/antartur
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis

  # PostgreSQL Database
  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=antartur
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  # Redis for caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # PgAdmin (optional, for dev)
  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@antartur.com
      - PGADMIN_DEFAULT_PASSWORD=admin

volumes:
  postgres_data:
```

### Deployment Strategies

**Option A: All-in-One VPS**
```bash
# Single VPS (Hetzner, DigitalOcean)
# 4GB RAM, 2 vCPU - $20/month

ssh user@server
git clone repositories
cd /app
docker-compose up -d
```

**Pros:** Cheapest, simple  
**Cons:** Single point of failure

**Option B: Separate Services**
- Frontend: Vercel ($0-20/month)
- API: Fly.io ($10-20/month)
- Database: Neon/Railway ($0-15/month)

**Pros:** Better scaling, managed services  
**Cons:** More expensive, more complex

**Option C: Kubernetes (Overkill)**
- GKE, EKS, or DigitalOcean Kubernetes
- Auto-scaling, high availability
- $100-300/month

**Pros:** Enterprise-grade  
**Cons:** Complex, expensive, unnecessary for current scale

---

## Comparison Matrix

| Criteria | Next.js API | External Node.js | Supabase | Firebase | Hybrid |
|----------|-------------|------------------|----------|----------|--------|
| **Development Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Scalability** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cost (MVP)** | $0-20 | $30-50 | $0-25 | $0-20 | $10-40 |
| **Cost (Scale)** | $60-150 | $100-300 | $50-200 | $100-500 | $80-250 |
| **Complexity** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **DevOps Required** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ⭐⭐⭐ |
| **Type Safety** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Real-time** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Flexibility** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Vendor Lock-in** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Learning Curve** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Suitable for Booking** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Recommended Solution

### 🏆 Primary Recommendation: **Supabase (Proposal 3)**

**For Antartur specifically, Supabase is the best choice because:**

1. **Fast Time to Market:** Build MVP in 2-3 weeks
2. **Cost Effective:** Start free, $25/month when scaling
3. **PostgreSQL:** Perfect for booking system
4. **Real-time:** Get availability updates instantly
5. **Type Safety:** Generate types from schema
6. **No DevOps:** Managed platform
7. **Future-Proof:** Can self-host later if needed

### Implementation Path

**Phase 1: MVP (2-3 weeks)**
```bash
Week 1:
- Set up Supabase project
- Create database schema
- Implement tours CRUD
- Migrate static JSON data

Week 2:
- Implement booking flow
- Add authentication
- Real-time availability
- Email notifications

Week 3:
- Admin dashboard
- Testing
- Deployment
- Documentation
```

**Phase 2: Enhancement (1-2 months)**
- Payment integration
- Advanced reporting
- Mobile optimization
- Performance tuning

**Phase 3: Scale (3-6 months)**
- Add caching layer
- Optimize queries
- Consider Edge Functions for heavy logic
- If needed, move specific services to external API

### Alternative Recommendation: **Next.js API Routes**

**Choose if:**
- You absolutely need to stay in Next.js ecosystem
- Have budget constraints (want to start $0)
- Team very experienced with Next.js
- Don't need real-time features

### Migration Path

**Start with Supabase, migrate later if needed:**
```
Supabase → Self-hosted Supabase → External API
```

Since Supabase is built on PostgreSQL and is open-source, you can:
1. Export your database
2. Deploy Supabase locally (Docker)
3. Eventually migrate to custom API
4. No data loss, minimal code changes

---

## Implementation Roadmap

### Detailed Supabase Implementation

**Step 1: Project Setup (Day 1)**
```bash
# 1. Create Supabase project (supabase.com)
# 2. Get credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # For server-side

# 3. Install dependencies
npm install @supabase/supabase-js @supabase/ssr
```

**Step 2: Database Schema (Day 2-3)**
```sql
-- Run migrations via Supabase Dashboard SQL Editor
-- Or use Supabase CLI

-- See schema in Proposal 3 section above
```

**Step 3: Data Migration (Day 4)**
```typescript
// scripts/migrate-tours.ts
import { createClient } from '@supabase/supabase-js';
import tourExampleJson from '../src/modules/content/components/ToursGrid/tourExample.json';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateTours() {
  for (const [id, tour] of Object.entries(tourExampleJson)) {
    // Transform data
    const tourData = {
      slug: id,
      title: tour.card.title,
      subtitle: tour.card.subtitle,
      // ... map all fields
    };
    
    // Insert tour
    const { data, error } = await supabase
      .from('tours')
      .insert([tourData])
      .select()
      .single();
    
    if (error) {
      console.error(`Failed to migrate ${id}:`, error);
      continue;
    }
    
    // Insert gallery images
    for (const img of tour.gallery) {
      await supabase
        .from('tour_gallery')
        .insert([{
          tour_id: data.id,
          image_url: img.src,
          alt_text: img.alt,
        }]);
    }
    
    // Insert availability
    if (tour.booking?.availability) {
      for (const avail of tour.booking.availability) {
        await supabase
          .from('tour_availability')
          .insert([{
            tour_id: data.id,
            date: avail.date,
            time_start: avail.timeSlot.start,
            time_end: avail.timeSlot.end,
            capacity: avail.available,
          }]);
      }
    }
  }
}

migrateTours();
```

**Step 4: Update Frontend (Day 5-10)**
```typescript
// Update ToursGrid to fetch from Supabase
// Update TourPage to fetch from Supabase
// Update Calendar to use real availability
// Update CheckoutForm to create real bookings
```

**Step 5: Authentication (Day 11-12)**
```typescript
// Add admin login
// Protect admin routes
// Add Row Level Security policies
```

**Step 6: Admin Dashboard (Day 13-15)**
```typescript
// Create /admin routes
// Tours management
// Bookings management
// Availability management
```

**Step 7: Testing & Deployment (Day 16-18)**
```bash
# Test all flows
# Deploy to Vercel
# Configure environment variables
# Test in production
```

### Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Data migrated from JSON
- [ ] Frontend connected to Supabase
- [ ] Authentication implemented
- [ ] Booking flow working
- [ ] Email notifications set up
- [ ] Admin dashboard created
- [ ] Tested end-to-end
- [ ] Deployed to production

---

## Questions to Answer Before Proceeding

Before finalizing the API choice, please answer:

### Critical Questions

1. **Team & Expertise:**
   - How many developers?
   - Experience with Node.js/PostgreSQL?
   - DevOps capacity?

2. **Budget:**
   - Monthly budget for hosting/services?
   - Prefer managed services or self-hosted?

3. **Timeline:**
   - How urgent is the MVP?
   - Weeks or months?

4. **Scale:**
   - Expected bookings per month?
   - Growth plans for next 12 months?

5. **Features Priority:**
   - Need real-time availability?
   - Admin dashboard complexity?
   - Payment integration urgency?

6. **Data:**
   - Must data stay in Argentina?
   - Backup requirements?
   - Compliance needs (GDPR, etc)?

---

## Next Steps

1. **Review this document** with your team
2. **Answer the questions** in the previous section
3. **Choose a proposal** based on your answers
4. **I'll provide:**
   - Detailed implementation guide for chosen approach
   - Complete code examples
   - Migration scripts
   - Testing strategy
   - Deployment guide

---

**Document Version:** 1.0  
**Author:** Technical Architecture Team  
**Status:** Awaiting Client Feedback

