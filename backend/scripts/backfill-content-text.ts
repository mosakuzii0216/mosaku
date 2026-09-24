// contentTextを持たない既存メモを埋める。一度きり
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { extractText } from '../src/memo/extract-text';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const memos = await prisma.memo.findMany({ where: { contentText: null } });
  console.log(`${memos.length}件`);

  for (const memo of memos) {
    await prisma.memo.update({
      where: { id: memo.id },
      data: { contentText: extractText(memo.content) },
    });
  }
  console.log('done');
}

void main().finally(() => prisma.$disconnect());
