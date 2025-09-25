"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import SystemAccessGuard from "@/components/admin/SystemAccessGuard";
import { useState } from "react";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  HardDrive,
  Clock,
  Activity,
  FileText,
} from "lucide-react";

interface DatabaseStats {
  totalSize: string;
  tableCount: number;
  recordCount: number;
  lastBackup?: string;
  uptime: string;
  connections: number;
}

interface TableInfo {
  name: string;
  records: number;
  size: string;
  lastModified: string;
}

function DatabaseManagementContent() {
  const { permissions } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DatabaseStats>({
    totalSize: "1.2 GB",
    tableCount: 25,
    recordCount: 15847,
    lastBackup: "2025-09-23T02:00:00Z",
    uptime: "7일 12시간",
    connections: 8,
  });

  const [tableInfo] = useState<TableInfo[]>([
    { name: "User", records: 1243, size: "2.3 MB", lastModified: "2025-09-23T10:30:00Z" },
    { name: "Product", records: 89, size: "1.8 MB", lastModified: "2025-09-23T08:45:00Z" },
    { name: "Order", records: 2156, size: "5.7 MB", lastModified: "2025-09-23T11:20:00Z" },
    { name: "CommunityPost", records: 456, size: "3.2 MB", lastModified: "2025-09-23T09:15:00Z" },
    { name: "Event", records: 23, size: "0.8 MB", lastModified: "2025-09-22T16:30:00Z" },
    { name: "OrderItem", records: 4567, size: "4.1 MB", lastModified: "2025-09-23T11:18:00Z" },
    { name: "CommunityPostComment", records: 1289, size: "2.9 MB", lastModified: "2025-09-23T10:45:00Z" },
  ]);

  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState(0);

  if (!permissions?.canManageSystem) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">시스템 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      // 실제로는 백업 API 호출
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert("데이터베이스 백업이 완료되었습니다.");
      setStats(prev => ({ ...prev, lastBackup: new Date().toISOString() }));
    } catch (error) {
      alert("백업 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = () => {
    setShowConfirmModal('restore');
    setConfirmStep(0);
  };

  const handleSeedReset = () => {
    setShowConfirmModal('seed');
    setConfirmStep(0);
  };

  const handleFullReset = () => {
    setShowConfirmModal('reset');
    setConfirmStep(0);
  };

  const executeAction = async (action: string) => {
    setLoading(true);
    try {
      // 실제로는 해당 API 호출
      await new Promise(resolve => setTimeout(resolve, 5000));

      switch (action) {
        case 'restore':
          alert("데이터베이스 복원이 완료되었습니다.");
          break;
        case 'seed':
          alert("시드 데이터 재설정이 완료되었습니다.");
          break;
        case 'reset':
          alert("데이터베이스 완전 초기화가 완료되었습니다.");
          break;
      }
    } catch (error) {
      alert("작업 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setShowConfirmModal(null);
      setConfirmStep(0);
    }
  };

  const confirmAction = () => {
    if (confirmStep < 2) {
      setConfirmStep(confirmStep + 1);
    } else {
      executeAction(showConfirmModal!);
    }
  };

  const getConfirmMessage = (action: string, step: number) => {
    const messages = {
      restore: [
        "데이터베이스를 백업 파일로 복원하시겠습니까?",
        "현재 모든 데이터가 삭제되고 백업 데이터로 교체됩니다.",
        "정말로 실행하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      ],
      seed: [
        "시드 데이터를 재설정하시겠습니까?",
        "모든 테스트 데이터가 초기화되고 새로운 시드 데이터가 생성됩니다.",
        "정말로 실행하시겠습니까? 기존 데이터는 삭제됩니다."
      ],
      reset: [
        "데이터베이스를 완전히 초기화하시겠습니까?",
        "모든 사용자 데이터, 주문, 상품 정보가 영구적으로 삭제됩니다.",
        "경고: 이 작업은 되돌릴 수 없습니다. 정말로 실행하시겠습니까?"
      ]
    };
    return messages[action as keyof typeof messages][step];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">데이터베이스 관리</h1>
        <p className="text-gray-600">데이터베이스 백업, 복원 및 관리 도구입니다.</p>
      </div>

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <HardDrive className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">총 크기</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalSize}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">테이블 수</p>
              <p className="text-lg font-bold text-gray-900">{stats.tableCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">총 레코드</p>
              <p className="text-lg font-bold text-gray-900">{stats.recordCount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">업타임</p>
              <p className="text-lg font-bold text-gray-900">{stats.uptime}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">연결 수</p>
              <p className="text-lg font-bold text-gray-900">{stats.connections}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Download className="h-8 w-8 text-indigo-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">마지막 백업</p>
              <p className="text-sm font-bold text-gray-900">
                {stats.lastBackup ? formatDate(stats.lastBackup).split(' ')[0] : '없음'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">데이터베이스 작업</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleBackup}
            disabled={loading}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            데이터베이스 백업
          </button>

          <button
            onClick={handleRestore}
            disabled={loading}
            className="flex items-center justify-center px-4 py-3 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4 mr-2" />
            백업 파일 복원
          </button>

          <button
            onClick={handleSeedReset}
            disabled={loading}
            className="flex items-center justify-center px-4 py-3 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            시드 데이터 재설정
          </button>

          <button
            onClick={handleFullReset}
            disabled={loading}
            className="flex items-center justify-center px-4 py-3 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            완전 초기화
          </button>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">주의사항</h4>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>백업 작업은 데이터베이스 크기에 따라 시간이 오래 걸릴 수 있습니다.</li>
                  <li>복원 및 초기화 작업은 되돌릴 수 없으니 신중히 진행하세요.</li>
                  <li>작업 중에는 서비스 이용에 영향을 줄 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Information */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">테이블 정보</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  테이블명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  레코드 수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  크기
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마지막 수정
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableInfo.map((table) => (
                <tr key={table.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{table.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {table.records.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {table.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(table.lastModified)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {showConfirmModal === 'restore' && '데이터베이스 복원'}
                {showConfirmModal === 'seed' && '시드 데이터 재설정'}
                {showConfirmModal === 'reset' && '데이터베이스 완전 초기화'}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {getConfirmMessage(showConfirmModal, confirmStep)}
                </p>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm ${
                  confirmStep === 2
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                }`}
                onClick={confirmAction}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    실행 중...
                  </>
                ) : (
                  confirmStep === 2 ? '최종 확인' : '다음'
                )}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                onClick={() => {
                  setShowConfirmModal(null);
                  setConfirmStep(0);
                }}
                disabled={loading}
              >
                취소
              </button>
            </div>

            {/* Progress indicator */}
            <div className="mt-4">
              <div className="flex justify-center space-x-2">
                {[0, 1, 2].map((step) => (
                  <div
                    key={step}
                    className={`h-2 w-2 rounded-full ${
                      step <= confirmStep ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDatabase() {
  return (
    <SystemAccessGuard>
      <DatabaseManagementContent />
    </SystemAccessGuard>
  );
}