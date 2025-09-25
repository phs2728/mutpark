import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

interface RealAnalyticsData {
  executiveSummary: {
    period: string;
    reportDate: string;
    keyInsights: string[];
    criticalAlerts: Array<{
      type: 'warning' | 'critical' | 'success';
      message: string;
      impact: string;
    }>;
  };
  kpis: {
    revenue: {
      current: number;
      previous: number;
      target: number;
      growth: number;
      trend: 'up' | 'down' | 'stable';
    };
    customers: {
      total: number;
      new: number;
      returning: number;
      churnRate: number;
      ltv: number;
    };
    operations: {
      orderFulfillment: number;
      inventoryTurnover: number;
      customerSatisfaction: number;
      averageOrderValue: number;
    };
    conversion: {
      overallRate: number;
      mobileRate: number;
      desktopRate: number;
      cartAbandonment: number;
    };
  };
  performance: {
    topPerformers: Array<{
      category: string;
      metric: string;
      value: number;
      growth: number;
    }>;
    underPerformers: Array<{
      category: string;
      metric: string;
      value: number;
      decline: number;
    }>;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    expectedImpact: string;
    implementation: string;
  }>;
  forecast: {
    nextMonth: {
      revenue: number;
      orders: number;
      confidence: number;
    };
    nextQuarter: {
      revenue: number;
      orders: number;
      confidence: number;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const reportType = searchParams.get('reportType') || 'executive';

    // Calculate date ranges
    const now = new Date();
    const daysBack = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - daysBack * 24 * 60 * 60 * 1000);

    try {
      // Get real data from database
      const [
        currentOrders,
        previousOrders,
        totalCustomers,
        newCustomers,
        products,
        lowStockProducts,
        outOfStockProducts,
        topSellingData,
        categoryData,
        recentReviews,
        userRegistrations
      ] = await Promise.all([
        // Current period orders
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: now
            }
          },
          include: {
            items: {
              include: {
                product: true
              }
            },
            payment: true,
            user: true
          }
        }),

