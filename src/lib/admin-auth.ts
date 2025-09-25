import jwt from "jsonwebtoken";

export interface AdminUser {
  userId: number;
  email: string;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN" | "MODERATOR" | "OPERATOR";
}

/**
 * 관리자 토큰 생성
 */
export function generateAdminToken(user: { id: number; email: string; name: string; role: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      type: "admin"
    },
    process.env.JWT_SECRET!,
    { expiresIn: "24h" }
  );
}

export interface AdminPermissions {
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageContent: boolean;
  canManageSystem: boolean;
  canManageCommunity: boolean;
  canViewAnalytics: boolean;
  canManageEvents: boolean;
  canManageFinance: boolean;
  canManageShipping: boolean;
}

/**
 * 관리자 토큰 검증 (서버 전용)
 */
export async function verifyAdminToken(token: string): Promise<AdminUser | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // 관리자 권한 확인
    if (!["ADMIN", "SUPER_ADMIN", "MODERATOR", "OPERATOR"].includes(decoded.role)) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role as AdminUser["role"],
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * 현재 로그인한 관리자 정보 가져오기 (서버 컴포넌트용)
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    // 이 함수는 서버 컴포넌트에서만 사용되어야 함
    // API 라우트에서는 쿠키를 직접 읽어서 처리
    return null;
  } catch (error) {
    console.error("Get admin user error:", error);
    return null;
  }
}

/**
 * 관리자 권한별 접근 권한 계산
 */
export function getAdminPermissions(role: AdminUser["role"]): AdminPermissions {
  switch (role) {
    case "SUPER_ADMIN":
      return {
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageContent: true,
        canManageSystem: true,
        canManageCommunity: true,
        canViewAnalytics: true,
        canManageEvents: true,
        canManageFinance: true,
        canManageShipping: true,
      };
    case "ADMIN":
      return {
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageContent: true,
        canManageSystem: true,
        canManageCommunity: true,
        canViewAnalytics: true,
        canManageEvents: true,
        canManageFinance: true,
        canManageShipping: true,
      };
    case "MODERATOR":
      return {
        canManageUsers: false,
        canManageProducts: false,
        canManageOrders: false,
        canManageContent: true,
        canManageSystem: false,
        canManageCommunity: true,
        canViewAnalytics: false,
        canManageEvents: false,
        canManageFinance: false,
        canManageShipping: false,
      };
    case "OPERATOR":
      return {
        canManageUsers: false,
        canManageProducts: false,
        canManageOrders: true,
        canManageContent: false,
        canManageSystem: false,
        canManageCommunity: false,
        canViewAnalytics: false,
        canManageEvents: false,
        canManageFinance: false,
        canManageShipping: true,
      };
    default:
      return {
        canManageUsers: false,
        canManageProducts: false,
        canManageOrders: false,
        canManageContent: false,
        canManageSystem: false,
        canManageCommunity: false,
        canViewAnalytics: false,
        canManageEvents: false,
        canManageFinance: false,
        canManageShipping: false,
      };
  }
}

/**
 * API 라우트에서 관리자 인증 검증
 */
export async function verifyAdminAuth(request: Request): Promise<{
  isValid: boolean;
  user?: AdminUser;
  permissions?: AdminPermissions;
}> {
  try {
    // 쿠키에서 토큰 추출
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return { isValid: false };
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    const token = cookies['admin-token'] || cookies['auth-token'];
    if (!token) {
      return { isValid: false };
    }

    const user = await verifyAdminToken(token);
    if (!user) {
      return { isValid: false };
    }

    const permissions = getAdminPermissions(user.role);

    return {
      isValid: true,
      user,
      permissions
    };
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return { isValid: false };
  }
}

/**
 * 관리자 권한 검사 미들웨어
 */
export async function requireAdminAuth(
  requiredPermission?: keyof AdminPermissions
): Promise<{ user: AdminUser; permissions: AdminPermissions } | null> {
  const user = await getAdminUser();

  if (!user) {
    return null;
  }

  const permissions = getAdminPermissions(user.role);

  if (requiredPermission && !permissions[requiredPermission]) {
    return null;
  }

  return { user, permissions };
}

/**
 * 관리자 인증 데코레이터 (API 라우트용)
 */
export function withAdminAuth(
  handler: (
    request: Request,
    context: any,
    adminUser: AdminUser,
    permissions: AdminPermissions
  ) => Promise<Response>,
  requiredPermission?: keyof AdminPermissions
) {
  return async (request: Request, context: any) => {
    const auth = await requireAdminAuth(requiredPermission);

    if (!auth) {
      return new Response(
        JSON.stringify({ error: "관리자 권한이 필요합니다." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    return handler(request, context, auth.user, auth.permissions);
  };
}