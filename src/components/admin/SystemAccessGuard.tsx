'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SystemAccessGuardProps {
  children: React.ReactNode;
  onAccessGranted?: () => void;
  onAccessDenied?: () => void;
}

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

function VerificationModal({ isOpen, onClose, onVerify, loading, error }: VerificationModalProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      await onVerify(password);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            시스템 관리 접근 인증
          </h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          시스템 관리 섹션은 민감한 정보를 포함하고 있습니다.
          계속하려면 비밀번호를 다시 입력해주세요.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="현재 비밀번호를 입력하세요"
              disabled={loading}
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  확인 중...
                </div>
              ) : '확인'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-xs text-yellow-700">
              이 인증은 5분간 유효합니다. 보안을 위해 정기적으로 재인증이 필요합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SystemAccessGuard({
  children,
  onAccessGranted,
  onAccessDenied
}: SystemAccessGuardProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expirationTime, setExpirationTime] = useState<number | null>(null);
  const router = useRouter();

  const checkSystemAccess = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth/verify-password', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.isVerified) {
        setIsVerified(true);
        setShowModal(false);
        onAccessGranted?.();

        // 만료 시간 설정
        if (data.expiresIn) {
          setExpirationTime(Date.now() + data.expiresIn);
        }
      } else {
        setIsVerified(false);
        setShowModal(true);
        onAccessDenied?.();
      }
    } catch (error) {
      console.error('System access check failed:', error);
      setIsVerified(false);
      setShowModal(true);
      onAccessDenied?.();
    }
  }, [onAccessGranted, onAccessDenied]);

  const verifyPassword = async (password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        setShowModal(false);
        setError(null);
        onAccessGranted?.();

        // 5분 후 만료 시간 설정
        setExpirationTime(Date.now() + 300000); // 5분
      } else {
        setError(data.error || '비밀번호 확인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Password verification failed:', error);
      setError('서버 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setError(null);
    // 뒤로 가기
    router.back();
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkSystemAccess();
  }, [checkSystemAccess]);

  // 만료 시간 모니터링
  useEffect(() => {
    if (!expirationTime || !isVerified) return;

    const checkExpiration = () => {
      if (Date.now() >= expirationTime) {
        setIsVerified(false);
        setShowModal(true);
        setExpirationTime(null);
        onAccessDenied?.();
      }
    };

    const interval = setInterval(checkExpiration, 10000); // 10초마다 확인

    return () => clearInterval(interval);
  }, [expirationTime, isVerified, onAccessDenied]);

  // 로딩 상태
  if (isVerified === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">시스템 접근 권한을 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isVerified ? children : null}
      <VerificationModal
        isOpen={showModal}
        onClose={handleModalClose}
        onVerify={verifyPassword}
        loading={loading}
        error={error}
      />
    </>
  );
}