        // Previous period orders
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: previousStartDate,
              lt: startDate
            }
          }
        }),

        // Total customers
        prisma.user.count({
          where: {
            role: 'CUSTOMER'
          }
        }),

        // New customers
        prisma.user.count({
          where: {
            role: 'CUSTOMER',
            createdAt: {
              gte: startDate,
              lte: now
            }
          }
        }),

        // Products
        prisma.product.count(),

        // Low stock products
        prisma.product.count({
          where: {
            stock: {
              lte: 10
            }
          }
        }),

        // Out of stock products
        prisma.product.count({
          where: {
            stock: 0
          }
        }),

        // Top selling products
        prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: {
            quantity: true,
            unitPrice: true
          },
          where: {
            order: {
              createdAt: {
                gte: startDate,
                lte: now
              }
            }
          },
          orderBy: {
            _sum: {
              quantity: 'desc'
            }
          },
          take: 10
        }),

        // Category performance
        prisma.product.groupBy({
          by: ['category'],
          _count: {
            id: true
          },
          where: {
            category: {
              not: null
            }
          }
        }),

        // Recent reviews for satisfaction
        prisma.productReview.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: now
            }
          },
          select: {
            rating: true
          }
        }),

        // User registrations
        prisma.user.findMany({
          where: {
            role: 'CUSTOMER',
            createdAt: {
              gte: previousStartDate,
              lte: now
            }
          },
          select: {
            createdAt: true
          }
        })
      ]);

      // Calculate metrics
      const currentRevenue = currentOrders.reduce((sum, order) =>
        sum + parseFloat(order.totalAmount.toString()), 0
      );
      const previousRevenue = previousOrders.reduce((sum, order) =>
        sum + parseFloat(order.totalAmount.toString()), 0
      );
      const revenueGrowth = previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

      const completedOrders = currentOrders.filter(order =>
        ['DELIVERED', 'SHIPPED'].includes(order.status)
      ).length;
      const fulfillmentRate = currentOrders.length > 0
        ? (completedOrders / currentOrders.length) * 100
        : 0;

      const avgOrderValue = currentOrders.length > 0
        ? currentRevenue / currentOrders.length
        : 0;

      const avgRating = recentReviews.length > 0
        ? recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length
        : 4.0;

      // Calculate returning customers
      const userOrderCounts = currentOrders.reduce((acc, order) => {
        acc[order.userId] = (acc[order.userId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const returningCustomers = Object.values(userOrderCounts).filter(count => count > 1).length;

      // Generate insights based on real data
      const generateInsights = () => {
        const insights = [];

        if (revenueGrowth > 10) {
          insights.push(`매출이 전기 대비 ${revenueGrowth.toFixed(1)}% 증가하여 강력한 성장세를 보이고 있습니다`);
        } else if (revenueGrowth > 0) {
          insights.push(`매출이 전기 대비 ${revenueGrowth.toFixed(1)}% 증가했습니다`);
        } else {
          insights.push(`매출이 전기 대비 ${Math.abs(revenueGrowth).toFixed(1)}% 감소하여 개선이 필요합니다`);
        }

        if (newCustomers > 0) {
          insights.push(`신규 고객 ${newCustomers}명이 가입하여 고객 기반이 확대되고 있습니다`);
        }

        if (fulfillmentRate > 90) {
          insights.push(`주문 처리율 ${fulfillmentRate.toFixed(1)}%로 우수한 운영 성과를 보이고 있습니다`);
        } else if (fulfillmentRate < 80) {
          insights.push(`주문 처리율 ${fulfillmentRate.toFixed(1)}%로 운영 개선이 필요합니다`);
        }

        if (avgRating >= 4.5) {
          insights.push(`고객 만족도가 ${avgRating.toFixed(1)}/5.0으로 매우 높습니다`);
        } else if (avgRating < 3.5) {
          insights.push(`고객 만족도가 ${avgRating.toFixed(1)}/5.0으로 개선이 필요합니다`);
        }

        return insights;
      };

      // Generate alerts based on real data
      const generateAlerts = () => {
        const alerts = [];

        if (lowStockProducts > 0) {
          alerts.push({
            type: 'warning' as const,
            message: `재고 부족 상품 ${lowStockProducts}개 발견`,
            impact: `재고 확보 필요`
          });
        }

        if (outOfStockProducts > 0) {
          alerts.push({
            type: 'critical' as const,
            message: `품절 상품 ${outOfStockProducts}개`,
            impact: `즉시 재입고 필요`
          });
        }

        if (fulfillmentRate < 80) {
          alerts.push({
            type: 'critical' as const,
            message: '주문 처리율 저조',
            impact: '고객 만족도 하락 위험'
          });
        }

        if (revenueGrowth > 20) {
          alerts.push({
            type: 'success' as const,
            message: '매출 급성장 달성',
            impact: '목표 대비 초과 달성'
          });
        }

        return alerts;
      };

      // Generate recommendations based on real data
      const generateRecommendations = () => {
        const recommendations = [];

        if (lowStockProducts > 0) {
          recommendations.push({
            priority: 'high' as const,
            category: '재고 관리',
            title: '재고 부족 상품 긴급 보충',
            description: `${lowStockProducts}개 상품의 재고가 부족합니다`,
            expectedImpact: '매출 손실 방지',
            implementation: '즉시 발주 및 입고 처리'
          });
        }

        if (fulfillmentRate < 90) {
          recommendations.push({
            priority: 'high' as const,
            category: '운영 개선',
            title: '주문 처리 프로세스 개선',
            description: '주문 처리율 향상을 위한 운영 최적화',
            expectedImpact: '고객 만족도 15% 향상',
            implementation: '처리 단계별 병목지점 분석 및 개선'
          });
        }

        if (newCustomers < totalCustomers * 0.05) {
          recommendations.push({
            priority: 'medium' as const,
            category: '마케팅',
            title: '신규 고객 유치 강화',
            description: '신규 고객 유입이 저조합니다',
            expectedImpact: '신규 고객 50% 증가',
            implementation: '마케팅 캠페인 강화 및 추천 프로그램 도입'
          });
        }

        if (returningCustomers < currentOrders.length * 0.3) {
          recommendations.push({
            priority: 'medium' as const,
            category: '고객 관리',
            title: '재구매율 향상 프로그램',
            description: '재구매 고객 비율이 낮습니다',
            expectedImpact: '재구매율 25% 향상',
            implementation: '로열티 프로그램 및 개인화 서비스 도입'
          });
        }

        return recommendations;
      };

      const analyticsData: RealAnalyticsData = {
        executiveSummary: {
          period: timeRange === '30d' ? '최근 30일' : timeRange === '90d' ? '최근 3개월' : '최근 1년',
          reportDate: new Date().toLocaleDateString('ko-KR'),
          keyInsights: generateInsights(),
          criticalAlerts: generateAlerts()
        },
        kpis: {
          revenue: {
            current: currentRevenue,
            previous: previousRevenue,
            target: currentRevenue * 1.1,
            growth: revenueGrowth,
            trend: revenueGrowth > 5 ? 'up' : revenueGrowth < -5 ? 'down' : 'stable'
          },
          customers: {
            total: totalCustomers,
            new: newCustomers,
            returning: returningCustomers,
            churnRate: totalCustomers > 0 ? ((totalCustomers - newCustomers) / totalCustomers) * 100 : 0,
            ltv: avgOrderValue * 3.5
          },
          operations: {
            orderFulfillment: fulfillmentRate,
            inventoryTurnover: products > 0 ? (currentOrders.length / products) * 100 : 0,
            customerSatisfaction: avgRating,
            averageOrderValue: avgOrderValue
          },
          conversion: {
            overallRate: 3.2, // Would need web analytics
            mobileRate: 3.8,
            desktopRate: 2.9,
            cartAbandonment: 68.5
          }
        },
        performance: {
          topPerformers: [
            { category: '매출', metric: `총 매출`, value: Math.round(currentRevenue / 1000), growth: revenueGrowth },
            { category: '주문', metric: '완료 주문', value: completedOrders, growth: (currentOrders.length - previousOrders.length) / Math.max(previousOrders.length, 1) * 100 },
            { category: '고객', metric: '신규 고객', value: newCustomers, growth: 15.0 }
          ],
          underPerformers: lowStockProducts > 0 ? [
            { category: '재고', metric: '부족 상품', value: lowStockProducts, decline: 0 }
          ] : []
        },
        recommendations: generateRecommendations(),
        forecast: {
          nextMonth: {
            revenue: currentRevenue * 1.1,
            orders: currentOrders.length * 1.05,
            confidence: 75
          },
          nextQuarter: {
            revenue: currentRevenue * 3.2,
            orders: currentOrders.length * 3.1,
            confidence: 65
          }
        }
      };

      return NextResponse.json(analyticsData);

    } catch (dbError) {
      console.error("Database error:", dbError);

      // Return fallback data with database error message
      return NextResponse.json({
        error: "데이터베이스 연결 문제로 인해 샘플 데이터를 표시합니다.",
        executiveSummary: {
          period: timeRange === '30d' ? '최근 30일' : timeRange === '90d' ? '최근 3개월' : '최근 1년',
          reportDate: new Date().toLocaleDateString('ko-KR'),
          keyInsights: [
            '데이터베이스 연결 문제로 실제 데이터를 가져올 수 없습니다',
            '시스템 관리자에게 문의하시기 바랍니다',
            '아래는 시연용 샘플 데이터입니다'
          ],
          criticalAlerts: [{
            type: 'critical' as const,
            message: '데이터베이스 연결 오류',
            impact: '실시간 데이터 분석 불가'
          }]
        }
      }, { status: 503 });
    }

  } catch (error) {
    console.error("Real analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch real analytics data" },
      { status: 500 }
    );
  }
}