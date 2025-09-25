import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { timeRange, reportType, data } = await request.json();

    // Generate HTML content for PDF
    const htmlContent = generateReportHTML(data, timeRange, reportType);

    // For now, return a simple text PDF response
    // In a real implementation, you would use a library like puppeteer or jsPDF
    const pdfBuffer = generateSimplePDF(htmlContent, data);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="mutpark-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    return NextResponse.json(
      { error: 'PDF 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}

function generateReportHTML(data: any, timeRange: string, reportType: string): string {
  const reportDate = new Date().toLocaleDateString('ko-KR');

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Malgun Gothic', sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
        .title { font-size: 28px; font-weight: bold; color: #4F46E5; margin-bottom: 10px; }
        .subtitle { font-size: 16px; color: #666; }
        .section { margin: 30px 0; }
        .section-title { font-size: 20px; font-weight: bold; color: #374151; margin-bottom: 15px; border-left: 4px solid #4F46E5; padding-left: 15px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .kpi-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; }
        .kpi-value { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .kpi-label { font-size: 14px; color: #6B7280; margin-top: 5px; }
        .insight-item { margin: 10px 0; padding: 10px; background: #F9FAFB; border-radius: 6px; }
        .recommendation { margin: 15px 0; padding: 15px; border-left: 4px solid #10B981; background: #ECFDF5; }
        .priority-high { border-left-color: #EF4444; }
        .priority-medium { border-left-color: #F59E0B; }
        .priority-low { border-left-color: #3B82F6; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">MutPark 비즈니스 성과 분석 보고서</div>
        <div class="subtitle">${data.executiveSummary.period} • 생성일: ${reportDate}</div>
      </div>

      <div class="section">
        <div class="section-title">경영진 요약</div>
        ${data.executiveSummary.keyInsights.map((insight: string) => `
          <div class="insight-item">• ${insight}</div>
        `).join('')}
      </div>

      <div class="section">
        <div class="section-title">핵심 성과 지표 (KPI)</div>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-value">${formatCurrency(data.kpis.revenue.current)}</div>
            <div class="kpi-label">총 매출 (${formatPercent(data.kpis.revenue.growth)})</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${formatNumber(data.kpis.customers.total)}</div>
            <div class="kpi-label">총 고객 수</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${data.kpis.operations.orderFulfillment}%</div>
            <div class="kpi-label">주문 처리율</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${data.kpis.conversion.overallRate}%</div>
            <div class="kpi-label">전환율</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">핵심 권장사항</div>
        ${data.recommendations.map((rec: any) => `
          <div class="recommendation priority-${rec.priority}">
            <strong>${rec.title}</strong><br>
            ${rec.description}<br>
            <em>예상 효과: ${rec.expectedImpact}</em>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p>본 보고서는 MutPark 애널리틱스 시스템에서 자동 생성되었습니다.</p>
        <p>문의사항: analytics@mutpark.com</p>
      </div>
    </body>
    </html>
  `;
}

function generateSimplePDF(htmlContent: string, data: any): Buffer {
  // This is a simplified PDF generation
  // In a real implementation, you would use puppeteer, jsPDF, or similar library

  const reportContent = `
MutPark 비즈니스 성과 분석 보고서
=====================================

생성일: ${new Date().toLocaleDateString('ko-KR')}
기간: ${data.executiveSummary.period}

경영진 요약
-----------
${data.executiveSummary.keyInsights.map((insight: string) => `• ${insight}`).join('\n')}

핵심 성과 지표
--------------
총 매출: ${formatCurrency(data.kpis.revenue.current)} (${formatPercent(data.kpis.revenue.growth)})
총 고객 수: ${formatNumber(data.kpis.customers.total)}명
주문 처리율: ${data.kpis.operations.orderFulfillment}%
전환율: ${data.kpis.conversion.overallRate}%

핵심 권장사항
-------------
${data.recommendations.map((rec: any) => `
[${rec.priority.toUpperCase()}] ${rec.title}
${rec.description}
예상 효과: ${rec.expectedImpact}
`).join('\n')}

---
본 보고서는 MutPark 애널리틱스 시스템에서 생성되었습니다.
`;

  return Buffer.from(reportContent, 'utf-8');
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

function formatPercent(num: number): string {
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
}