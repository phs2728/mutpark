import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "mysql://build:build@localhost:3306/build_temp"
      }
    },
    // Enhanced connection settings for production stability
    errorFormat: "pretty",
    transactionOptions: {
      maxWait: 5000, // Wait for a connection to become available
      timeout: 30000, // Maximum time to wait for a transaction
      isolationLevel: "ReadCommitted", // Default isolation level for better performance
    },
    // Connection pool settings for Railway MySQL
    omit: {
      user: {
        passwordHash: true, // Always omit sensitive fields
      }
    }
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Database connection helper with retry logic
export async function connectDatabase(retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("✅ Database connected successfully");
      return;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error);

      if (i === retries - 1) {
        throw new Error(`Failed to connect to database after ${retries} attempts`);
      }

      // Exponential backoff: wait longer between retries
      const delay = Math.pow(2, i) * 1000;
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected successfully");
  } catch (error) {
    console.error("❌ Error disconnecting from database:", error);
  }
}

// Database health check
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// Handle database connection errors with retry
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      // Check if it's a connection error
      const isConnectionError =
        error?.code === 'P1001' || // Can't reach database server
        error?.code === 'P1017' || // Server has closed the connection
        error?.code === 'P2024' || // Timed out fetching a new connection
        error?.message?.includes('connection') ||
        error?.message?.includes('timeout');

      if (!isConnectionError || i === retries - 1) {
        throw error;
      }

      console.warn(`Database operation failed (attempt ${i + 1}/${retries}):`, error?.message);

      // Exponential backoff
      const delay = Math.pow(2, i) * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Unreachable code');
}
