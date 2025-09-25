"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Database,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Info,
  Clock,
} from "lucide-react";

interface BackupFile {
  fileName: string;
  size: number;
  createdAt: string;
  modifiedAt?: string;
}

interface DatabaseInfo {
  tables: {
    users: number;
    products: number;
    orders: number;
    communityPosts: number;
    events: number;
    banners: number;
  };
  totalRecords: number;
  hasData: boolean;
  lastChecked: string;
}

interface SeedStatus {
  users: number;
  products: number;
  categories: number;
  events: number;
  banners: number;
  hasSeedData: boolean;
  lastChecked: string;
}

export default function DatabaseManagement() {
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [seedStatus, setSeedStatus] = useState<SeedStatus | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [resetConfirmations, setResetConfirmations] = useState({
    step1: '',
    step2: '',
    step3: ''
  });

  useEffect(() => {
    loadDatabaseInfo();
    loadBackups();
    loadSeedStatus();
  }, []);

  const loadDatabaseInfo = async () => {
    try {
      const response = await fetch('/api/admin/database/reset');
      const data = await response.json();
      if (data.databaseInfo) {
        setDatabaseInfo(data.databaseInfo);
      }
    } catch (error) {
      console.error('Failed to load database info:', error);
    }
  };

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/admin/database/backup');
      const data = await response.json();
      if (data.backups) {
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const loadSeedStatus = async () => {
    try {
      const response = await fetch('/api/admin/database/seed');
      const data = await response.json();
      if (data.seedStatus) {
        setSeedStatus(data.seedStatus);
      }
    } catch (error) {
      console.error('Failed to load seed status:', error);
    }
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/database/backup', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        alert('백업이 성공적으로 생성되었습니다.');
        loadBackups();
      } else {
        alert('백업 생성에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      alert('백업 생성 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  const seedDatabase = async (action: 'reset' | 'populate') => {
    setLoading(true);
    try {
      const payload: any = { action };

      if (action === 'reset') {
        const confirmation = prompt('시드 데이터를 초기화하시겠습니까? "RESET_SEED_DATA_CONFIRM"을 입력하세요:');
        if (confirmation !== 'RESET_SEED_DATA_CONFIRM') {
          setLoading(false);
          return;
        }
        payload.confirmation = confirmation;
      }

      const response = await fetch('/api/admin/database/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        loadSeedStatus();
        loadDatabaseInfo();
      } else {
        alert('시드 데이터 작업에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      alert('시드 데이터 작업 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  const resetDatabase = async () => {
    const { step1, step2, step3 } = resetConfirmations;

    if (!step1 || !step2 || !step3) {
      alert('모든 확인 단계를 완료해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/database/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmationStep1: step1,
          confirmationStep2: step2,
          confirmationStep3: step3,
          resetType: 'full'
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setShowResetModal(false);
        setResetConfirmations({ step1: '', step2: '', step3: '' });
        loadDatabaseInfo();
        loadSeedStatus();
      } else {
        alert('데이터베이스 초기화에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      alert('데이터베이스 초기화 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">데이터베이스 관리</h3>

      <div className="space-y-6">
        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">주의사항</h4>
              <p className="text-sm text-yellow-700 mt-1">
                데이터베이스 작업은 신중하게 수행하세요. 백업을 먼저 생성하는 것을 권장합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Database Status */}
        {databaseInfo && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">데이터베이스 상태</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{databaseInfo.tables.users}</div>
                <div className="text-sm text-gray-600">사용자</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{databaseInfo.tables.products}</div>
                <div className="text-sm text-gray-600">상품</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{databaseInfo.tables.orders}</div>
                <div className="text-sm text-gray-600">주문</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{databaseInfo.tables.communityPosts}</div>
                <div className="text-sm text-gray-600">게시물</div>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{databaseInfo.tables.events}</div>
                <div className="text-sm text-gray-600">이벤트</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{databaseInfo.tables.banners}</div>
                <div className="text-sm text-gray-600">배너</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              총 레코드 수: {databaseInfo.totalRecords.toLocaleString()}개 •
              마지막 확인: {formatDate(databaseInfo.lastChecked)}
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">백업 생성</h4>
            <p className="text-sm text-gray-600 mb-3">
              현재 데이터베이스의 전체 백업을 생성합니다.
            </p>
            <button
              onClick={createBackup}
              disabled={loading}
              className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 inline mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 inline mr-2" />
                  백업 생성
                </>
              )}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">백업 복원</h4>
            <p className="text-sm text-gray-600 mb-3">
              백업 파일로부터 데이터를 복원합니다.
            </p>
            <button
              onClick={() => setShowRestoreModal(true)}
              className="w-full px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
            >
              <Upload className="h-4 w-4 inline mr-2" />
              백업 복원
            </button>
          </div>

          <div className="border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">데이터 초기화</h4>
            <p className="text-sm text-gray-600 mb-3">
              모든 데이터를 삭제하고 초기 상태로 복원합니다.
            </p>
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
            >
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              초기화
            </button>
          </div>
        </div>

        {/* Seed Data Management */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">시드 데이터 관리</h4>
          {seedStatus && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="font-semibold">{seedStatus.users}</div>
                  <div className="text-sm text-gray-600">사용자</div>
                </div>
                <div>
                  <div className="font-semibold">{seedStatus.products}</div>
                  <div className="text-sm text-gray-600">상품</div>
                </div>
                <div>
                  <div className="font-semibold">{seedStatus.categories}</div>
                  <div className="text-sm text-gray-600">카테고리</div>
                </div>
                <div>
                  <div className="font-semibold">{seedStatus.events}</div>
                  <div className="text-sm text-gray-600">이벤트</div>
                </div>
                <div>
                  <div className="font-semibold">{seedStatus.banners}</div>
                  <div className="text-sm text-gray-600">배너</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => seedDatabase('populate')}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              시드 데이터 추가
            </button>
            <button
              onClick={() => seedDatabase('reset')}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 disabled:opacity-50"
            >
              시드 데이터 재설정
            </button>
          </div>
        </div>

        {/* Backup Files List */}
        {backups.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">백업 파일 목록</h4>
            <div className="space-y-2">
              {backups.map((backup) => (
                <div key={backup.fileName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{backup.fileName}</div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(backup.size)} • {formatDate(backup.createdAt)}
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    복원
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">데이터베이스 초기화</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                이 작업은 되돌릴 수 없습니다. 다음 3단계 확인을 완료해주세요:
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1단계: 다음 문구를 정확히 입력하세요:
                </label>
                <p className="text-xs text-gray-500 mb-1">I_UNDERSTAND_THIS_WILL_DELETE_ALL_DATA</p>
                <input
                  type="text"
                  value={resetConfirmations.step1}
                  onChange={(e) => setResetConfirmations(prev => ({ ...prev, step1: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2단계: 다음 문구를 정확히 입력하세요:
                </label>
                <p className="text-xs text-gray-500 mb-1">DELETE_ALL_DATABASE_CONTENT</p>
                <input
                  type="text"
                  value={resetConfirmations.step2}
                  onChange={(e) => setResetConfirmations(prev => ({ ...prev, step2: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3단계: 다음 문구를 정확히 입력하세요:
                </label>
                <p className="text-xs text-gray-500 mb-1">FINAL_CONFIRMATION_RESET_DATABASE</p>
                <input
                  type="text"
                  value={resetConfirmations.step3}
                  onChange={(e) => setResetConfirmations(prev => ({ ...prev, step3: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmations({ step1: '', step2: '', step3: '' });
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={resetDatabase}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? '초기화 중...' : '초기화 실행'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}