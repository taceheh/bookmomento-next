import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const res = await prisma.post.create({
    data: {},
  });
  return Response.json('ok!');
}
