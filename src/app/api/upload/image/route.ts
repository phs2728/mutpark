import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { verifyToken } from "@/lib/auth";
import { rateLimiters, getClientIdentifier } from "@/utils/security";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  return `${timestamp}-${randomString}${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for uploads
    const clientIP = getClientIdentifier(request);
    const rateLimitResult = rateLimiters.upload.checkLimit(clientIP);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Authenticate user before allowing upload
    const authResult = await verifyToken(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: "Authentication required for file upload" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "general";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    await ensureUploadDir();

    // Create folder-specific directory
    const folderPath = path.join(UPLOAD_DIR, folder);
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true });
    }

    // Generate unique filename
    const fileName = generateFileName(file.name);
    const filePath = path.join(folderPath, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${folder}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Handle multiple file uploads
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folder = formData.get("folder") as string || "general";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploadResults = [];

    await ensureUploadDir();

    // Create folder-specific directory
    const folderPath = path.join(UPLOAD_DIR, folder);
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true });
    }

    for (const file of files) {
      // Validate each file
      if (!ALLOWED_TYPES.includes(file.type)) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: "Invalid file type"
        });
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: "File too large"
        });
        continue;
      }

      try {
        const fileName = generateFileName(file.name);
        const filePath = path.join(folderPath, fileName);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${folder}/${fileName}`;

        uploadResults.push({
          filename: file.name,
          success: true,
          url: publicUrl,
          size: file.size,
          type: file.type
        });

      } catch (error) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: "Upload failed"
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: uploadResults,
      successCount: uploadResults.filter(r => r.success).length,
      totalCount: files.length
    });

  } catch (error) {
    console.error("Multiple image upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}