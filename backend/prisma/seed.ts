import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 기존 데이터 정리
  await prisma.trackingEvent.deleteMany();
  await prisma.sendLog.deleteMany();
  await prisma.sendJob.deleteMany();
  await prisma.composeJob.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.contact.deleteMany();

  // 테스트 상품 생성
  const products = await prisma.product.createMany({
    data: [
      {
        name: '봄 신상 원피스',
        price: 45000,
        size: 'Free',
        color: '베이지',
        marketLink: 'https://example.com/product/1',
        status: 'DRAFT',
      },
      {
        name: '여름 블라우스',
        price: 32000,
        size: 'M',
        color: '화이트',
        marketLink: 'https://example.com/product/2',
        status: 'READY',
        composedImageUrl: 'https://example.com/composed/2.jpg',
      },
      {
        name: '가을 니트',
        price: 58000,
        size: 'L',
        color: '브라운',
        marketLink: 'https://example.com/product/3',
        status: 'READY',
        composedImageUrl: 'https://example.com/composed/3.jpg',
        sendCount: 150,
        readCount: 120,
        clickCount: 45,
      },
    ],
  });

  // 테스트 주소록 생성
  const contacts = await prisma.contact.createMany({
    data: [
      {
        name: '홍길동',
        phone: '010-1234-5678',
        kakaoId: 'honggildong',
        groupName: 'VIP고객',
        tags: '단골,재구매',
      },
      {
        name: '김철수',
        phone: '010-2345-6789',
        kakaoId: 'kimcs',
        groupName: '신규고객',
        tags: '이벤트참여',
      },
      {
        name: '이영희',
        phone: '010-3456-7890',
        groupName: 'VIP고객',
        tags: '단골,리뷰작성',
      },
      {
        name: '박민수',
        phone: '010-4567-8901',
        groupName: '일반고객',
      },
      {
        name: '최지영',
        phone: '010-5678-9012',
        kakaoId: 'choijy',
        groupName: 'VIP고객',
        tags: '대량구매',
      },
    ],
  });

  console.log('✅ 시드 데이터 생성 완료!');
  console.log(`📦 상품 ${products.count}개 생성`);
  console.log(`👥 연락처 ${contacts.count}개 생성`);
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });