const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function syncLikeCounts() {
  try {
    console.log("동기화 시작: 포스트 좋아요 수 카운트 수정");

    // 모든 포스트의 실제 좋아요 수를 계산하고 업데이트
    const posts = await prisma.communityPost.findMany({
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    console.log(`총 ${posts.length}개의 포스트를 처리합니다.`);

    for (const post of posts) {
      const actualLikesCount = post._count.likes;
      const storedLikesCount = post.likesCount;

      if (actualLikesCount !== storedLikesCount) {
        console.log(`포스트 ${post.id}: ${storedLikesCount} → ${actualLikesCount} 좋아요`);

        await prisma.communityPost.update({
          where: { id: post.id },
          data: {
            likesCount: actualLikesCount,
          },
        });
      } else {
        console.log(`포스트 ${post.id}: 이미 동기화됨 (${actualLikesCount} 좋아요)`);
      }
    }

    console.log("✅ 좋아요 수 동기화 완료!");

    // 결과 확인
    const updatedPosts = await prisma.communityPost.findMany({
      select: {
        id: true,
        title: true,
        likesCount: true,
      },
      orderBy: {
        likesCount: 'desc',
      },
      take: 5,
    });

    console.log("\n상위 5개 포스트:");
    updatedPosts.forEach(post => {
      console.log(`- ${post.title}: ${post.likesCount} 좋아요`);
    });

  } catch (error) {
    console.error("❌ 동기화 오류:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncLikeCounts();