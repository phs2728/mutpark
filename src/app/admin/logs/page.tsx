"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import SystemAccessGuard from "@/components/admin/SystemAccessGuard";
import { useState, useEffect } from "react";
import {
  ScrollText,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Info,
  AlertTriangle,
  Shield,
  Eye,
  Calendar,
  Clock,
  User,
  Globe,
  Trash2,
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

const logLevels = {
  info: { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Info, label: '정보' },
  warn: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertTriangle, label: '경고' },
  error: { color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle, label: '오류' },
  debug: { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Eye, label: '디버그' },
};

const logCategories = [
  { value: 'all', label: '전체' },
  { value: 'auth', label: '인증' },
  { value: 'payment', label: '결제' },
  { value: 'order', label: '주문' },
  { value: 'api', label: 'API' },
  { value: 'security', label: '보안' },
  { value: 'system', label: '시스템' },
  { value: 'database', label: '데이터베이스' },
];

function LogsManagementContent() {
  const { permissions } = useAdminAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("24h");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const mockLogs: LogEntry[] = [
    {
      id: "1",
      timestamp: "2025-01-23T10:30:25Z",
      level: "info",
      category: "auth",
      message: "관리자 로그인 성공",
      userId: "admin_001",
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      metadata: { loginMethod: "password", duration: "245ms" }
    },
    {
      id: "2",
      timestamp: "2025-01-23T10:28:14Z",
      level: "warn",
      category: "payment",
      message: "결제 처리 시간 초과 임계값 도달",
      ip: "203.0.113.45",
      metadata: { paymentId: "pay_123456", processingTime: "8.5s", threshold: "5s" }
    },
    {
      id: "3",
      timestamp: "2025-01-23T10:25:42Z",
      level: "error",
      category: "api",
      message: "외부 API 호출 실패 - Iyzico 결제 서비스",
      metadata: { endpoint: "/payment/process", statusCode: 503, retryCount: 3 }
    },
    {
      id: "4",
      timestamp: "2025-01-23T10:22:18Z",
      level: "info",
      category: "order",
      message: "새 주문 생성",
      userId: "user_789",
      ip: "85.34.197.23",
      metadata: { orderId: "order_789012", amount: "125.50 TRY", items: 3 }
    },
    {
      id: "5",
      timestamp: "2025-01-23T10:20:05Z",
      level: "error",
      category: "security",
      message: "의심스러운 로그인 시도 차단",
      ip: "198.51.100.42",
      userAgent: "Bot/1.0",
      metadata: { reason: "bruteForce", attemptCount: 5, blockedFor: "15min" }
    },
    {
      id: "6",
      timestamp: "2025-01-23T10:18:33Z",
      level: "warn",
      category: "system",
      message: "메모리 사용량 높음",
      metadata: { usage: "87%", threshold: "85%", action: "cleanup_scheduled" }
    },
    {
      id: "7",
      timestamp: "2025-01-23T10:15:22Z",
      level: "debug",
      category: "database",
      message: "쿼리 실행 완료",
      metadata: { query: "SELECT * FROM products WHERE...", duration: "125ms", rows: 45 }
    },
  ];

  useEffect(() => {
    fetchLogs();
  }, [selectedLevel, selectedCategory, selectedDateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || log.level === selectedLevel;
    const matchesCategory = selectedCategory === "all" || log.category === selectedCategory;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  const exportLogs = () => {
    const logData = filteredLogs.map(log => ({
      timestamp: log.timestamp,
      level: log.level,
      category: log.category,
      message: log.message,
      userId: log.userId || '',
      ip: log.ip || '',
      metadata: JSON.stringify(log.metadata || {})
    }));

    const csv = [
      ['시간', '레벨', '카테고리', '메시지', '사용자ID', 'IP주소', '메타데이터'],
      ...logData.map(row => [
        row.timestamp,
        row.level,
        row.category,
        row.message,
        row.userId,
        row.ip,
        row.metadata
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!permissions?.canViewLogs) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ScrollText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">시스템 로그 조회 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시스템 로그</h1>
          <p className="mt-2 text-gray-600">
            시스템 활동 및 오류 로그를 모니터링하고 분석합니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={exportLogs}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV 내보내기
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="메시지 또는 카테고리 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              로그 레벨
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체 레벨</option>
              <option value="error">오류</option>
              <option value="warn">경고</option>
              <option value="info">정보</option>
              <option value="debug">디버그</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {logCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기간
            </label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1h">최근 1시간</option>
              <option value="24h">최근 24시간</option>
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            총 {filteredLogs.length}개의 로그 (전체 {logs.length}개 중)
          </div>
          {filteredLogs.length > 0 && (
            <button
              onClick={() => setExpandedLogs(new Set())}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              모두 접기
            </button>
          )}
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(logLevels).map(([level, config]) => {
          const count = filteredLogs.filter(log => log.level === level).length;
          const Icon = config.icon;
          return (
            <div key={level} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${config.bgColor} mr-3`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{config.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">로그 엔트리</h3>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-6 text-center">
            <ScrollText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">로그가 없습니다</h3>
            <p className="text-gray-600">현재 필터 조건에 맞는 로그가 없습니다.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {filteredLogs.map((log) => {
                const levelConfig = logLevels[log.level];
                const LevelIcon = levelConfig.icon;
                const isExpanded = expandedLogs.has(log.id);

                return (
                  <div
                    key={log.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-1 rounded ${levelConfig.bgColor} mt-1`}>
                          <LevelIcon className={`h-4 w-4 ${levelConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${levelConfig.bgColor} ${levelConfig.color}`}>
                              {levelConfig.label}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {log.category}
                            </span>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(log.timestamp)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">{log.message}</p>

                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            {log.userId && (
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                사용자: {log.userId}
                              </div>
                            )}
                            {log.ip && (
                              <div className="flex items-center">
                                <Globe className="h-3 w-3 mr-1" />
                                IP: {log.ip}
                              </div>
                            )}
                          </div>

                          {isExpanded && log.metadata && (
                            <div className="mt-3 p-3 bg-gray-50 rounded border">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">상세 정보</h5>
                              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                              {log.userAgent && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <div className="text-xs text-gray-500">
                                    <strong>User Agent:</strong> {log.userAgent}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {log.metadata && (
                          <button
                            onClick={() => toggleLogExpansion(log.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {isExpanded ? '접기' : '상세보기'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLogs() {
  return (
    <SystemAccessGuard>
      <LogsManagementContent />
    </SystemAccessGuard>
  );
}