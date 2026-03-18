/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Listar usuarios del panel
 *     tags: [Admin Users]
 *   post:
 *     summary: Crear usuario del panel
 *     tags: [Admin Users]
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { paginatedResponse, createdResponse, calculatePaginationMeta, normalizePagination } from "@/lib/api/response";
import { ConflictError } from "@/lib/api/errorHandler";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const listQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  role: z.enum(["ADMIN", "OPERATOR"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

function parseIsActive(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export const GET = withAuth(
  withRateLimitHandler(
    "admin",
    withControllerErrorHandler(async (request: NextRequest) => {
      const sp = request.nextUrl.searchParams;
      const parsed = listQuerySchema.parse({
        page: sp.get("page") ?? undefined,
        limit: sp.get("limit") ?? undefined,
        search: sp.get("search") ?? undefined,
        role: sp.get("role") ?? undefined,
        isActive: sp.get("isActive") ?? undefined,
      });

      const { page, limit, skip } = normalizePagination(parsed.page, parsed.limit);

      const where = {
        ...(parsed.role ? { role: parsed.role } : {}),
        ...(parsed.isActive ? { isActive: parseIsActive(parsed.isActive) } : {}),
        ...(parsed.search
          ? {
              OR: [
                { email: { contains: parsed.search, mode: "insensitive" as const } },
                { name: { contains: parsed.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          select: userSelect,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
      ]);

      const meta = calculatePaginationMeta(page, limit, total);
      return paginatedResponse(users, meta);
    })
  ),
  { roles: ["ADMIN"] }
);

const createUserSchema = z
  .object({
    email: z.string().trim().email(),
    name: z.string().trim().min(1).max(200).optional().nullable(),
    role: z.enum(["ADMIN", "OPERATOR"]).optional(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const POST = withAuth(
  withRateLimitHandler(
    "admin",
    withControllerErrorHandler(async (request: NextRequest) => {
      const body = await request.json();

      const cleanedBody = Object.fromEntries(
        Object.entries(body).map(([key, value]) => [
          key,
          typeof value === "string" && value.trim() === "" ? undefined : value,
        ])
      );

      const validated = createUserSchema.parse(cleanedBody);

      const email = validated.email.toLowerCase();

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new ConflictError("Email already exists");
      }

      const passwordHash = await hashPassword(validated.password);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: validated.name ?? null,
          role: validated.role ?? "OPERATOR",
          isActive: validated.isActive ?? true,
        },
        select: userSelect,
      });

      return createdResponse(user);
    })
  ),
  { roles: ["ADMIN"] }
);

