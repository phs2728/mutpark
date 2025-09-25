"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import SystemAccessGuard from "@/components/admin/SystemAccessGuard";
import { useState, useEffect } from "react";
import {
  Database,
  Download,
  Upload,
  Trash2,
  Calendar,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  Archive,
  CloudDownload,
  Server,
  FileText,
  Shield,
} from "lucide-react";

interface BackupFile {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'manual';
  size: string;
  createdAt: string;
  status: 'completed' | 'in_progress' | 'failed';
  description?: string;
  checksum?: string;
}

interface BackupConfig {
  autoBackup: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number;
  compression: boolean;
  encryption: boolean;
  destination: 'local' | 's3' | 'ftp';
}

const backupTypes = {
  full: { label: '전체 백업', color: 'bg-blue-100 text-blue-800', icon: Database },
  incremental: { label: '증분 백업', color: 'bg-green-100 text-green-800', icon: Archive },
  manual: { label: '수동 백업', color: 'bg-purple-100 text-purple-800', icon: Settings },
};

const statusConfig = {
  completed: { label: '완료', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  in_progress: { label: '진행중', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: RefreshCw },
  failed: { label: '실패', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle },
};

function BackupManagementContent() {
  const { permissions } = useAdminAuth();
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    autoBackup: true,
    frequency: 'daily',
    retention: 30,
    compression: true,
    encryption: true,
    destination: 'local',
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [creating, setCreating] = useState(false);
  const [selectedBackups, setSelectedBackups] = useState<Set<string>>(new Set());

  const mockBackups: BackupFile[] = [
    {
      id: '1',
      name: 'full_backup_2025-01-23_10-30.sql.gz',
      type: 'full',
      size: '127.3 MB',
      createdAt: '2025-01-23T10:30:00Z',
      status: 'completed',
      description: '일일 자동 전체 백업',
      checksum: 'sha256:a1b2c3d4e5f6...'
    },
    {
      id: '2',
      name: 'incremental_backup_2025-01-23_06-00.sql.gz',
      type: 'incremental',
      size: '23.7 MB',
      createdAt: '2025-01-23T06:00:00Z',
      status: 'completed',
      description: '증분 백업 (전날 변경사항)',
    },
    {
      id: '3',
      name: 'manual_backup_before_update_2025-01-22.sql.gz',
      type: 'manual',
      size: '125.8 MB',
      createdAt: '2025-01-22T15:45:00Z',
      status: 'completed',
      description: '시스템 업데이트 전 수동 백업',
    },
    {
      id: '4',
      name: 'full_backup_2025-01-22_10-30.sql.gz',
      type: 'full',
      size: '124.9 MB',
      createdAt: '2025-01-22T10:30:00Z',
      status: 'completed',
      description: '일일 자동 전체 백업',
    },
    {
      id: '5',
      name: 'backup_in_progress_2025-01-23_14-15.sql.gz',
      type: 'full',
      size: '0 MB',
      createdAt: '2025-01-23T14:15:00Z',
      status: 'in_progress',
      description: '현재 진행중인 백업',
    },
  ];

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackups(mockBackups);
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (type: 'full' | 'incremental') => {
    setCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const newBackup: BackupFile = {
        id: String(Date.now()),
        name: `${type}_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql.gz`,
        type,
        size: '0 MB',
        createdAt: new Date().toISOString(),
        status: 'in_progress',
        description: `${type === 'full' ? '전체' : '증분'} 백업 생성중`,
      };
      setBackups(prev => [newBackup, ...prev]);

      // Simulate backup completion
      setTimeout(() => {
        setBackups(prev => prev.map(backup =>
          backup.id === newBackup.id
            ? { ...backup, status: 'completed' as const, size: '126.4 MB' }
            : backup
        ));
      }, 5000);
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setCreating(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('이 백업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setBackups(prev => prev.filter(backup => backup.id !== backupId));
  };

  const downloadBackup = (backup: BackupFile) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = backup.name;
    link.click();
  };

  const updateConfig = (updates: Partial<BackupConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const toggleBackupSelection = (backupId: string) => {
    const newSelected = new Set(selectedBackups);
    if (newSelected.has(backupId)) {
      newSelected.delete(backupId);
    } else {
      newSelected.add(backupId);
    }
    setSelectedBackups(newSelected);
  };

  const deleteSelectedBackups = async () => {
    if (selectedBackups.size === 0) return;

    if (!confirm(`선택된 ${selectedBackups.size}개의 백업을 삭제하시겠습니까?`)) {
      return;
    }

    setBackups(prev => prev.filter(backup => !selectedBackups.has(backup.id)));
    setSelectedBackups(new Set());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const calculateTotalSize = () => {
    return backups.reduce((total, backup) => {
      const size = parseFloat(backup.size.replace(/[^\d.]/g, ''));
      return total + (isNaN(size) ? 0 : size);
    }, 0).toFixed(1);
  };

  if (!permissions?.canManageSystem) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">백업 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">백업 관리</h1>
          <p className="mt-2 text-gray-600">
            데이터베이스 백업을 생성, 관리하고 복원합니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={() => createBackup('incremental')}
            disabled={creating}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Archive className="h-4 w-4 mr-2" />
            증분 백업
          </button>
          <button
            onClick={() => createBackup('full')}
            disabled={creating}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                전체 백업
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 mr-3">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{backups.length}</div>
              <div className="text-sm text-gray-600">총 백업</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {backups.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">완료된 백업</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 mr-3">
              <HardDrive className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{calculateTotalSize()} MB</div>
              <div className="text-sm text-gray-600">총 용량</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-orange-100 mr-3">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {backups.length > 0 ? Math.ceil((Date.now() - new Date(backups[0].createdAt).getTime()) / (1000 * 60 * 60)) : 0}h
              </div>
              <div className="text-sm text-gray-600">마지막 백업</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            백업 목록
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            자동 백업 설정
          </button>
        </nav>
      </div>

      {activeTab === 'list' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">백업 파일</h3>
              <div className="flex items-center space-x-3">
                {selectedBackups.size > 0 && (
                  <button
                    onClick={deleteSelectedBackups}
                    className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    선택 삭제 ({selectedBackups.size})
                  </button>
                )}
                <button
                  onClick={fetchBackups}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  새로고침
                </button>
              </div>
            </div>
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
          ) : backups.length === 0 ? (
            <div className="p-6 text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">백업이 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 백업을 생성해보세요.</p>
              <button
                onClick={() => createBackup('full')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Database className="h-4 w-4 mr-2" />
                백업 생성
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {backups.map((backup) => {
                  const typeConfig = backupTypes[backup.type];
                  const statusInfo = statusConfig[backup.status];
                  const TypeIcon = typeConfig.icon;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={backup.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedBackups.has(backup.id)}
                            onChange={() => toggleBackupSelection(backup.id)}
                            className="rounded"
                          />
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-gray-100">
                              <TypeIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900">{backup.name}</h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>
                                  {typeConfig.label}
                                </span>
                                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusInfo.label}
                                </div>
                              </div>
                              {backup.description && (
                                <p className="text-sm text-gray-600">{backup.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <div className="flex items-center">
                                  <HardDrive className="h-3 w-3 mr-1" />
                                  {backup.size}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDate(backup.createdAt)}
                                </div>
                                {backup.checksum && (
                                  <div className="flex items-center">
                                    <Shield className="h-3 w-3 mr-1" />
                                    체크섬 확인됨
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {backup.status === 'completed' && (
                            <>
                              <button
                                onClick={() => downloadBackup(backup)}
                                className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                다운로드
                              </button>
                              <button
                                onClick={() => deleteBackup(backup.id)}
                                className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                삭제
                              </button>
                            </>
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
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">자동 백업 설정</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">자동 백업 활성화</h4>
                <p className="text-sm text-gray-600">설정된 주기에 따라 자동으로 백업을 생성합니다.</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.autoBackup}
                  onChange={(e) => updateConfig({ autoBackup: e.target.checked })}
                  className="rounded"
                />
                <span className="ml-2 text-sm text-gray-600">활성화</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  백업 주기
                </label>
                <select
                  value={config.frequency}
                  onChange={(e) => updateConfig({ frequency: e.target.value as any })}
                  disabled={!config.autoBackup}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보관 기간 (일)
                </label>
                <input
                  type="number"
                  value={config.retention}
                  onChange={(e) => updateConfig({ retention: parseInt(e.target.value) })}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  이 기간이 지난 백업은 자동으로 삭제됩니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">압축</h4>
                  <p className="text-sm text-gray-600">백업 파일을 압축하여 저장 공간을 절약합니다.</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.compression}
                    onChange={(e) => updateConfig({ compression: e.target.checked })}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">활성화</span>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">암호화</h4>
                  <p className="text-sm text-gray-600">백업 파일을 암호화하여 보안을 강화합니다.</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.encryption}
                    onChange={(e) => updateConfig({ encryption: e.target.checked })}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">활성화</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                저장 위치
              </label>
              <select
                value={config.destination}
                onChange={(e) => updateConfig({ destination: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="local">로컬 서버</option>
                <option value="s3">Amazon S3</option>
                <option value="ftp">FTP 서버</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                설정 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBackups() {
  return (
    <SystemAccessGuard>
      <BackupManagementContent />
    </SystemAccessGuard>
  );
}