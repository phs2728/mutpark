import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN"] }
      }
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin user already exists",
        user: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      });
    }

    // Only allow setup in development environment or with special token
    if (process.env.NODE_ENV === 'production') {
      const setupToken = request.headers.get('x-setup-token');
      if (setupToken !== process.env.ADMIN_SETUP_TOKEN) {
        return NextResponse.json(
          { error: 'Unauthorized setup attempt' },
          { status: 401 }
        );
      }
    }

    // Create admin user with email from .env
    const adminEmail = process.env.GMAIL_USER || "admin@mutpark.com";
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'TempPass123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Super Admin",
        role: "SUPER_ADMIN",
        passwordHash: hashedPassword,
        emailVerified: true
      }
    });

    return NextResponse.json({
      message: "Admin user created successfully",
      user: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
      // Credentials removed for security - check environment variables
    });

  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}