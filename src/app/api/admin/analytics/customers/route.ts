import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageCustomerValue: number;
  customerRetentionRate: number;
  topCustomers: Array<{
    id: number;
    email: string;
    name: string;
    totalSpent: number;
    orderCount: number;
    lastOrderDate: string;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    averageValue: number;
  }>;
  geographicDistribution: Array<{
    region: string;
    customers: number;
    revenue: number;
  }>;
  customerJourney: {
    newVisitors: number;
    returningVisitors: number;
    converted: number;
    conversionRate: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
}

function generateMockCustomerData(period: string): CustomerAnalytics {
  const baseCustomers = period === '7d' ? 150 : period === '30d' ? 650 : 2100;

  // 고객 세그먼트
  const customerSegments = [
    {
      segment: 'VIP (100만원 이상)',
      count: Math.floor(baseCustomers * 0.05),
      percentage: 5,
      averageValue: 1500000
    },
    {
      segment: '우수 고객 (50-100만원)',
      count: Math.floor(baseCustomers * 0.15),
      percentage: 15,
      averageValue: 750000
    },
    {
      segment: '일반 고객 (10-50만원)',
      count: Math.floor(baseCustomers * 0.40),
      percentage: 40,
      averageValue: 300000
    },
    {
      segment: '신규 고객 (10만원 미만)',
      count: Math.floor(baseCustomers * 0.40),
      percentage: 40,
      averageValue: 50000
    }
  ];

  // 상위 고객 목록
  const topCustomers = [
    {
      id: 1,
      email: 'premium.customer1@email.com',
      name: '김**',
      totalSpent: 2850000,
      orderCount: 47,
      lastOrderDate: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      email: 'vip.customer2@email.com',
      name: '이**',
      totalSpent: 1950000,
      orderCount: 32,
      lastOrderDate: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 3,
      email: 'loyal.customer3@email.com',
      name: '박**',
      totalSpent: 1650000,
      orderCount: 28,
      lastOrderDate: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 4,
      email: 'regular.customer4@email.com',
      name: '최**',
      totalSpent: 1420000,
      orderCount: 23,
      lastOrderDate: new Date(Date.now() - 345600000).toISOString()
    },
    {
      id: 5,
      email: 'frequent.customer5@email.com',
      name: '정**',
      totalSpent: 1280000,
      orderCount: 35,
      lastOrderDate: new Date(Date.now() - 432000000).toISOString()
    }
  ];

  // 지역별 분포
  const geographicDistribution = [
    { region: '서울', customers: Math.floor(baseCustomers * 0.35), revenue: 8500000 },
    { region: '경기', customers: Math.floor(baseCustomers * 0.25), revenue: 6200000 },
    { region: '부산', customers: Math.floor(baseCustomers * 0.12), revenue: 2800000 },
    { region: '대구', customers: Math.floor(baseCustomers * 0.08), revenue: 1900000 },
    { region: '인천', customers: Math.floor(baseCustomers * 0.07), revenue: 1600000 },
    { region: '기타', customers: Math.floor(baseCustomers * 0.13), revenue: 2300000 }
  ];

  const totalRevenue = geographicDistribution.reduce((sum, region) => sum + region.revenue, 0);
  const averageCustomerValue = Math.round(totalRevenue / baseCustomers);

  const newCustomers = Math.floor(baseCustomers * 0.35);
  const returningCustomers = baseCustomers - newCustomers;
  const customerRetentionRate = Math.round((returningCustomers / baseCustomers) * 100);

  const customerJourney = {
    newVisitors: Math.floor(baseCustomers * 2.8),
    returningVisitors: Math.floor(baseCustomers * 1.5),
    converted: Math.floor(baseCustomers * 0.85),
    conversionRate: 3.2,
    averageSessionDuration: 4.5, // minutes
    bounceRate: 32.5 // percentage
  };

  return {
    totalCustomers: baseCustomers,
    newCustomers,
    returningCustomers,
    averageCustomerValue,
    customerRetentionRate,
    topCustomers,
    customerSegments,
    geographicDistribution,
    customerJourney
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 고객 분석은 ADMIN 이상만 조회 가능
    if (!['SUPER_ADMIN', 'ADMIN'].includes(authResult.user?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const segment = searchParams.get('segment');
    const region = searchParams.get('region');

    // 허용된 기간만 처리
    if (!['7d', '30d', '90d'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period parameter' }, { status: 400 });
    }

    const customerData = generateMockCustomerData(period);

    // 세그먼트 필터링이 요청된 경우
    if (segment) {
      const filteredData = {
        ...customerData,
        customerSegments: customerData.customerSegments.filter(
          seg => seg.segment.toLowerCase().includes(segment.toLowerCase())
        )
      };

      return NextResponse.json({
        success: true,
        data: filteredData,
        period,
        filters: { segment }
      });
    }

    // 지역 필터링이 요청된 경우
    if (region) {
      const filteredData = {
        ...customerData,
        geographicDistribution: customerData.geographicDistribution.filter(
          geo => geo.region.toLowerCase().includes(region.toLowerCase())
        )
      };

      return NextResponse.json({
        success: true,
        data: filteredData,
        period,
        filters: { region }
      });
    }

    return NextResponse.json({
      success: true,
      data: customerData,
      period
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}