const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestPosts() {
  try {
    console.log('Creating test community posts...');

    const testPosts = [
      {
        authorId: 1,
        type: 'RECIPE',
        title: '간단한 김치찌개 만들기',
        content: '집에서 쉽게 만들 수 있는 김치찌개 레시피입니다. 김치와 돼지고기만 있으면 금방 만들 수 있어요!',
        tags: ['김치찌개', '한식', '간단요리'],
        difficulty: 'EASY',
        cookingTime: 30,
        servings: 2,
        ingredients: [
          { id: '1', name: '김치', quantity: '200', unit: 'g', isEssential: true },
          { id: '2', name: '돼지고기', quantity: '150', unit: 'g', isEssential: true },
          { id: '3', name: '두부', quantity: '1/2', unit: '모', isEssential: false }
        ],
        instructions: [
          { id: '1', step: 1, description: '김치를 적당한 크기로 썰어주세요' },
          { id: '2', step: 2, description: '돼지고기를 볶아주세요' },
          { id: '3', step: 3, description: '김치를 넣고 함께 볶아주세요' }
        ],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        likesCount: Math.floor(Math.random() * 50),
        commentsCount: Math.floor(Math.random() * 20),
        bookmarksCount: Math.floor(Math.random() * 30),
        viewsCount: Math.floor(Math.random() * 200)
      },
      {
        authorId: 1,
        type: 'TIP',
        title: '야채를 오래 보관하는 방법',
        content: '야채를 신선하게 오래 보관할 수 있는 간단한 팁들을 공유합니다. 냉장고 정리법도 함께!',
        tags: ['보관법', '야채', '팁', '냉장고'],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        likesCount: Math.floor(Math.random() * 50),
        commentsCount: Math.floor(Math.random() * 20),
        bookmarksCount: Math.floor(Math.random() * 30),
        viewsCount: Math.floor(Math.random() * 200)
      },
      {
        authorId: 1,
        type: 'REVIEW',
        title: '오뚜기 진라면 매운맛 리뷰',
        content: '새로 나온 진라면 매운맛을 먹어봤는데, 생각보다 맛있더라구요! 면발도 쫄깃하고 국물도 깔끔해요.',
        tags: ['라면', '리뷰', '오뚜기'],
        rating: 4,
        reviewType: 'PRODUCT',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        likesCount: Math.floor(Math.random() * 50),
        commentsCount: Math.floor(Math.random() * 20),
        bookmarksCount: Math.floor(Math.random() * 30),
        viewsCount: Math.floor(Math.random() * 200)
      },
      {
        authorId: 1,
        type: 'QUESTION',
        title: '된장찌개에 어떤 야채를 넣으면 좋을까요?',
        content: '된장찌개를 자주 끓이는데, 항상 비슷한 야채만 넣게 되네요. 다른 맛있는 야채 추천해주세요!',
        tags: ['된장찌개', '야채', '질문', '요리'],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        likesCount: Math.floor(Math.random() * 50),
        commentsCount: Math.floor(Math.random() * 20),
        bookmarksCount: Math.floor(Math.random() * 30),
        viewsCount: Math.floor(Math.random() * 200)
      }
    ];

    for (const postData of testPosts) {
      const post = await prisma.communityPost.create({
        data: postData
      });
      console.log(`Created post: ${post.title}`);
    }

    console.log('Test posts created successfully!');
  } catch (error) {
    console.error('Error creating test posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPosts();