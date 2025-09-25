import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { PrismaClient } from '@prisma/client';

interface APIIntegration {
  id: string;
  name: string;
  description: string;
  category: 'PAYMENT' | 'SHIPPING' | 'COMMUNICATION' | 'ANALYTICS' | 'SOCIAL' | 'OTHER';
  provider: string;
  version: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'TESTING';
  configuration: {
    baseUrl?: string;
    apiKey?: string;
    secretKey?: string;
    webhookUrl?: string;
    timeout?: number;
    retryAttempts?: number;
    rateLimit?: {
      requests: number;
      period: string;
    };
    customHeaders?: Record<string, string>;
    customParameters?: Record<string, any>;
  };
  healthCheck: {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    expectedResponse?: any;
    lastChecked?: string;
    lastStatus?: 'SUCCESS' | 'FAILURE';
    lastError?: string;
    responseTime?: number;
  };
  usage: {
    requestsToday: number;
    requestsThisMonth: number;
    errorCount: number;
    avgResponseTime: number;
    lastUsed?: string;
  };
  security: {
    authMethod: 'API_KEY' | 'BEARER_TOKEN' | 'BASIC_AUTH' | 'OAUTH2' | 'HMAC';
    encryptionEnabled: boolean;
    ipWhitelist?: string[];
    allowedDomains?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// 모의 API 통합 설정 데이터
let apiIntegrations: APIIntegration[] = [
  {
    id: 'stripe_payments',
    name: 'Stripe 결제',
    description: '신용카드 및 온라인 결제 처리',
    category: 'PAYMENT',
    provider: 'Stripe',
    version: 'v3',
    status: 'ACTIVE',
    configuration: {
      baseUrl: 'https://api.stripe.com/v1',
      apiKey: 'pk_live_****',
      secretKey: 'sk_live_****',
      webhookUrl: 'https://mutpark.com/webhooks/stripe',
      timeout: 30000,
      retryAttempts: 3,
      rateLimit: {
        requests: 1000,
        period: 'hour'
      }
    },
    healthCheck: {
      endpoint: '/charges',
      method: 'GET',
      lastChecked: new Date(Date.now() - 300000).toISOString(),
      lastStatus: 'SUCCESS',
      responseTime: 245
    },
    usage: {
      requestsToday: 1247,
      requestsThisMonth: 38952,
      errorCount: 12,
      avgResponseTime: 278,
      lastUsed: new Date(Date.now() - 60000).toISOString()
    },
    security: {
      authMethod: 'API_KEY',
      encryptionEnabled: true,
      allowedDomains: ['*.stripe.com']
    },
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'yurtici_kargo',
    name: 'Yurtiçi Kargo',
    description: '터키 국내 배송 서비스',
    category: 'SHIPPING',
    provider: 'Yurtiçi Kargo',
    version: 'v2.1',
    status: 'ACTIVE',
    configuration: {
      baseUrl: 'https://api.yurticikargo.com/api/v2',
      apiKey: 'yk_****',
      timeout: 15000,
      retryAttempts: 2,
      rateLimit: {
        requests: 500,
        period: 'hour'
      }
    },
    healthCheck: {
      endpoint: '/tracking/health',
      method: 'GET',
      lastChecked: new Date(Date.now() - 600000).toISOString(),
      lastStatus: 'SUCCESS',
      responseTime: 892
    },
    usage: {
      requestsToday: 342,
      requestsThisMonth: 8756,
      errorCount: 3,
      avgResponseTime: 923,
      lastUsed: new Date(Date.now() - 1800000).toISOString()
    },
    security: {
      authMethod: 'API_KEY',
      encryptionEnabled: true,
      ipWhitelist: ['194.27.100.0/24']
    },
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'sendgrid_email',
    name: 'SendGrid 이메일',
    description: '이메일 발송 서비스',
    category: 'COMMUNICATION',
    provider: 'SendGrid',
    version: 'v3',
    status: 'ACTIVE',
    configuration: {
      baseUrl: 'https://api.sendgrid.com/v3',
      apiKey: 'SG.****',
      timeout: 10000,
      retryAttempts: 3,
      customHeaders: {
        'Content-Type': 'application/json'
      }
    },
    healthCheck: {
      endpoint: '/user/profile',
      method: 'GET',
      lastChecked: new Date(Date.now() - 900000).toISOString(),
      lastStatus: 'SUCCESS',
      responseTime: 156
    },
    usage: {
      requestsToday: 89,
      requestsThisMonth: 2341,
      errorCount: 1,
      avgResponseTime: 198,
      lastUsed: new Date(Date.now() - 3600000).toISOString()
    },
    security: {
      authMethod: 'BEARER_TOKEN',
      encryptionEnabled: true,
      allowedDomains: ['*.sendgrid.com']
    },
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: '웹사이트 분석 및 추적',
    category: 'ANALYTICS',
    provider: 'Google',
    version: 'GA4',
    status: 'TESTING',
    configuration: {
      baseUrl: 'https://analyticsreporting.googleapis.com/v4',
      apiKey: 'AIza****',
      timeout: 20000,
      retryAttempts: 2
    },
    healthCheck: {
      endpoint: '/reports:batchGet',
      method: 'POST',
      lastChecked: new Date(Date.now() - 1800000).toISOString(),
      lastStatus: 'FAILURE',
      lastError: 'Authentication failed',
      responseTime: 0
    },
    usage: {
      requestsToday: 0,
      requestsThisMonth: 45,
      errorCount: 15,
      avgResponseTime: 0
    },
    security: {
      authMethod: 'OAUTH2',
      encryptionEnabled: true,
      allowedDomains: ['*.googleapis.com']
    },
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'facebook_social',
    name: 'Facebook 소셜 로그인',
    description: 'Facebook 계정으로 로그인',
    category: 'SOCIAL',
    provider: 'Meta',
    version: 'v18.0',
    status: 'INACTIVE',
    configuration: {
      baseUrl: 'https://graph.facebook.com/v18.0',
      apiKey: 'fb_app_****',
      secretKey: 'fb_secret_****',
      timeout: 10000,
      retryAttempts: 2
    },
    healthCheck: {
      endpoint: '/me',
      method: 'GET',
      lastChecked: new Date(Date.now() - 86400000).toISOString(),
      lastStatus: 'FAILURE',
      lastError: 'API key expired'
    },
    usage: {
      requestsToday: 0,
      requestsThisMonth: 0,
      errorCount: 8,
      avgResponseTime: 0
    },
    security: {
      authMethod: 'OAUTH2',
      encryptionEnabled: true,
      allowedDomains: ['*.facebook.com', '*.fbcdn.net']
    },
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // API 통합 조회는 ADMIN 이상만 가능
    if (!['SUPER_ADMIN', 'ADMIN'].includes(authResult.user?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const integrationId = searchParams.get('id');
    const healthCheck = searchParams.get('healthCheck') === 'true';

    // 특정 통합 조회
    if (integrationId) {
      const integration = apiIntegrations.find(i => i.id === integrationId);
      if (!integration) {
        return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
      }

      // 민감한 정보 마스킹
      const maskedIntegration = {
        ...integration,
        configuration: {
          ...integration.configuration,
          apiKey: integration.configuration.apiKey ? maskApiKey(integration.configuration.apiKey) : undefined,
          secretKey: integration.configuration.secretKey ? maskApiKey(integration.configuration.secretKey) : undefined
        }
      };

      return NextResponse.json({
        success: true,
        integration: maskedIntegration
      });
    }

    // 헬스 체크만 요청된 경우
    if (healthCheck) {
      const healthStatuses = await Promise.all(
        apiIntegrations.map(async (integration) => {
          if (integration.status === 'ACTIVE') {
            try {
              const healthStatus = await performHealthCheck(integration);
              return {
                id: integration.id,
                name: integration.name,
                status: healthStatus.success ? 'HEALTHY' : 'UNHEALTHY',
                responseTime: healthStatus.responseTime,
                lastChecked: new Date().toISOString(),
                error: healthStatus.error
              };
            } catch (error) {
              return {
                id: integration.id,
                name: integration.name,
                status: 'ERROR',
                error: 'Health check failed'
              };
            }
          } else {
            return {
              id: integration.id,
              name: integration.name,
              status: 'DISABLED'
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        healthStatuses
      });
    }

    // 필터 적용
    let filteredIntegrations = [...apiIntegrations];

    if (category) {
      filteredIntegrations = filteredIntegrations.filter(i => i.category === category);
    }

    if (status) {
      filteredIntegrations = filteredIntegrations.filter(i => i.status === status);
    }

    // 민감한 정보 마스킹
    const maskedIntegrations = filteredIntegrations.map(integration => ({
      ...integration,
      configuration: {
        ...integration.configuration,
        apiKey: integration.configuration.apiKey ? maskApiKey(integration.configuration.apiKey) : undefined,
        secretKey: integration.configuration.secretKey ? maskApiKey(integration.configuration.secretKey) : undefined
      }
    }));

    // 통계 생성
    const stats = {
      total: apiIntegrations.length,
      active: apiIntegrations.filter(i => i.status === 'ACTIVE').length,
      inactive: apiIntegrations.filter(i => i.status === 'INACTIVE').length,
      error: apiIntegrations.filter(i => i.status === 'ERROR').length,
      testing: apiIntegrations.filter(i => i.status === 'TESTING').length,
      byCategory: Object.entries(
        apiIntegrations.reduce((acc, integration) => {
          acc[integration.category] = (acc[integration.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([category, count]) => ({ category, count })),
      totalRequests: apiIntegrations.reduce((sum, i) => sum + i.usage.requestsToday, 0),
      totalErrors: apiIntegrations.reduce((sum, i) => sum + i.usage.errorCount, 0)
    };

    return NextResponse.json({
      success: true,
      integrations: maskedIntegrations,
      stats,
      filters: { category, status }
    });

  } catch (error) {
    console.error('Get integrations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // API 통합 생성은 SUPER_ADMIN만 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const integrationData = await request.json();
    const {
      id,
      name,
      description,
      category,
      provider,
      version,
      configuration,
      healthCheck,
      security
    } = integrationData;

    // 필수 필드 검증
    if (!id || !name || !category || !provider || !configuration) {
      return NextResponse.json({
        error: 'Missing required fields: id, name, category, provider, configuration'
      }, { status: 400 });
    }

    // 중복 확인
    if (apiIntegrations.some(integration => integration.id === id)) {
      return NextResponse.json({
        error: 'Integration with this ID already exists'
      }, { status: 400 });
    }

    // 유효한 카테고리 확인
    const validCategories = ['PAYMENT', 'SHIPPING', 'COMMUNICATION', 'ANALYTICS', 'SOCIAL', 'OTHER'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({
        error: 'Invalid category. Must be one of: ' + validCategories.join(', ')
      }, { status: 400 });
    }

    const newIntegration: APIIntegration = {
      id,
      name,
      description: description || '',
      category,
      provider,
      version: version || 'v1',
      status: 'INACTIVE',
      configuration,
      healthCheck: healthCheck || {
        endpoint: '/health',
        method: 'GET'
      },
      usage: {
        requestsToday: 0,
        requestsThisMonth: 0,
        errorCount: 0,
        avgResponseTime: 0
      },
      security: security || {
        authMethod: 'API_KEY',
        encryptionEnabled: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    apiIntegrations.push(newIntegration);

    return NextResponse.json({
      success: true,
      integration: {
        ...newIntegration,
        configuration: {
          ...newIntegration.configuration,
          apiKey: newIntegration.configuration.apiKey ? maskApiKey(newIntegration.configuration.apiKey) : undefined,
          secretKey: newIntegration.configuration.secretKey ? maskApiKey(newIntegration.configuration.secretKey) : undefined
        }
      },
      message: 'API 통합이 성공적으로 생성되었습니다.'
    });

  } catch (error) {
    console.error('Create integration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // API 통합 수정은 ADMIN 이상만 가능
    if (!['SUPER_ADMIN', 'ADMIN'].includes(authResult.user?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }

    const integrationIndex = apiIntegrations.findIndex(i => i.id === id);
    if (integrationIndex === -1) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // 상태 변경 시 특별 처리
    if (updates.status) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'ERROR', 'TESTING'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json({
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        }, { status: 400 });
      }

      // ACTIVE로 변경 시 헬스 체크 수행
      if (updates.status === 'ACTIVE') {
        try {
          const healthResult = await performHealthCheck(apiIntegrations[integrationIndex]);
          if (!healthResult.success) {
            return NextResponse.json({
              error: 'Health check failed: ' + healthResult.error
            }, { status: 400 });
          }
        } catch (error) {
          return NextResponse.json({
            error: 'Unable to activate integration: health check failed'
          }, { status: 400 });
        }
      }
    }

    apiIntegrations[integrationIndex] = {
      ...apiIntegrations[integrationIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      integration: {
        ...apiIntegrations[integrationIndex],
        configuration: {
          ...apiIntegrations[integrationIndex].configuration,
          apiKey: apiIntegrations[integrationIndex].configuration.apiKey ?
            maskApiKey(apiIntegrations[integrationIndex].configuration.apiKey) : undefined,
          secretKey: apiIntegrations[integrationIndex].configuration.secretKey ?
            maskApiKey(apiIntegrations[integrationIndex].configuration.secretKey) : undefined
        }
      },
      message: 'API 통합이 성공적으로 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Update integration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // API 통합 삭제는 SUPER_ADMIN만 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }

    const integrationIndex = apiIntegrations.findIndex(i => i.id === id);
    if (integrationIndex === -1) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    const deletedIntegration = apiIntegrations[integrationIndex];
    apiIntegrations.splice(integrationIndex, 1);

    return NextResponse.json({
      success: true,
      message: `API 통합 '${deletedIntegration.name}'이 성공적으로 삭제되었습니다.`
    });

  } catch (error) {
    console.error('Delete integration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return '****';
  }
  return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
}

async function performHealthCheck(integration: APIIntegration) {
  // 모의 헬스 체크 (실제 구현에서는 실제 API 호출)
  const startTime = Date.now();

  try {
    // 시뮬레이션된 API 호출
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 100));

    const responseTime = Date.now() - startTime;

    // 90% 확률로 성공
    const success = Math.random() > 0.1;

    return {
      success,
      responseTime,
      error: success ? null : 'Connection timeout'
    };
  } catch (error) {
    return {
      success: false,
      responseTime: Date.now() - startTime,
      error: 'Health check failed'
    };
  }
}