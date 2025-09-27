import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return errorResponse("No files provided", 400);
    }

    if (files.length > 6) {
      return errorResponse("Maximum 6 images allowed", 400);
    }

    const uploadedUrls: string[] = [];
    const uploadDir = join(process.cwd(), "public", "uploads", "review-images");

    // Create upload directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return errorResponse("Only image files are allowed", 400);
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return errorResponse("File size must be less than 5MB", 400);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${user.userId}_${timestamp}_${randomId}.${extension}`;

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // Return public URL
      const publicUrl = `/uploads/review-images/${filename}`;
      uploadedUrls.push(publicUrl);
    }

    return successResponse({
      urls: uploadedUrls,
      message: `Successfully uploaded ${uploadedUrls.length} image(s)`
    });

  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Admin privileges required", 403);
    }
    console.error("Image upload error:", error);
    return errorResponse("Failed to upload images", 500);
  }
}