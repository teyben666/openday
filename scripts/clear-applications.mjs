import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const before = await db.application.count();
const { count } = await db.application.deleteMany({});
console.log(`Applications: ${before} -> deleted ${count}`);
console.log(`Inquiries kept: ${await db.inquiry.count()}`);
await db.$disconnect();
