'use client';

import { useState } from 'react';
import SystemAccessGuard from '@/components/admin/SystemAccessGuard';

interface SystemStats {
  serverStatus: 'online' | 'maintenance' | 'error';
  databaseConnections: number;
  maxConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  uptime: string;
  version: string;
  lastBackup: string;
}

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'admin_access' | 'system_change' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  user: string;
  timestamp: string;
  ip: string;
}

function SystemManagementContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'database' | 'logs'>('overview');

  const systemStats: SystemStats = {
    serverStatus: 'online',
    databaseConnections: 15,
    maxConnections: 100,
    memoryUsage: 67,
    cpuUsage: 34,
    diskUsage: 78,
    uptime: '15일 3시간 42분',
    version: 'v1.2.3',
    lastBackup: '2024-01-15 03:00:00'
  };

  const securityEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'admin_access',
      severity: 'medium',
      message: '시스템 관리 섹션 접근',
      user: 'admin@mutpark.com',
      timestamp: new Date().toLocaleString('ko-KR'),
      ip: '192.168.1.100'
    },
    {
      id: '2',
      type: 'login_attempt',
      severity: 'high',
      message: '비정상적인 로그인 시도 감지',
      user: 'unknown',
      timestamp: new Date(Date.now() - 3600000).toLocaleString('ko-KR'),
      ip: '203.241.185.67'
    },
    {
      id: '3',
      type: 'system_change',
      severity: 'low',
      message: '시스템 설정 변경',
      user: 'superadmin@mutpark.com',
      timestamp: new Date(Date.now() - 7200000).toLocaleString('ko-KR'),
      ip: '192.168.1.101'
    }
  ];

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
    }
  };

  const getTypeIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login_attempt':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'admin_access':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'system_change':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'suspicious_activity':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">시스템 관리</h1>
            <span className="ml-3 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
              민감 정보
            </span>
          </div>
          <p className="text-gray-600">시스템 상태 모니터링 및 보안 관리</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: '시스템 개요', icon: '📊' },
              { key: 'security', label: '보안 이벤트', icon: '🔒' },
              { key: 'database', label: '데이터베이스', icon: '💾' },
              { key: 'logs', label: '시스템 로그', icon: '📄' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 시스템 개요 탭 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 서버 상태 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">서버 상태</p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <p className="text-lg font-semibold text-gray-900">온라인</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">업타임</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{systemStats.uptime}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">메모리 사용률</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{systemStats.memoryUsage}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${systemStats.memoryUsage > 80 ? 'bg-red-500' : systemStats.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${systemStats.memoryUsage}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600">CPU 사용률</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{systemStats.cpuUsage}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${systemStats.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 데이터베이스 연결 상태 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">데이터베이스 연결 상태</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">활성 연결</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.databaseConnections}/{systemStats.maxConnections}</p>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${(systemStats.databaseConnections / systemStats.maxConnections) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 보안 이벤트 탭 */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">최근 보안 이벤트</h3>
                <p className="text-sm text-gray-500 mt-1">시스템 보안 관련 활동 모니터링</p>
              </div>
              <div className="divide-y divide-gray-200">
                {securityEvents.map((event) => (
                  <div key={event.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(event.severity)}`}>
                          {getTypeIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{event.message}</p>
                          <p className="text-sm text-gray-500">사용자: {event.user}</p>
                          <p className="text-sm text-gray-500">IP: {event.ip}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{event.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 데이터베이스 탭 */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">데이터베이스 관리</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">백업 상태</h4>
                  <p className="text-sm text-gray-600 mt-1">마지막 백업: {systemStats.lastBackup}</p>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    수동 백업
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">데이터베이스 크기</h4>
                  <p className="text-sm text-gray-600 mt-1">전체 크기: 2.4GB</p>
                  <button className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    최적화
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">인덱스 상태</h4>
                  <p className="text-sm text-gray-600 mt-1">상태: 정상</p>
                  <button className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
                    재구성
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 시스템 로그 탭 */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">시스템 로그</h3>
              </div>
              <div className="p-6">
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                  <div>[2024-01-15 14:30:25] INFO: System startup completed</div>
                  <div>[2024-01-15 14:30:26] INFO: Database connection established</div>
                  <div>[2024-01-15 14:30:27] INFO: Admin authentication system initialized</div>
                  <div>[2024-01-15 14:35:12] WARN: High memory usage detected (67%)</div>
                  <div>[2024-01-15 14:40:15] INFO: Admin user logged in: admin@mutpark.com</div>
                  <div>[2024-01-15 14:41:03] INFO: System management accessed</div>
                  <div className="text-yellow-400">[2024-01-15 14:41:05] WARN: Sensitive system area accessed</div>
                  <div>[2024-01-15 14:42:10] INFO: Password verification successful</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SystemManagementPage() {
  return (
    <SystemAccessGuard>
      <SystemManagementContent />
    </SystemAccessGuard>
  );
}