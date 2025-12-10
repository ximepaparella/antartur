/**
 * @swagger
 * /api/admin/upload/testimonial:
 *   post:
 *     summary: Subir avatar para testimonios
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Avatar subido exitosamente
 *       400:
 *         description: Error en la solicitud
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Validaciones
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Tipo de archivo no permitido. Use JPG, PNG o WebP" },
        { status: 400 }
      );
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "El archivo excede el tamaño máximo de 5MB" },
        { status: 400 }
      );
    }

    // Crear directorio si no existe
    const testimonialsDir = path.join(process.cwd(), "public", "images", "testimonials");

    if (!existsSync(testimonialsDir)) {
      await mkdir(testimonialsDir, { recursive: true });
    }

    // Generar nombre único con timestamp
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `avatar-${timestamp}-${randomStr}.${extension}`;
    const filePath = path.join(testimonialsDir, fileName);
    const publicUrl = `/images/testimonials/${fileName}`;

    // Guardar archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    return NextResponse.json(
      {
        success: true,
        data: {
          url: publicUrl,
          fileName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading testimonial avatar:", error);
    return NextResponse.json(
      { success: false, error: "Error al subir el archivo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "URL de imagen requerida" },
        { status: 400 }
      );
    }

    // Validar que la URL sea de nuestro directorio de imágenes
    if (!imageUrl.startsWith("/images/testimonials/")) {
      return NextResponse.json(
        { success: false, error: "URL de imagen inválida" },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "public", imageUrl);
    
    const { unlink } = await import("fs/promises");
    await unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar el archivo" },
      { status: 500 }
    );
  }
}
