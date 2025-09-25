"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "OPERATOR";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  lastLoginAt?: string;
  createdAt: string;
  permissions?: string[];
}

const ROLE_CONFIG = {
  SUPER_ADMIN: { label: "최고 관리자", color: "bg-purple-100 text-purple-800" },
  ADMIN: { label: "일반 관리자", color: "bg-blue-100 text-blue-800" },
  MODERATOR: { label: "커뮤니티 관리자", color: "bg-green-100 text-green-800" },
  OPERATOR: { label: "운영자", color: "bg-yellow-100 text-yellow-800" },
};

const STATUS_CONFIG = {
  ACTIVE: { label: "활성", color: "bg-green-100 text-green-800", icon: CheckCircle },
  INACTIVE: { label: "비활성", color: "bg-gray-100 text-gray-800", icon: Clock },
  SUSPENDED: { label: "정지", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function AdminUsers() {
  const { permissions, user } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'OPERATOR' as AdminUser['role'],
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        // API 응답 형태를 컴포넌트 형태에 맞게 변환
        const transformedUsers = data.users.map((apiUser: any) => ({
          ...apiUser,
          status: apiUser.isActive ? 'ACTIVE' : 'INACTIVE'
        }));
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error('Failed to load admin users:', error);
    }
    setLoading(false);
  };

  const createAdminUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!newUser.email || !newUser.name || !newUser.password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          password: newUser.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('관리자 계정이 생성되었습니다.');
        setShowCreateModal(false);
        setNewUser({
          email: '',
          name: '',
          role: 'OPERATOR',
          password: '',
          confirmPassword: ''
        });
        loadAdminUsers();
      } else {
        alert('계정 생성에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      alert('계정 생성 중 오류가 발생했습니다.');
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: currentStatus !== 'ACTIVE'
        }),
      });

      const data = await response.json();

      if (data.success) {
        loadAdminUsers();
      } else {
        alert('상태 변경에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('정말로 이 관리자 계정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('관리자 계정이 삭제되었습니다.');
        loadAdminUsers();
      } else {
        alert('계정 삭제에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      alert('계정 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "ALL" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (!permissions?.canManageUsers) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">관리자 계정 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 계정 관리</h1>
          <p className="mt-2 text-gray-600">
            시스템 관리자 계정을 생성하고 권한을 관리합니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            새 관리자 추가
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="이름 또는 이메일로 검색..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              역할별 필터
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">전체 역할</option>
              <option value="SUPER_ADMIN">최고 관리자</option>
              <option value="ADMIN">일반 관리자</option>
              <option value="MODERATOR">커뮤니티 관리자</option>
              <option value="OPERATOR">운영자</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">관리자 목록을 불러오는 중...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">관리자를 찾을 수 없습니다</h3>
            <p className="text-gray-500">검색 조건을 변경하거나 새 관리자를 추가하세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리자 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최근 로그인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((adminUser) => {
                  const StatusIcon = STATUS_CONFIG[adminUser.status].icon;
                  return (
                    <tr key={adminUser.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {adminUser.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {adminUser.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {adminUser.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_CONFIG[adminUser.role].color}`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {ROLE_CONFIG[adminUser.role].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[adminUser.status].color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {STATUS_CONFIG[adminUser.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {adminUser.lastLoginAt ? (
                          <div>
                            <div>{formatDate(adminUser.lastLoginAt)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">로그인 기록 없음</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="상세 보기"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="편집"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {adminUser.id !== user?.id && adminUser.role !== "SUPER_ADMIN" && (
                            <button
                              onClick={() => deleteUser(adminUser.id)}
                              className="text-red-600 hover:text-red-900"
                              title="삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => toggleUserStatus(adminUser.id, adminUser.status)}
                            className="text-gray-600 hover:text-gray-900"
                            title={adminUser.status === "ACTIVE" ? "비활성화" : "활성화"}
                          >
                            {adminUser.status === "ACTIVE" ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">역할별 권한</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium text-purple-900">최고 관리자</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 모든 기능 접근</li>
              <li>• 관리자 계정 관리</li>
              <li>• 시스템 설정 변경</li>
              <li>• 감사 로그 조회</li>
            </ul>
          </div>

          <div className="border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">일반 관리자</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 주문, 상품 관리</li>
              <li>• 고객 관리</li>
              <li>• 콘텐츠 관리</li>
              <li>• 리포트 조회</li>
            </ul>
          </div>

          <div className="border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-900">커뮤니티 관리자</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 게시물 관리</li>
              <li>• 리뷰 승인/거부</li>
              <li>• 신고 처리</li>
              <li>• 사용자 제재</li>
            </ul>
          </div>

          <div className="border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-900">운영자</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 주문 상태 변경</li>
              <li>• 재고 관리</li>
              <li>• 배송 처리</li>
              <li>• 고객 문의 응답</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 관리자 추가</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="관리자 이름"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@mutpark.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  역할
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as AdminUser['role'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="OPERATOR">운영자</option>
                  <option value="MODERATOR">커뮤니티 관리자</option>
                  <option value="ADMIN">일반 관리자</option>
                  {user?.role === 'SUPER_ADMIN' && (
                    <option value="SUPER_ADMIN">최고 관리자</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8자 이상"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="비밀번호 재입력"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={createAdminUser}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}