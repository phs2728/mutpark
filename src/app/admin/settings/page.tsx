"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import DatabaseManagement from "@/components/admin/DatabaseManagement";
import { useState } from "react";
import {
  Settings,
  Building2,
  CreditCard,
  Mail,
  Bell,
  Globe,
  Database,
  Key,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  Shield,
  Truck,
} from "lucide-react";

export default function AdminSettings() {
  const { permissions } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const settingsTabs = [
    { id: "general", label: "일반 설정", icon: Building2 },
    { id: "payment", label: "결제 설정", icon: CreditCard },
    { id: "email", label: "이메일 설정", icon: Mail },
    { id: "notifications", label: "알림 설정", icon: Bell },
    { id: "localization", label: "다국어 설정", icon: Globe },
    { id: "api", label: "API 연동", icon: Key },
    { id: "database", label: "데이터베이스", icon: Database },
    { id: "security", label: "보안 설정", icon: Shield },
  ];

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implement save functionality
    setTimeout(() => setSaving(false), 1000);
  };

  if (!permissions?.canManageSystem) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">시스템 설정 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시스템 설정</h1>
          <p className="mt-2 text-gray-600">
            MutPark 이커머스 플랫폼의 전반적인 설정을 관리합니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                설정 저장
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200">
            {activeTab === "general" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">일반 설정</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        회사명
                      </label>
                      <input
                        type="text"
                        defaultValue="MutPark"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        연락처
                      </label>
                      <input
                        type="tel"
                        defaultValue="+90 212 555 0123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      회사 주소
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="İstanbul, Türkiye"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      사업자 등록번호 (VKN)
                    </label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">결제 설정</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Iyzico 설정</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secret Key
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded" />
                        <span className="ml-2 text-sm text-gray-600">테스트 모드</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">수수료 설정</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          신용카드 수수료 (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue="2.9"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          할부 수수료 (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue="3.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          최소 결제 금액 (TRY)
                        </label>
                        <input
                          type="number"
                          defaultValue="10"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">이메일 설정</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">SMTP 서버 설정</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP 서버
                        </label>
                        <input
                          type="text"
                          defaultValue="smtp.gmail.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          포트
                        </label>
                        <input
                          type="number"
                          defaultValue="587"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          사용자명
                        </label>
                        <input
                          type="email"
                          placeholder="noreply@mutpark.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          비밀번호
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="ml-2 text-sm text-gray-600">SSL/TLS 사용</span>
                      </label>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                        연결 테스트
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">발신자 정보</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          발신자 이름
                        </label>
                        <input
                          type="text"
                          defaultValue="MutPark"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          발신자 이메일
                        </label>
                        <input
                          type="email"
                          defaultValue="noreply@mutpark.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">이메일 템플릿</h4>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-900">주문 확인 이메일</h5>
                          <button className="text-sm text-blue-600 hover:text-blue-700">편집</button>
                        </div>
                        <p className="text-sm text-gray-600">고객이 주문을 완료했을 때 발송되는 이메일</p>
                        <div className="mt-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-900">배송 시작 알림</h5>
                          <button className="text-sm text-blue-600 hover:text-blue-700">편집</button>
                        </div>
                        <p className="text-sm text-gray-600">상품이 배송 시작되었을 때 발송되는 이메일</p>
                        <div className="mt-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-900">비밀번호 재설정</h5>
                          <button className="text-sm text-blue-600 hover:text-blue-700">편집</button>
                        </div>
                        <p className="text-sm text-gray-600">사용자가 비밀번호 재설정을 요청했을 때 발송되는 이메일</p>
                        <div className="mt-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-900">마케팅 뉴스레터</h5>
                          <button className="text-sm text-blue-600 hover:text-blue-700">편집</button>
                        </div>
                        <p className="text-sm text-gray-600">정기적으로 발송되는 마케팅 이메일</p>
                        <div className="mt-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">알림 설정</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">관리자 알림</h4>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">새 주문 알림</h5>
                            <p className="text-sm text-gray-600">새로운 주문이 접수되었을 때 알림을 받습니다</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="ml-2 text-sm text-gray-600">이메일</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="ml-2 text-sm text-gray-600">SMS</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" />
                              <span className="ml-2 text-sm text-gray-600">푸시</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">재고 부족 알림</h5>
                            <p className="text-sm text-gray-600">상품 재고가 설정된 임계값 이하로 떨어질 때 알림을 받습니다</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="ml-2 text-sm text-gray-600">이메일</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" />
                              <span className="ml-2 text-sm text-gray-600">SMS</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" />
                              <span className="ml-2 text-sm text-gray-600">푸시</span>
                            </label>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            재고 임계값
                          </label>
                          <input
                            type="number"
                            defaultValue="10"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">결제 실패 알림</h5>
                            <p className="text-sm text-gray-600">결제 처리 중 오류가 발생했을 때 알림을 받습니다</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="ml-2 text-sm text-gray-600">이메일</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="ml-2 text-sm text-gray-600">SMS</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="ml-2 text-sm text-gray-600">푸시</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">신규 회원가입 알림</h5>
                            <p className="text-sm text-gray-600">새로운 고객이 회원가입했을 때 알림을 받습니다</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" />
                              <span className="ml-2 text-sm text-gray-600">이메일</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" />
                              <span className="ml-2 text-sm text-gray-600">SMS</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" />
                              <span className="ml-2 text-sm text-gray-600">푸시</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">고객 알림</h4>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">주문 상태 변경 알림</h5>
                            <p className="text-sm text-gray-600">고객의 주문 상태가 변경될 때 자동으로 알림을 발송합니다</p>
                          </div>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">프로모션 알림</h5>
                            <p className="text-sm text-gray-600">새로운 할인이나 이벤트 정보를 고객에게 발송합니다</p>
                          </div>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">장바구니 방치 알림</h5>
                            <p className="text-sm text-gray-600">장바구니에 상품을 추가한 후 일정 시간이 지나면 알림을 발송합니다</p>
                          </div>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            알림 발송 시간 (시간 후)
                          </label>
                          <select className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue="24">
                            <option value="1">1시간</option>
                            <option value="3">3시간</option>
                            <option value="6">6시간</option>
                            <option value="24">24시간</option>
                            <option value="72">72시간</option>
                          </select>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">재입고 알림</h5>
                            <p className="text-sm text-gray-600">품절된 상품의 재입고 시 관심 표현한 고객에게 알림을 발송합니다</p>
                          </div>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">알림 전송 설정</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMS 제공업체
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue="turkcell">
                          <option value="turkcell">Turkcell</option>
                          <option value="vodafone">Vodafone</option>
                          <option value="turk-telekom">Türk Telekom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          푸시 알림 서비스
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue="firebase">
                          <option value="firebase">Firebase Cloud Messaging</option>
                          <option value="onesignal">OneSignal</option>
                          <option value="pusher">Pusher</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "localization" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">다국어 설정</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">지원 언어 관리</h4>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">한국어 (기본)</h5>
                            <p className="text-sm text-gray-600">ko-KR • 기본 언어</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">활성화</span>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">기본</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          번역 완료도: <span className="font-medium">100%</span> (2,847/2,847 문구)
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">터키어</h5>
                            <p className="text-sm text-gray-600">tr-TR • 현지 주요 언어</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                              편집
                            </button>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="ml-2 text-sm text-gray-600">활성화</span>
                            </label>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          번역 완료도: <span className="font-medium">95%</span> (2,706/2,847 문구)
                          <button className="ml-2 text-xs text-blue-600 hover:text-blue-700">누락된 번역 보기</button>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">영어</h5>
                            <p className="text-sm text-gray-600">en-US • 글로벌 언어</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                              편집
                            </button>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="ml-2 text-sm text-gray-600">활성화</span>
                            </label>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          번역 완료도: <span className="font-medium">88%</span> (2,506/2,847 문구)
                          <button className="ml-2 text-xs text-blue-600 hover:text-blue-700">누락된 번역 보기</button>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">아랍어</h5>
                            <p className="text-sm text-gray-600">ar-SA • RTL 언어</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                              편집
                            </button>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" />
                              <span className="ml-2 text-sm text-gray-600">활성화</span>
                            </label>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          번역 완료도: <span className="font-medium">65%</span> (1,851/2,847 문구)
                          <button className="ml-2 text-xs text-blue-600 hover:text-blue-700">누락된 번역 보기</button>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">러시아어</h5>
                            <p className="text-sm text-gray-600">ru-RU • 키릴 문자</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                              편집
                            </button>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded" />
                              <span className="ml-2 text-sm text-gray-600">활성화</span>
                            </label>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          번역 완료도: <span className="font-medium">45%</span> (1,281/2,847 문구)
                          <button className="ml-2 text-xs text-blue-600 hover:text-blue-700">누락된 번역 보기</button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                        + 새 언어 추가
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">자동 번역 설정</h4>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Google Translate API</h5>
                          <p className="text-sm text-gray-600">자동 번역을 위한 Google Translate API 연동</p>
                        </div>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="ml-2 text-sm text-gray-600">활성화</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            API 키
                          </label>
                          <input
                            type="password"
                            placeholder="Google Translate API 키"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            월 사용량 제한
                          </label>
                          <input
                            type="number"
                            defaultValue="100000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">지역별 설정</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            기본 통화
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue="TRY">
                            <option value="TRY">터키 리라 (TRY)</option>
                            <option value="USD">미국 달러 (USD)</option>
                            <option value="EUR">유로 (EUR)</option>
                            <option value="KRW">한국 원 (KRW)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            기본 시간대
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue="Europe/Istanbul">
                            <option value="Europe/Istanbul">이스탄불 (UTC+3)</option>
                            <option value="Asia/Seoul">서울 (UTC+9)</option>
                            <option value="UTC">UTC (UTC+0)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            날짜 형식
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue="DD/MM/YYYY">
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">번역 도구</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Download className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-900">번역 파일 내보내기</span>
                        <span className="text-xs text-gray-500">JSON/CSV 형식</span>
                      </button>
                      <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-900">번역 파일 가져오기</span>
                        <span className="text-xs text-gray-500">번역 업데이트</span>
                      </button>
                      <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Globe className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-900">번역 키 동기화</span>
                        <span className="text-xs text-gray-500">새 키 검색</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "api" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">API 연동</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">외부 서비스 연동</h4>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <img src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=32&q=80" alt="Iyzico" className="w-8 h-8 rounded mr-3" />
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Iyzico 결제</h5>
                              <p className="text-sm text-gray-600">터키 현지 결제 서비스</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">연결됨</span>
                            <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                              설정
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          마지막 동기화: 2분 전 • 상태: 정상
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                              <Truck className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">배송 업체 API</h5>
                              <p className="text-sm text-gray-600">PTT Kargo, MNG Kargo, Yurtiçi Kargo</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">연결됨</span>
                            <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                              설정
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          마지막 동기화: 5분 전 • 상태: 정상 (4개 업체 연결)
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center mr-3">
                              <Mail className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">이메일 서비스</h5>
                              <p className="text-sm text-gray-600">SendGrid, Amazon SES</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">제한적</span>
                            <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                              설정
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          마지막 동기화: 1시간 전 • 상태: 일일 한도 80% 사용
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
                              <Bell className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">푸시 알림</h5>
                              <p className="text-sm text-gray-600">Firebase Cloud Messaging</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">연결 안됨</span>
                            <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                              연결
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          마지막 시도: 1일 전 • 상태: 인증 오류
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">API 키 관리</h4>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Admin API 키</h5>
                            <p className="text-sm text-gray-600">관리자 API 접근용 마스터 키</p>
                          </div>
                          <button className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100">
                            재생성
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                            mp_admin_••••••••••••••••••••••••••••••••
                          </code>
                          <button className="text-sm text-blue-600 hover:text-blue-700">복사</button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          생성일: 2025-01-15 • 마지막 사용: 2시간 전
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Public API 키</h5>
                            <p className="text-sm text-gray-600">프론트엔드 클라이언트용 공개 키</p>
                          </div>
                          <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                            재생성
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                            mp_public_pk_••••••••••••••••••••••••••••
                          </code>
                          <button className="text-sm text-blue-600 hover:text-blue-700">복사</button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          생성일: 2025-01-10 • 마지막 사용: 실시간
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">웹훅 설정</h4>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">결제 완료 웹훅</h5>
                            <p className="text-sm text-gray-600">결제가 성공적으로 완료되었을 때 호출</p>
                          </div>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL
                            </label>
                            <input
                              type="url"
                              defaultValue="https://mutpark.com/api/webhooks/payment-completed"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              시크릿 키
                            </label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          마지막 호출: 3분 전 • 상태: 성공 (200)
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">주문 상태 변경 웹훅</h5>
                            <p className="text-sm text-gray-600">주문 상태가 변경되었을 때 호출</p>
                          </div>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL
                            </label>
                            <input
                              type="url"
                              defaultValue="https://mutpark.com/api/webhooks/order-status-changed"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              시크릿 키
                            </label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          마지막 호출: 15분 전 • 상태: 성공 (200)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">API 사용량 모니터링</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">오늘</h5>
                        <div className="text-2xl font-bold text-blue-600">1,247</div>
                        <div className="text-sm text-gray-600">API 호출</div>
                        <div className="text-xs text-green-600 mt-1">+12% vs 어제</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">이번 달</h5>
                        <div className="text-2xl font-bold text-purple-600">38,492</div>
                        <div className="text-sm text-gray-600">API 호출</div>
                        <div className="text-xs text-gray-500 mt-1">한도의 76%</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">오류율</h5>
                        <div className="text-2xl font-bold text-red-600">0.3%</div>
                        <div className="text-sm text-gray-600">실패한 요청</div>
                        <div className="text-xs text-green-600 mt-1">-0.1% vs 지난 주</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">보안 설정</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">인증 설정</h4>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">이중 인증 (2FA)</h5>
                            <p className="text-sm text-gray-600">관리자 계정에 대한 추가 보안 층</p>
                          </div>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">필수</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              2FA 방식
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue="totp">
                              <option value="totp">TOTP (Google Authenticator)</option>
                              <option value="sms">SMS</option>
                              <option value="email">이메일</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              백업 코드 수
                            </label>
                            <input
                              type="number"
                              defaultValue="10"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">세션 관리</h5>
                            <p className="text-sm text-gray-600">사용자 세션 보안 설정</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              세션 만료 시간 (분)
                            </label>
                            <input
                              type="number"
                              defaultValue="30"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              최대 동시 세션
                            </label>
                            <input
                              type="number"
                              defaultValue="3"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Remember Me 기간 (일)
                            </label>
                            <input
                              type="number"
                              defaultValue="30"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center space-x-4">
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">동일 IP에서만 세션 유지</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">비활성 상태에서 자동 로그아웃</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">접근 제한</h4>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">IP 화이트리스트</h5>
                            <p className="text-sm text-gray-600">특정 IP에서만 관리자 접근 허용</p>
                          </div>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            허용된 IP 주소
                          </label>
                          <textarea
                            rows={3}
                            placeholder="192.168.1.100&#10;203.0.113.0/24&#10;10.0.0.1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            한 줄에 하나씩 입력. CIDR 표기법 지원 (예: 192.168.1.0/24)
                          </p>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">브루트 포스 방지</h5>
                            <p className="text-sm text-gray-600">반복 로그인 시도 차단</p>
                          </div>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              최대 시도 횟수
                            </label>
                            <input
                              type="number"
                              defaultValue="5"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              차단 시간 (분)
                            </label>
                            <input
                              type="number"
                              defaultValue="15"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              관찰 기간 (분)
                            </label>
                            <input
                              type="number"
                              defaultValue="5"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">암호화 및 보안 헤더</h4>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">HTTPS 강제</h5>
                            <p className="text-sm text-gray-600">모든 HTTP 요청을 HTTPS로 리다이렉트</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">활성화됨</span>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">보안 헤더</h5>
                            <p className="text-sm text-gray-600">HSTS, CSP, X-Frame-Options 등</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">활성화됨</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          활성화된 헤더: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">데이터 암호화</h5>
                            <p className="text-sm text-gray-600">민감한 데이터의 저장 시 암호화</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              암호화 알고리즘
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue="aes-256-gcm">
                              <option value="aes-256-gcm">AES-256-GCM</option>
                              <option value="aes-256-cbc">AES-256-CBC</option>
                              <option value="chacha20">ChaCha20-Poly1305</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              키 순환 주기 (일)
                            </label>
                            <input
                              type="number"
                              defaultValue="90"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">감사 로그</h4>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">관리자 활동 로깅</h5>
                          <p className="text-sm text-gray-600">모든 관리자 활동을 기록하고 추적</p>
                        </div>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="ml-2 text-sm text-gray-600">활성화</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            로그 보관 기간 (일)
                          </label>
                          <input
                            type="number"
                            defaultValue="365"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            로그 레벨
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" defaultValue="info">
                            <option value="info">INFO (모든 활동)</option>
                            <option value="warn">WARN (경고 이상)</option>
                            <option value="error">ERROR (오류만)</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        현재 저장된 로그: 2,847개 • 디스크 사용량: 12.3MB
                        <button className="ml-2 text-blue-600 hover:text-blue-700">로그 보기</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "database" && <DatabaseManagement />}

          </div>
        </div>
      </div>
    </div>
  );
}