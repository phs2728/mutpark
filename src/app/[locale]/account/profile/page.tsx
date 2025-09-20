import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/ProfileForm";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import BadgeSystem from "@/components/community/BadgeSystem";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const auth = await getAuthenticatedUser();
  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      name: true,
      phone: true,
      locale: true,
      currency: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // 사용자 커뮤니티 활동 통계 가져오기
  const [postsCount, commentsCount, likesCount] = await Promise.all([
    prisma.communityPost.count({
      where: { authorId: auth.userId }
    }),
    prisma.communityPostComment.count({
      where: { userId: auth.userId }
    }),
    prisma.communityPostLike.count({
      where: { userId: auth.userId }
    })
  ]);

  const userStats = {
    postsCount,
    commentsCount,
    likesCount,
    joinedAt: user.createdAt
  };

  return (
    <div className="space-y-8">
      {/* Korean Traditional Header */}
      <div className="korean-gradient-mountain rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">{user.name}님의 프로필</h1>
            <p className="text-white/80">
              {new Date(user.createdAt).toLocaleDateString('ko-KR')} 가입
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            기본 정보 설정
          </h2>
          <ProfileForm initialProfile={user} />
        </div>

        {/* Activity Stats */}
        <div className="space-y-6">
          <div className="community-spring rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🏃‍♂️ 활동 통계
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">작성한 글</span>
                <span className="font-semibold text-blue-600">{userStats.postsCount}개</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">작성한 댓글</span>
                <span className="font-semibold text-green-600">{userStats.commentsCount}개</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">받은 좋아요</span>
                <span className="font-semibold text-red-600">{userStats.likesCount}개</span>
              </div>
            </div>
          </div>

          {/* Quick Badge Check */}
          <div className="community-winter rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🏆 배지 시스템
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              커뮤니티 활동을 통해 배지를 획득하세요!
            </p>
            <button
              onClick={() => window.location.href = '/ko/community?tab=badges'}
              className="inline-block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              배지 확인하기
            </button>
          </div>
        </div>
      </div>

      {/* Badge System Section */}
      <div className="community-autumn rounded-2xl p-6">
        <BadgeSystem userId={auth.userId} />
      </div>
    </div>
  );
}
