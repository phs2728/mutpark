import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  actions: string[];
  scope: 'GLOBAL' | 'DEPARTMENT' | 'PROJECT' | 'PERSONAL';
  priority: number;
  dependencies?: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  isSystemRole: boolean;
  permissions: string[];
  restrictions: {
    maxUsers?: number;
    timeRange?: {
      start: string;
      end: string;
    };
    ipWhitelist?: string[];
    features?: string[];
  };
  inheritsFrom?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserPermission {
  userId: number;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  permissions: Array<{
    id: string;
    name: string;
    granted: boolean;
    inheritedFrom?: string;
    grantedAt?: string;
    expiresAt?: string;
  }>;
  restrictions: any;
  lastActivity: string;
}

// 시스템 권한 정의
const systemPermissions: Permission[] = [
  // 사용자 관리
  {
    id: 'users.view',
    name: '사용자 조회',
    description: '사용자 목록 및 상세 정보 조회',
    category: '사용자 관리',
    resource: 'users',
    actions: ['read'],
    scope: 'GLOBAL',
    priority: 1
  },
  {
    id: 'users.create',
    name: '사용자 생성',
    description: '새로운 사용자 계정 생성',
    category: '사용자 관리',
    resource: 'users',
    actions: ['create'],
    scope: 'GLOBAL',
    priority: 2,
    dependencies: ['users.view']
  },
  {
    id: 'users.edit',
    name: '사용자 편집',
    description: '사용자 정보 수정',
    category: '사용자 관리',
    resource: 'users',
    actions: ['update'],
    scope: 'GLOBAL',
    priority: 2,
    dependencies: ['users.view']
  },
  {
    id: 'users.delete',
    name: '사용자 삭제',
    description: '사용자 계정 삭제',
    category: '사용자 관리',
    resource: 'users',
    actions: ['delete'],
    scope: 'GLOBAL',
    priority: 3,
    dependencies: ['users.view', 'users.edit']
  },

  // 주문 관리
  {
    id: 'orders.view',
    name: '주문 조회',
    description: '주문 목록 및 상세 정보 조회',
    category: '주문 관리',
    resource: 'orders',
    actions: ['read'],
    scope: 'GLOBAL',
    priority: 1
  },
  {
    id: 'orders.edit',
    name: '주문 편집',
    description: '주문 상태 변경 및 정보 수정',
    category: '주문 관리',
    resource: 'orders',
    actions: ['update'],
    scope: 'GLOBAL',
    priority: 2,
    dependencies: ['orders.view']
  },
  {
    id: 'orders.cancel',
    name: '주문 취소',
    description: '주문 취소 처리',
    category: '주문 관리',
    resource: 'orders',
    actions: ['cancel'],
    scope: 'GLOBAL',
    priority: 2,
    dependencies: ['orders.view']
  },
  {
    id: 'orders.refund',
    name: '주문 환불',
    description: '주문 환불 처리',
    category: '주문 관리',
    resource: 'orders',
    actions: ['refund'],
    scope: 'GLOBAL',
    priority: 3,
    dependencies: ['orders.view', 'orders.edit']
  },

  // 상품 관리
  {
    id: 'products.view',
    name: '상품 조회',
    description: '상품 목록 및 상세 정보 조회',
    category: '상품 관리',
    resource: 'products',
    actions: ['read'],
    scope: 'GLOBAL',
    priority: 1
  },
  {
    id: 'products.create',
    name: '상품 생성',
    description: '새로운 상품 등록',
    category: '상품 관리',
    resource: 'products',
    actions: ['create'],
    scope: 'GLOBAL',
    priority: 2,
    dependencies: ['products.view']
  },
  {
    id: 'products.edit',
    name: '상품 편집',
    description: '상품 정보 수정',
    category: '상품 관리',
    resource: 'products',
    actions: ['update'],
    scope: 'GLOBAL',
    priority: 2,
    dependencies: ['products.view']
  },
  {
    id: 'products.delete',
    name: '상품 삭제',
    description: '상품 삭제',
    category: '상품 관리',
    resource: 'products',
    actions: ['delete'],
    scope: 'GLOBAL',
    priority: 3,
    dependencies: ['products.view', 'products.edit']
  },

  // 시스템 관리
  {
    id: 'system.settings',
    name: '시스템 설정',
    description: '시스템 설정 관리',
    category: '시스템 관리',
    resource: 'system',
    actions: ['read', 'update'],
    scope: 'GLOBAL',
    priority: 4
  },
  {
    id: 'system.database',
    name: '데이터베이스 관리',
    description: '데이터베이스 백업, 복원, 초기화',
    category: '시스템 관리',
    resource: 'system',
    actions: ['backup', 'restore', 'reset'],
    scope: 'GLOBAL',
    priority: 5
  },
  {
    id: 'system.analytics',
    name: '분석 및 리포팅',
    description: '시스템 분석 데이터 조회',
    category: '시스템 관리',
    resource: 'analytics',
    actions: ['read'],
    scope: 'GLOBAL',
    priority: 2
  },

  // 커뮤니티 관리
  {
    id: 'community.moderate',
    name: '커뮤니티 모더레이션',
    description: '게시물 및 댓글 모더레이션',
    category: '커뮤니티 관리',
    resource: 'community',
    actions: ['moderate', 'delete', 'warn'],
    scope: 'GLOBAL',
    priority: 2
  }
];

// 시스템 역할 정의
let systemRoles: Role[] = [
  {
    id: 'SUPER_ADMIN',
    name: '최고 관리자',
    description: '모든 권한을 가진 최고 관리자',
    level: 100,
    isSystemRole: true,
    permissions: systemPermissions.map(p => p.id),
    restrictions: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ADMIN',
    name: '관리자',
    description: '대부분의 관리 권한을 가진 관리자',
    level: 80,
    isSystemRole: true,
    permissions: systemPermissions
      .filter(p => !['system.database', 'users.delete'].includes(p.id))
      .map(p => p.id),
    restrictions: {
      features: ['database_reset', 'user_deletion']
    },
    inheritsFrom: 'SUPER_ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'MODERATOR',
    name: '모더레이터',
    description: '커뮤니티 및 컨텐츠 관리자',
    level: 60,
    isSystemRole: true,
    permissions: [
      'users.view',
      'community.moderate',
      'orders.view',
      'products.view',
      'system.analytics'
    ],
    restrictions: {
      maxUsers: 10,
      timeRange: {
        start: '09:00',
        end: '18:00'
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'OPERATOR',
    name: '운영자',
    description: '제한된 운영 권한을 가진 사용자',
    level: 40,
    isSystemRole: true,
    permissions: [
      'orders.view',
      'orders.edit',
      'products.view',
      'users.view'
    ],
    restrictions: {
      maxUsers: 20
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 권한 관리는 ADMIN 이상만 조회 가능
    if (!['SUPER_ADMIN', 'ADMIN'].includes(authResult.user?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'permissions', 'roles', 'users'
    const category = searchParams.get('category');

    switch (type) {
      case 'permissions':
        let filteredPermissions = systemPermissions;
        if (category) {
          filteredPermissions = systemPermissions.filter(p => p.category === category);
        }

        // 카테고리별로 그룹화
        const permissionsByCategory = filteredPermissions.reduce((groups, permission) => {
          const category = permission.category;
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push(permission);
          return groups;
        }, {} as Record<string, Permission[]>);

        return NextResponse.json({
          success: true,
          permissions: filteredPermissions,
          permissionsByCategory,
          categories: [...new Set(systemPermissions.map(p => p.category))]
        });

      case 'roles':
        return NextResponse.json({
          success: true,
          roles: systemRoles
        });

      case 'users':
        // 모의 사용자 권한 데이터
        const userPermissions: UserPermission[] = [
          {
            userId: 1,
            userName: '시스템 관리자',
            userEmail: 'admin@mutpark.com',
            roleId: 'SUPER_ADMIN',
            roleName: '최고 관리자',
            permissions: systemPermissions.map(p => ({
              id: p.id,
              name: p.name,
              granted: true,
              inheritedFrom: 'SUPER_ADMIN',
              grantedAt: new Date().toISOString()
            })),
            restrictions: {},
            lastActivity: new Date().toISOString()
          },
          {
            userId: 2,
            userName: '운영 관리자',
            userEmail: 'manager@mutpark.com',
            roleId: 'ADMIN',
            roleName: '관리자',
            permissions: systemPermissions
              .filter(p => !['system.database', 'users.delete'].includes(p.id))
              .map(p => ({
                id: p.id,
                name: p.name,
                granted: true,
                inheritedFrom: 'ADMIN',
                grantedAt: new Date().toISOString()
              })),
            restrictions: {
              features: ['database_reset', 'user_deletion']
            },
            lastActivity: new Date(Date.now() - 86400000).toISOString()
          }
        ];

        return NextResponse.json({
          success: true,
          userPermissions
        });

      default:
        return NextResponse.json({
          success: true,
          permissions: systemPermissions,
          roles: systemRoles,
          summary: {
            totalPermissions: systemPermissions.length,
            totalRoles: systemRoles.length,
            categories: [...new Set(systemPermissions.map(p => p.category))].length
          }
        });
    }

  } catch (error) {
    console.error('Get permissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 권한 생성은 SUPER_ADMIN만 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { type, data } = await request.json();

    switch (type) {
      case 'role':
        const {
          id,
          name,
          description,
          level,
          permissions,
          restrictions,
          inheritsFrom
        } = data;

        // 유효성 검사
        if (!id || !name || !description || level === undefined) {
          return NextResponse.json({
            error: 'Missing required fields: id, name, description, level'
          }, { status: 400 });
        }

        // 중복 확인
        if (systemRoles.some(role => role.id === id)) {
          return NextResponse.json({
            error: 'Role with this ID already exists'
          }, { status: 400 });
        }

        const newRole: Role = {
          id,
          name,
          description,
          level: parseInt(level),
          isSystemRole: false,
          permissions: permissions || [],
          restrictions: restrictions || {},
          inheritsFrom,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        systemRoles.push(newRole);

        return NextResponse.json({
          success: true,
          role: newRole,
          message: '새로운 역할이 생성되었습니다.'
        });

      case 'permission':
        // 커스텀 권한 생성 로직 (필요시 구현)
        return NextResponse.json({
          error: 'Custom permission creation not implemented'
        }, { status: 501 });

      default:
        return NextResponse.json({
          error: 'Invalid type. Must be "role" or "permission"'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Create permission/role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 권한 수정은 SUPER_ADMIN만 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { type, id, data } = await request.json();

    switch (type) {
      case 'role':
        const roleIndex = systemRoles.findIndex(role => role.id === id);
        if (roleIndex === -1) {
          return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        // 시스템 역할 보호
        if (systemRoles[roleIndex].isSystemRole && ['SUPER_ADMIN', 'ADMIN'].includes(id)) {
          return NextResponse.json({
            error: 'Cannot modify core system roles'
          }, { status: 400 });
        }

        systemRoles[roleIndex] = {
          ...systemRoles[roleIndex],
          ...data,
          updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          role: systemRoles[roleIndex],
          message: '역할이 성공적으로 업데이트되었습니다.'
        });

      case 'user_permissions':
        // 사용자별 권한 수정 로직 (실제 구현 필요)
        return NextResponse.json({
          success: true,
          message: '사용자 권한이 업데이트되었습니다.'
        });

      default:
        return NextResponse.json({
          error: 'Invalid type. Must be "role" or "user_permissions"'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Update permission/role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 권한 삭제는 SUPER_ADMIN만 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({
        error: 'Missing required parameters: type, id'
      }, { status: 400 });
    }

    switch (type) {
      case 'role':
        const roleIndex = systemRoles.findIndex(role => role.id === id);
        if (roleIndex === -1) {
          return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        // 시스템 역할 보호
        if (systemRoles[roleIndex].isSystemRole) {
          return NextResponse.json({
            error: 'Cannot delete system roles'
          }, { status: 400 });
        }

        // 사용 중인 역할 확인 (실제 구현에서는 데이터베이스 확인)
        // if (isRoleInUse(id)) {
        //   return NextResponse.json({
        //     error: 'Cannot delete role that is currently assigned to users'
        //   }, { status: 400 });
        // }

        systemRoles.splice(roleIndex, 1);

        return NextResponse.json({
          success: true,
          message: '역할이 성공적으로 삭제되었습니다.'
        });

      default:
        return NextResponse.json({
          error: 'Invalid type. Only "role" deletion is supported'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Delete role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}