const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestComments() {
  try {
    // 기존 게시물 확인
    const posts = await prisma.communityPost.findMany({
      select: { id: true, title: true },
      orderBy: { id: 'asc' },
      take: 3
    });

    if (posts.length === 0) {
      console.log("게시물이 없습니다.");
      return;
    }

    console.log("Available posts:", posts);

    // 댓글 데이터 생성
    const comments = [
      {
        postId: posts[0].id,
        userId: 1,
        content: "정말 유용한 정보네요! 감사합니다 😊",
      },
      {
        postId: posts[0].id,
        userId: 2,
        content: "저도 비슷한 경험이 있어서 공감이 많이 됩니다. 좋은 글 감사드려요!",
      },
      {
        postId: posts[1].id,
        userId: 1,
        content: "와! 이런 방법이 있었군요. 꼭 시도해보겠습니다 👍",
      },
      {
        postId: posts[1].id,
        userId: 2,
        content: "정말 도움이 되는 꿀팁이네요. 저장해두고 자주 참고하겠습니다.",
      },
      {
        postId: posts[2].id,
        userId: 1,
        content: "리뷰 잘 봤습니다. 구매 결정에 도움이 되었어요!",
      }
    ];

    // 댓글 생성
    for (const commentData of comments) {
      const comment = await prisma.communityPostComment.create({
        data: commentData,
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      });

      console.log(`댓글 생성됨: ${comment.id} - ${comment.content}`);

      // 게시물의 댓글 수 증가
      await prisma.communityPost.update({
        where: { id: commentData.postId },
        data: {
          commentsCount: {
            increment: 1
          }
        }
      });
    }

    // 대댓글 생성 (첫 번째 댓글에 대한 답글)
    const firstComment = await prisma.communityPostComment.findFirst({
      where: { postId: posts[0].id },
      orderBy: { id: 'asc' }
    });

    if (firstComment) {
      const replies = [
        {
          postId: posts[0].id,
          userId: 2,
          parentId: firstComment.id,
          content: "맞아요! 저도 같은 생각이에요 ☺️",
        },
        {
          postId: posts[0].id,
          userId: 1,
          parentId: firstComment.id,
          content: "감사합니다! 더 유용한 정보로 찾아뵙겠습니다.",
        }
      ];

      for (const replyData of replies) {
        const reply = await prisma.communityPostComment.create({
          data: replyData,
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        });

        console.log(`대댓글 생성됨: ${reply.id} - ${reply.content}`);

        // 게시물의 댓글 수 증가
        await prisma.communityPost.update({
          where: { id: replyData.postId },
          data: {
            commentsCount: {
              increment: 1
            }
          }
        });
      }
    }

    console.log("✅ 테스트 댓글 생성 완료!");

  } catch (error) {
    console.error("❌ 댓글 생성 오류:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestComments();