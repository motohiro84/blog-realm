import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // カテゴリマスタ
  await prisma.master.createMany({
    data: [
      { category: 'blog_categories', code: 'TECH', displayName: '技術', displayOrder: 1 },
      { category: 'blog_categories', code: 'DIARY', displayName: '日記', displayOrder: 2 },
      { category: 'blog_categories', code: 'REVIEW', displayName: 'レビュー', displayOrder: 3 },
    ],
    skipDuplicates: true,
  });

  // ステータスマスタ
  await prisma.master.createMany({
    data: [
      { category: 'blog_statuses', code: 'DRAFT', displayName: '下書き', displayOrder: 1 },
      { category: 'blog_statuses', code: 'PENDING', displayName: '承認待ち', displayOrder: 2 },
      { category: 'blog_statuses', code: 'APPROVED', displayName: '承認済み', displayOrder: 3 },
      { category: 'blog_statuses', code: 'REJECTED', displayName: '却下', displayOrder: 4 },
    ],
    skipDuplicates: true,
  });

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
