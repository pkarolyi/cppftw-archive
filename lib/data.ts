import { prisma } from "@/lib/prisma";

export async function getChannels() {
  const channels = await prisma.archiveChannel.findMany();
  return channels;
}

export async function getMessages({
  channelId,
  skip,
  take,
  search,
}: {
  channelId: string;
  skip: number;
  take: number;
  search?: string;
}) {
  const searchQuery = search
    ? {
        OR: [
          { text: { contains: search } },
          { user: { name: { contains: search } } },
          { threadMessages: { some: { text: { contains: search } } } },
        ],
      }
    : null;

  const messages = await prisma.archiveMessage.findMany({
    take: take,
    skip: skip,
    orderBy: { ts: "asc" },
    include: { user: true, threadMessages: true },
    where: { channelId: channelId, ...searchQuery },
  });

  return messages;
}