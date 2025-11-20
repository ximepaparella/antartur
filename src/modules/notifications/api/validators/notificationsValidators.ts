/**
 * Validators Zod para Notifications
 */

import { z } from "zod";
import { idSchema, emailSchema } from "@/lib/validation/schemas";

/**
 * Schema para crear una Notification
 */
export const createNotificationSchema = z.object({
  orderId: idSchema.optional(),
  type: z.enum(["EMAIL", "WHATSAPP"]),
  recipient: z.string().min(1, "Recipient is required"),
  templateKey: z.string().min(1, "Template key is required"),
  subject: z.string().optional(),
  body: z.string().optional(),
  status: z.enum(["PENDING", "SENT", "ERROR"]).default("PENDING").optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

/**
 * Schema para parámetros de ruta (ID)
 */
export const notificationIdParamsSchema = z.object({
  id: idSchema,
});

export type NotificationIdParams = z.infer<typeof notificationIdParamsSchema>;

