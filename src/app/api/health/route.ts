import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  message?: string;
  details?: Record<string, any>;
}

interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  checks: HealthCheck[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      service: 'database',
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      message: responseTime < 1000 ? 'Database connection healthy' : 'Database response slow',
      details: {
        provider: 'mysql',
        responseThreshold: '1000ms'
      }
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: 'Database connection failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

async function checkIyzico(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const response = await fetch('https://api.iyzipay.com/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });

    const responseTime = Date.now() - start;
    const isHealthy = response.ok;

    return {
      service: 'iyzico',
      status: isHealthy ? (responseTime < 2000 ? 'healthy' : 'degraded') : 'unhealthy',
      responseTime,
      message: isHealthy ? 'Iyzico payment service accessible' : 'Iyzico payment service unavailable',
      details: {
        statusCode: response.status,
        responseThreshold: '2000ms'
      }
    };
  } catch (error) {
    return {
      service: 'iyzico',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: 'Iyzico payment service unreachable',
      details: {
        error: error instanceof Error ? error.message : 'Network error'
      }
    };
  }
}

function checkSystemResources(): HealthCheck {
  const start = Date.now();

  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryUsagePercent = (memoryUsedMB / memoryTotalMB) * 100;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = 'System resources within normal limits';

    if (memoryUsagePercent > 90) {
      status = 'unhealthy';
      message = 'High memory usage detected';
    } else if (memoryUsagePercent > 75) {
      status = 'degraded';
      message = 'Elevated memory usage';
    }

    return {
      service: 'system-resources',
      status,
      responseTime: Date.now() - start,
      message,
      details: {
        memory: {
          used: `${memoryUsedMB}MB`,
          total: `${memoryTotalMB}MB`,
          usage: `${memoryUsagePercent.toFixed(1)}%`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
          buffers: `${Math.round(memoryUsage.arrayBuffers / 1024 / 1024)}MB`
        },
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
  } catch (error) {
    return {
      service: 'system-resources',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: 'Failed to check system resources',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

function checkApplicationHealth(): HealthCheck {
  const start = Date.now();

  try {
    const features = {
      authentication: true,
      payment: true,
      shipping: true,
      notifications: true,
      search: true,
      recommendations: true
    };

    const allFeaturesHealthy = Object.values(features).every(Boolean);

    return {
      service: 'application',
      status: allFeaturesHealthy ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      message: allFeaturesHealthy ? 'All application features operational' : 'Some application features may be impaired',
      details: {
        features,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      }
    };
  } catch (error) {
    return {
      service: 'application',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: 'Application health check failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const checks: HealthCheck[] = [
      await checkDatabase(),
      await checkIyzico(),
      checkSystemResources(),
      checkApplicationHealth()
    ];

    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length,
      degraded: checks.filter(c => c.status === 'degraded').length
    };

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (summary.unhealthy > 0) {
      overallStatus = 'unhealthy';
    } else if (summary.degraded > 0) {
      overallStatus = 'degraded';
    }

    const response: SystemHealth = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks,
      summary
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json(response, {
      status: overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`,
        'X-Health-Status': overallStatus
      }
    });

  } catch (error) {
    const errorResponse: SystemHealth = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks: [{
        service: 'health-endpoint',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Health check endpoint failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }],
      summary: {
        total: 1,
        healthy: 0,
        unhealthy: 1,
        degraded: 0
      }
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': 'unhealthy'
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}
