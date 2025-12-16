/**
 * @swagger
 * /api/admin/upload:
 *   post:
 *     summary: Subir imagen para tours
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, tourSlug, imageType]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               tourSlug:
 *                 type: string
 *                 description: Slug del tour para organizar la imagen
 *               imageType:
 *                 type: string
 *                 enum: [featured, hero, gallery]
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *       400:
 *         description: Error en la solicitud
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { withAuth } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function handlePost(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tourSlug = formData.get("tourSlug") as string | null;
    const imageType = formData.get("imageType") as string | null;

    // Validaciones
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    if (!tourSlug) {
      return NextResponse.json(
        { success: false, error: "El slug del tour es requerido" },
        { status: 400 }
      );
    }

    if (!imageType || !["featured", "hero", "gallery"].includes(imageType)) {
      return NextResponse.json(
        { success: false, error: "Tipo de imagen inválido" },
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
    const tourDir = path.join(process.cwd(), "public", "images", "tours", tourSlug);
    const galleryDir = path.join(tourDir, "gallery");

    if (!existsSync(tourDir)) {
      await mkdir(tourDir, { recursive: true });
    }

    if (imageType === "gallery" && !existsSync(galleryDir)) {
      await mkdir(galleryDir, { recursive: true });
    }

    // Generar nombre de archivo
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    let fileName: string;
    let filePath: string;
    let publicUrl: string;

    if (imageType === "gallery") {
      // Para galería, generar nombre único con timestamp
      const timestamp = Date.now();
      fileName = `${timestamp}.${extension}`;
      filePath = path.join(galleryDir, fileName);
      publicUrl = `/images/tours/${tourSlug}/gallery/${fileName}`;
    } else {
      // Para featured y hero, usar nombre fijo
      fileName = `${imageType}.${extension}`;
      filePath = path.join(tourDir, fileName);
      publicUrl = `/images/tours/${tourSlug}/${fileName}`;
    }

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
          imageType,
          tourSlug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error("Error details:", errorDetails);
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al subir el archivo",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

async function handleDelete(request: NextRequest) {
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
    if (!imageUrl.startsWith("/images/tours/")) {
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

// Proteger endpoints con autenticación (solo ADMIN)
export const POST = withAuth(handlePost, { roles: ["ADMIN"] });
export const DELETE = withAuth(handleDelete, { roles: ["ADMIN"] });

