"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Server,
  Wifi,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

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

const statusConfig = {
  healthy: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    label: '정상'
  },
  degraded: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: AlertTriangle,
    label: '성능 저하'
  },
  unhealthy: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: AlertCircle,
    label: '오류'
  }
};

const serviceIcons = {
  database: Database,
  iyzico: Wifi,
  'system-resources': Server,
  application: Globe,
  default: Activity
};

export default function AdminHealth() {
  const { permissions } = useAdminAuth();
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    // 30초마다 자동 새로고침
    const interval = setInterval(fetchHealthData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!permissions?.canManageSystem) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">시스템 모니터링 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}일 ${hours}시간 ${minutes}분`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else {
      return `${minutes}분`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  if (loading && !healthData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">시스템 상태를 불러올 수 없습니다</h3>
          <p className="text-gray-600 mb-4">시스템 상태 확인 중 오류가 발생했습니다.</p>
          <button
            onClick={fetchHealthData}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const overallStatusConfig = statusConfig[healthData.status];
  const OverallStatusIcon = overallStatusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시스템 상태</h1>
          <p className="text-gray-600">
            마지막 업데이트: {formatTimestamp(lastUpdated.toISOString())}
          </p>
        </div>
        <button
          onClick={fetchHealthData}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* Overall Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${overallStatusConfig.bgColor} mr-3`}>
              <OverallStatusIcon className={`h-6 w-6 ${overallStatusConfig.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">전체 시스템 상태</h2>
              <p className={`text-sm ${overallStatusConfig.color} font-medium`}>
                {overallStatusConfig.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">업타임</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatUptime(healthData.uptime)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {healthData.summary.total}
            </div>
            <div className="text-sm text-gray-600">총 서비스</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {healthData.summary.healthy}
            </div>
            <div className="text-sm text-gray-600">정상</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {healthData.summary.degraded}
            </div>
            <div className="text-sm text-gray-600">성능 저하</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {healthData.summary.unhealthy}
            </div>
            <div className="text-sm text-gray-600">오류</div>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">서비스별 상태</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {healthData.checks.map((check, index) => {
              const config = statusConfig[check.status];
              const StatusIcon = config.icon;
              const ServiceIcon = serviceIcons[check.service as keyof typeof serviceIcons] || serviceIcons.default;

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center space-x-2">
                        <ServiceIcon className="h-5 w-5 text-gray-600" />
                        <StatusIcon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 capitalize">
                            {check.service.replace('-', ' ')}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        {check.message && (
                          <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            응답시간: {check.responseTime}ms
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {check.details && Object.keys(check.details).length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                          상세 정보 보기
                        </summary>
                        <div className="mt-2 bg-gray-50 rounded p-3">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(check.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">버전</span>
              <span className="text-sm font-medium text-gray-900">{healthData.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">상태 확인 시각</span>
              <span className="text-sm font-medium text-gray-900">
                {formatTimestamp(healthData.timestamp)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">업타임</span>
              <span className="text-sm font-medium text-gray-900">
                {formatUptime(healthData.uptime)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">모니터링 설정</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>자동 새로고침</span>
              <span className="text-green-600 font-medium">30초마다</span>
            </div>
            <div className="flex items-center justify-between">
              <span>임계값 - 응답시간</span>
              <span className="text-gray-900 font-medium">1000ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span>임계값 - 메모리</span>
              <span className="text-gray-900 font-medium">90%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}