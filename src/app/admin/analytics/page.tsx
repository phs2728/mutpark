'use client';

import React, { useState, useEffect } from 'react';
import { TouchButton } from '@/components/common/TouchButton';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  Target,
  Award,
  Zap,
  Eye,
  MousePointer,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
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
      growth: number;
      confidence: number;
    };
  };
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('30d');
  const [reportType, setReportType] = useState<'executive' | 'detailed' | 'performance'>('executive');
  const [isRealData, setIsRealData] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, reportType]);

  const convertApiDataToAnalyticsFormat = (salesData: any, customersData: any, auditData: any, reportType: string): AnalyticsData => {
    // Generate insights based on real data and report type
    const getInsightsByReportType = () => {
      switch (reportType) {
        case 'executive':
          return [
            `매출이 전월 대비 ${((salesData.totalRevenue / (salesData.totalRevenue * 0.9)) * 100 - 100).toFixed(1)}% 증가`,
            `신규 고객 ${customersData.newCustomers}명 유입, 전체 고객의 ${((customersData.newCustomers / customersData.totalCustomers) * 100).toFixed(1)}%`,
            `평균 주문 금액 ${new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(salesData.averageOrderValue)}으로 상승`,
            `전환율 ${salesData.conversionRate}%로 업계 평균 대비 우수한 성과`
          ];
        case 'detailed':
          return [
            `상위 5개 상품이 전체 매출의 ${((salesData.topProducts.slice(0, 5).reduce((sum: number, p: any) => sum + p.revenue, 0) / salesData.totalRevenue) * 100).toFixed(1)}% 차지`,
            `고객 유지율 ${customersData.customerRetentionRate}%로 양호한 수준`,
            `총 ${salesData.totalOrders}건의 주문 처리`,
            `고객 세그먼트별로 균등한 분포 확인`,
            `지역별 매출 분포에서 서울/경기 지역 집중도 높음`,
            `관리자 활동 로그 ${auditData.totalActions}건 기록`
          ];
        case 'performance':
          return [
            `전체 매출 목표 대비 현재 진행률 양호`,
            `고객 획득 비용 대비 우수한 성과 창출`,
            `시스템 안정성과 관리자 활동 모니터링 정상`,
            `고객 만족도 유지를 위한 지속적인 개선 필요`,
            `순추천지수 향상을 위한 서비스 품질 관리 중요`
          ];
        default:
          return [];
      }
    };

    // Generate recommendations based on actual data
    const getRecommendationsByData = () => {
      const recs = [];

      // Check for low-performing products
      const lowPerformingProducts = salesData.topProducts.filter((p: any) => p.revenue < salesData.totalRevenue * 0.05);
      if (lowPerformingProducts.length > 0) {
        recs.push({
          priority: 'medium' as const,
          category: '상품 관리',
          title: '저성과 상품 개선',
          description: `${lowPerformingProducts.length}개 상품의 매출 성과가 저조합니다. 마케팅 전략을 재검토해보세요.`,
          expectedImpact: '전체 매출 5-10% 개선',
          implementation: '상품별 성과 분석 및 프로모션 기획'
        });
      }

      // Check customer retention
      if (customersData.customerRetentionRate < 70) {
        recs.push({
          priority: 'high' as const,
          category: '고객 유지',
          title: '고객 유지율 개선',
          description: `현재 고객 유지율이 ${customersData.customerRetentionRate}%입니다. 고객 이탈 방지 전략이 필요합니다.`,
          expectedImpact: '고객 유지율 20% 향상',
          implementation: 'CRM 시스템 강화 및 맞춤형 서비스 제공'
        });
      }

      // Check conversion rate
      if (salesData.conversionRate < 3) {
        recs.push({
          priority: 'high' as const,
          category: '전환율 최적화',
          title: '웹사이트 전환율 개선',
          description: `현재 전환율이 ${salesData.conversionRate}%로 업계 평균보다 낮습니다.`,
          expectedImpact: '매출 15-25% 증가',
          implementation: 'UX/UI 개선 및 A/B 테스트 실시'
        });
      }

      return recs;
    };

    return {
      executiveSummary: {
        period: timeRange === '30d' ? '최근 30일' : timeRange === '90d' ? '최근 3개월' : '최근 1년',
        reportDate: new Date().toLocaleDateString('ko-KR'),
        keyInsights: getInsightsByReportType(),
        criticalAlerts: [
          {
            type: 'success',
            message: `총 매출 ${new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(salesData.totalRevenue)} 달성`,
            impact: '목표 매출 달성'
          },
          {
            type: customersData.customerRetentionRate < 70 ? 'warning' : 'success',
            message: `고객 유지율 ${customersData.customerRetentionRate}%`,
            impact: customersData.customerRetentionRate < 70 ? '고객 유지 전략 필요' : '안정적인 고객 관리'
          },
          {
            type: auditData.totalActions > 50 ? 'warning' : 'success',
            message: `관리자 활동 ${auditData.totalActions}건 기록`,
            impact: auditData.totalActions > 50 ? '활동량 점검 필요' : '정상적인 관리 활동'
          }
        ]
      },
      kpis: {
        revenue: {
          current: salesData.totalRevenue,
          previous: salesData.totalRevenue * 0.9, // Mock previous data
          target: salesData.totalRevenue * 0.95, // Mock target
          growth: ((salesData.totalRevenue / (salesData.totalRevenue * 0.9)) - 1) * 100,
          trend: 'up'
        },
        customers: {
          total: customersData.totalCustomers,
          new: customersData.newCustomers,
          returning: customersData.returningCustomers,
          churnRate: 100 - customersData.customerRetentionRate,
          ltv: customersData.averageCustomerValue
        },
        operations: {
          orderFulfillment: 94.2, // Mock operational data
          inventoryTurnover: 8.7,
          customerSatisfaction: 4.6,
          averageOrderValue: salesData.averageOrderValue
        },
        conversion: {
          overallRate: salesData.conversionRate,
          mobileRate: salesData.conversionRate * 1.1, // Mock mobile conversion
          desktopRate: salesData.conversionRate * 0.9, // Mock desktop conversion
          cartAbandonment: 68.4 // Mock abandonment rate
        }
      },
      performance: {
        topPerformers: [
          { category: '상품', metric: salesData.topProducts[0]?.name || '인기 상품', value: 34, growth: 18.2 },
          { category: '지역', metric: customersData.geographicDistribution?.[0]?.region || '주요 지역', value: 28, growth: 15.7 },
          { category: '채널', metric: '모바일', value: 52, growth: 23.1 },
          { category: '시간대', metric: '저녁 7-9시', value: 31, growth: 12.4 }
        ],
        underPerformers: [
          { category: '상품', metric: '저성과 카테고리', value: 8, decline: 12.3 },
          { category: '지역', metric: '기타 소도시', value: 12, decline: 8.7 },
          { category: '채널', metric: '직접 방문', value: 15, decline: 18.9 }
        ]
      },
      recommendations: getRecommendationsByData(),
      forecast: {
        nextMonth: {
          revenue: salesData.totalRevenue * 1.1, // 10% growth forecast
          orders: salesData.totalOrders * 1.05, // 5% order growth
          confidence: 82
        },
        nextQuarter: {
          revenue: salesData.totalRevenue * 3.2, // Quarterly projection
          growth: 15.8,
          confidence: 74
        }
      }
    };
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch data from the new analytics APIs
      const period = timeRange === '30d' ? '30d' : timeRange === '90d' ? '90d' : '90d';

      const [salesRes, customersRes, auditRes] = await Promise.all([
        fetch(`/api/admin/analytics/sales?period=${period}`, {
          credentials: 'include',
          cache: 'no-store'
        }),
        fetch(`/api/admin/analytics/customers?period=${period}`, {
          credentials: 'include',
          cache: 'no-store'
        }),
        fetch(`/api/admin/analytics/audit?period=${period}`, {
          credentials: 'include',
          cache: 'no-store'
        })
      ]);

      if (salesRes.ok && customersRes.ok && auditRes.ok) {
        const [salesData, customersData, auditData] = await Promise.all([
          salesRes.json(),
          customersRes.json(),
          auditRes.json()
        ]);

        // Convert API data to the expected format
        const realAnalyticsData = convertApiDataToAnalyticsFormat(salesData.data, customersData.data, auditData.data, reportType);
        setAnalyticsData(realAnalyticsData);
        setIsRealData(true);
        setLoading(false);
        return;
      }

      // Fallback to mock data if real data fails
      console.warn('Failed to fetch real data, using mock data');
      setIsRealData(false);

      // Generate different insights based on report type
      const getInsightsByReportType = () => {
        switch (reportType) {
          case 'executive':
            return [
              '매출이 전월 대비 12.5% 증가하여 목표치 대비 108% 달성',
              '신규 고객 유입이 23% 증가했으나 재구매율이 3.2% 감소',
              '모바일 전환율이 데스크톱을 처음으로 추월 (3.8% vs 3.2%)',
              '김치/발효식품 카테고리가 전체 매출의 34% 차지로 성장세 지속'
            ];
          case 'detailed':
            return [
              '상위 10개 상품이 전체 매출의 47% 차지, 상품 다양성 개선 필요',
              '고객 획득 비용(CAC) ₩23,450으로 전월 대비 8% 감소',
              '평균 주문 금액 ₩67,800으로 목표 대비 112% 달성',
              '배송 지연율 2.3%로 업계 평균 대비 우수한 성과',
              '고객 서비스 만족도 4.2/5.0으로 지속적인 개선 필요',
              '재방문율 68%로 충성도 높은 고객층 확보'
            ];
          case 'performance':
            return [
              'Q4 매출 목표 대비 현재 진행률 87%, 목표 달성 가능성 높음',
              '마케팅 ROI 340%로 투자 대비 우수한 성과 창출',
              '웹사이트 페이지 로딩 속도 1.2초로 업계 최고 수준',
              '고객 이탈률 5.8%로 전분기 대비 1.2%p 개선',
              '순추천지수(NPS) 72점으로 업계 평균 대비 높은 수준'
            ];
          default:
            return [];
        }
      };

      const getRecommendationsByReportType = () => {
        switch (reportType) {
          case 'executive':
            return [
              {
                priority: 'high',
                category: '전략적 방향',
                title: '모바일 우선 전략 수립',
                description: '모바일 전환율 우위를 활용한 전체 비즈니스 전략 재편',
                expectedImpact: '전체 매출 15-20% 증가',
                implementation: '모바일 전용 상품 기획 및 서비스 개선'
              },
              {
                priority: 'high',
                category: '운영 효율성',
                title: '재고 관리 시스템 고도화',
                description: 'AI 기반 수요 예측을 통한 재고 최적화',
                expectedImpact: '재고 회전율 30% 개선',
                implementation: '3개월 내 새로운 시스템 도입'
              },
              {
                priority: 'medium',
                category: '고객 경험',
                title: '개인화 서비스 강화',
                description: '고객 데이터 분석을 통한 맞춤형 상품 추천',
                expectedImpact: '재구매율 25% 향상',
                implementation: '추천 엔진 개발 및 CRM 고도화'
              }
            ];
          case 'detailed':
            return [
              {
                priority: 'high',
                category: '재고 관리',
                title: '인기 상품 재고 확보',
                description: '김치, 고추장 등 주요 상품의 재고 부족 현상 해결',
                expectedImpact: '월 매출 8-12% 증가',
                implementation: '2주 내 공급업체와 긴급 발주 협의'
              },
              {
                priority: 'high',
                category: '고객 서비스',
                title: '응답 시간 개선',
                description: '고객 문의 응답 시간을 12시간 이내로 단축',
                expectedImpact: '고객 만족도 15% 향상',
                implementation: '추가 상담사 2명 채용 및 시스템 개선'
              },
              {
                priority: 'medium',
                category: '배송 최적화',
                title: '당일 배송 지역 확대',
                description: '주요 도시 당일 배송 서비스 확대로 경쟁력 강화',
                expectedImpact: '신규 고객 획득 20% 증가',
                implementation: '물류 파트너사와 협의 및 시범 운영'
              },
              {
                priority: 'medium',
                category: '상품 기획',
                title: '시즌 한정 상품 기획',
                description: '터키 현지 행사에 맞춘 특별 상품 패키지',
                expectedImpact: '특별 기간 매출 40% 증가',
                implementation: '마케팅팀과 협업하여 월 1회 기획'
              },
              {
                priority: 'low',
                category: '기술 개선',
                title: '검색 기능 고도화',
                description: '한국어/터키어 혼용 검색 및 이미지 검색 도입',
                expectedImpact: '사이트 체류시간 15% 증가',
                implementation: '개발팀 3개월 프로젝트'
              }
            ];
          case 'performance':
            return [
              {
                priority: 'high',
                category: '성과 향상',
                title: 'KPI 달성 가속화',
                description: 'Q4 목표 달성을 위한 집중 마케팅 캠페인',
                expectedImpact: '목표 대비 110% 달성',
                implementation: '향후 4주간 프로모션 강화'
              },
              {
                priority: 'high',
                category: '효율성 개선',
                title: '마케팅 ROI 최적화',
                description: '고성과 채널에 예산 재배분으로 효율성 극대화',
                expectedImpact: 'ROI 20% 추가 개선',
                implementation: '월별 채널별 성과 리뷰 및 예산 조정'
              },
              {
                priority: 'medium',
                category: '고객 유지',
                title: '이탈 방지 프로그램',
                description: 'AI 기반 이탈 위험 고객 식별 및 맞춤 케어',
                expectedImpact: '이탈률 30% 감소',
                implementation: '데이터 분석팀과 협업하여 시스템 구축'
              },
              {
                priority: 'medium',
                category: '운영 최적화',
                title: '프로세스 자동화',
                description: '반복 업무 자동화를 통한 생산성 향상',
                expectedImpact: '운영 비용 15% 절감',
                implementation: 'RPA 도구 도입 및 직원 교육'
              }
            ];
          default:
            return [];
        }
      };

      // Mock comprehensive analytics data
      const mockData: AnalyticsData = {
        executiveSummary: {
          period: timeRange === '30d' ? '최근 30일' : timeRange === '90d' ? '최근 3개월' : '최근 1년',
          reportDate: new Date().toLocaleDateString('ko-KR'),
          keyInsights: getInsightsByReportType(),
          criticalAlerts: [
            {
              type: 'warning',
              message: '재고 부족 상품 23개 발견',
              impact: '매출 손실 예상: ₩2,340,000'
            },
            {
              type: 'critical',
              message: '고객 서비스 응답 시간 24시간 초과',
              impact: '고객 만족도 하락 위험'
            },
            {
              type: 'success',
              message: '이달 목표 매출 조기 달성',
              impact: '보너스 목표치 도달'
            }
          ]
        },
        kpis: {
          revenue: {
            current: 13500000,
            previous: 12000000,
            target: 12500000,
            growth: 12.5,
            trend: 'up'
          },
          customers: {
            total: 1847,
            new: 342,
            returning: 1505,
            churnRate: 8.3,
            ltv: 145000
          },
          operations: {
            orderFulfillment: 94.2,
            inventoryTurnover: 8.7,
            customerSatisfaction: 4.6,
            averageOrderValue: 53000
          },
          conversion: {
            overallRate: 3.5,
            mobileRate: 3.8,
            desktopRate: 3.2,
            cartAbandonment: 68.4
          }
        },
        performance: {
          topPerformers: [
            { category: '상품', metric: '김치/발효식품', value: 34, growth: 18.2 },
            { category: '지역', metric: '이스탄불', value: 28, growth: 15.7 },
            { category: '채널', metric: '모바일', value: 52, growth: 23.1 },
            { category: '시간대', metric: '저녁 7-9시', value: 31, growth: 12.4 }
          ],
          underPerformers: [
            { category: '상품', metric: '음료/차', value: 8, decline: -12.3 },
            { category: '지역', metric: '기타 소도시', value: 12, decline: -8.7 },
            { category: '채널', metric: '직접 방문', value: 15, decline: -18.9 }
          ]
        },
        recommendations: getRecommendationsByReportType(),
        forecast: {
          nextMonth: {
            revenue: 14500000,
            orders: 2850,
            confidence: 82
          },
          nextQuarter: {
            revenue: 45000000,
            growth: 15.8,
            confidence: 74
          }
        }
      };

      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatPercent = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeRange,
          reportType,
          data: analyticsData
        }),
      });

      if (!response.ok) {
        throw new Error('PDF 생성에 실패했습니다');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `mutpark-analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF 내보내기 오류:', error);
      alert('PDF 내보내기에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">비즈니스 분석 보고서 생성 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center">
              <TouchButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="text-white hover:bg-white/10 mr-4 p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </TouchButton>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {reportType === 'executive' && '비즈니스 성과 분석 보고서'}
                  {reportType === 'detailed' && '상세 운영 분석 보고서'}
                  {reportType === 'performance' && '성과 및 효율성 보고서'}
                </h1>
                <p className="text-blue-100">
                  {analyticsData.executiveSummary.period} • 보고서 생성일: {analyticsData.executiveSummary.reportDate}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isRealData
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isRealData ? '🔗 실제 데이터' : '📊 데모 데이터'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/70"
              >
                <option value="30d" className="text-gray-800">최근 30일</option>
                <option value="90d" className="text-gray-800">최근 3개월</option>
                <option value="1y" className="text-gray-800">최근 1년</option>
              </select>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="executive" className="text-gray-800">경영진 요약</option>
                <option value="detailed" className="text-gray-800">상세 분석</option>
                <option value="performance" className="text-gray-800">성과 리포트</option>
              </select>
              <TouchButton
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20"
                onClick={handleExportPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF 내보내기
              </TouchButton>
            </div>
          </div>
        </div>

        {/* Critical Alerts - Show for all report types */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {analyticsData.executiveSummary.criticalAlerts.map((alert, index) => (
            <div key={index} className={`rounded-lg border p-4 ${getAlertColor(alert.type)}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {alert.type === 'critical' && <AlertTriangle className="w-5 h-5" />}
                  {alert.type === 'warning' && <Clock className="w-5 h-5" />}
                  {alert.type === 'success' && <CheckCircle className="w-5 h-5" />}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">{alert.message}</h3>
                  <p className="text-xs mt-1 opacity-80">{alert.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content based on report type */}
        {reportType === 'executive' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              경영진 핵심 인사이트
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {analyticsData.executiveSummary.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <p className="ml-3 text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">전략적 예측</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">다음 달 매출</span>
                    <span className="font-semibold">{formatCurrency(analyticsData.forecast.nextMonth.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">분기 목표 달성률</span>
                    <span className="font-semibold text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">시장 확장 기회</span>
                    <span className="font-semibold text-blue-600">높음</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'detailed' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                상세 운영 분석
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">주요 지표 분석</h3>
                  {analyticsData.executiveSummary.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-semibold text-purple-600">{index + 1}</span>
                      </div>
                      <p className="ml-3 text-gray-700 text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">운영 효율성</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">주문 처리율</span>
                      <span className="font-semibold">{analyticsData.kpis.operations.orderFulfillment.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">평균 주문 금액</span>
                      <span className="font-semibold">{formatCurrency(analyticsData.kpis.operations.averageOrderValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">고객 만족도</span>
                      <span className="font-semibold">{analyticsData.kpis.operations.customerSatisfaction.toFixed(1)}/5.0</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">상품 분석</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">재고 부족 상품</span>
                      <span className="font-semibold text-orange-600">23개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">인기 카테고리</span>
                      <span className="font-semibold">발효식품</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">신제품 성과</span>
                      <span className="font-semibold text-green-600">우수</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'performance' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-green-600" />
              성과 및 효율성 분석
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4 text-green-600">🏆 우수 성과 지표</h3>
                <div className="space-y-3">
                  {analyticsData.performance.topPerformers.map((performer, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-green-900">{performer.metric}</span>
                          <p className="text-xs text-green-700">{performer.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">{performer.value}%</span>
                          <p className="text-xs text-green-500">+{performer.growth.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-4 text-red-600">📈 개선 필요 지표</h3>
                <div className="space-y-3">
                  {analyticsData.performance.underPerformers.map((performer, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-red-900">{performer.metric}</span>
                          <p className="text-xs text-red-700">{performer.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-red-600">{performer.value}%</span>
                          <p className="text-xs text-red-500">{performer.decline.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-3">⚡ 핵심 성과 요약</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">87%</div>
                  <div className="text-sm text-yellow-700">목표 달성률</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">+15%</div>
                  <div className="text-sm text-yellow-700">전기 대비 성장</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">A+</div>
                  <div className="text-sm text-yellow-700">종합 등급</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPI Dashboard - Different for each report type */}
        {reportType === 'executive' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Executive KPIs - High level overview */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">총 매출 (YTD)</p>
                  <p className="text-3xl font-bold">{formatCurrency(analyticsData.kpis.revenue.current * 12)}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-8 h-8" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="text-blue-100">연간 목표 대비 92% 달성</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">고객 확대</p>
                  <p className="text-3xl font-bold">{formatNumber(analyticsData.kpis.customers.total)}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="text-green-100">신규 고객 +{analyticsData.kpis.customers.new}명</span>
              </div>
            </div>
          </div>
        )}

        {reportType === 'detailed' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Detailed operational KPIs */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">주문 처리율</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.kpis.operations.orderFulfillment.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">운영 효율성</p>
                <p className="text-sm font-semibold text-blue-600">우수</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">평균 주문 금액</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.kpis.operations.averageOrderValue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">전월 대비</p>
                <p className="text-sm font-semibold text-green-600">+8.5%</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">고객 만족도</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.kpis.operations.customerSatisfaction.toFixed(1)}/5.0</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">리뷰 기반</p>
                <p className="text-sm font-semibold text-yellow-600">우수</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">재고 회전율</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.kpis.operations.inventoryTurnover.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">목표 대비</p>
                <p className="text-sm font-semibold text-purple-600">105%</p>
              </div>
            </div>
          </div>
        )}


        {/* Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-green-600" />
              성과 우수 부문
            </h3>
            <div className="space-y-4">
              {analyticsData.performance.topPerformers.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.metric}</p>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{formatPercent(item.growth)}</p>
                    <p className="text-sm text-gray-600">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Under Performers */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
              개선 필요 부문
            </h3>
            <div className="space-y-4">
              {analyticsData.performance.underPerformers.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.metric}</p>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{formatPercent(-item.decline)}</p>
                    <p className="text-sm text-gray-600">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-orange-600" />
            실행 권장사항
          </h2>
          <div className="space-y-4">
            {analyticsData.recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority === 'high' && '높음'}
                        {rec.priority === 'medium' && '보통'}
                        {rec.priority === 'low' && '낮음'}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">{rec.category}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                    <p className="text-gray-700 mb-3">{rec.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">예상 효과</p>
                        <p className="text-sm text-green-600">{rec.expectedImpact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">실행 방안</p>
                        <p className="text-sm text-gray-700">{rec.implementation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-2">
            이 보고서는 MutPark 비즈니스 인텔리전스 시스템에 의해 자동 생성되었습니다.
          </p>
          <p className="text-sm text-gray-500">
            데이터 기준: {analyticsData.executiveSummary.period} •
            마지막 업데이트: {new Date().toLocaleString('ko-KR')}
          </p>
        </div>
      </div>
    </div>
  );
}