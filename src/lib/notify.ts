import { prisma } from "./prisma";

export async function notify(userId: string, title: string, body: string) {
  await prisma.notification.create({ data: { userId, title, body } });
}
