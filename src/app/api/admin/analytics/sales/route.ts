import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';

interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    id: number;
    name: string;
    revenue: number;
    quantity: number;
  }>;
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
}

function generateMockSalesData(period: string): SalesAnalytics {
  const now = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

  // 모의 일별 매출 데이터
  const dailySales = Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    const baseRevenue = Math.random() * 500000 + 200000;
    const orders = Math.floor(Math.random() * 50 + 20);

    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.round(baseRevenue),
      orders
    };
  });

  const totalRevenue = dailySales.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = dailySales.reduce((sum, day) => sum + day.orders, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // 모의 상품별 매출 데이터
  const topProducts = [
    { id: 1, name: '터키식 커피 원두', revenue: Math.round(totalRevenue * 0.15), quantity: 245 },
    { id: 2, name: '바클라바', revenue: Math.round(totalRevenue * 0.12), quantity: 189 },
    { id: 3, name: '터키 딜라이트', revenue: Math.round(totalRevenue * 0.10), quantity: 156 },
    { id: 4, name: '이스탄불 향신료 세트', revenue: Math.round(totalRevenue * 0.08), quantity: 98 },
    { id: 5, name: '터키 차', revenue: Math.round(totalRevenue * 0.07), quantity: 134 }
  ];

  // 카테고리별 매출
  const categories = [
    { category: '음료', revenue: Math.round(totalRevenue * 0.35) },
    { category: '디저트', revenue: Math.round(totalRevenue * 0.25) },
    { category: '향신료', revenue: Math.round(totalRevenue * 0.20) },
    { category: '수공예품', revenue: Math.round(totalRevenue * 0.15) },
    { category: '기타', revenue: Math.round(totalRevenue * 0.05) }
  ];

  const revenueByCategory = categories.map(cat => ({
    ...cat,
    percentage: Math.round((cat.revenue / totalRevenue) * 100)
  }));

  // 전환율 계산 (모의 데이터)
  const conversionRate = 3.2 + (Math.random() * 2); // 3.2% ~ 5.2%

  return {
    totalRevenue: Math.round(totalRevenue),
    totalOrders,
    averageOrderValue: Math.round(averageOrderValue),
    conversionRate: Math.round(conversionRate * 100) / 100,
    topProducts,
    dailySales,
    revenueByCategory
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 매출 분석은 ADMIN 이상만 조회 가능
    if (!['SUPER_ADMIN', 'ADMIN'].includes(authResult.user?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const category = searchParams.get('category');

    // 허용된 기간만 처리
    if (!['7d', '30d', '90d'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period parameter' }, { status: 400 });
    }

    const salesData = generateMockSalesData(period);

    // 카테고리 필터링이 요청된 경우
    if (category) {
      const filteredData = {
        ...salesData,
        revenueByCategory: salesData.revenueByCategory.filter(
          cat => cat.category.toLowerCase().includes(category.toLowerCase())
        )
      };

      return NextResponse.json({
        success: true,
        data: filteredData,
        period,
        category
      });
    }

    return NextResponse.json({
      success: true,
      data: salesData,
      period
    });

  } catch (error) {
    console.error('Sales analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}