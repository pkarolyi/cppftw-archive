import { prisma } from "@/lib/prisma";
import { ArchiveMessageType } from "@prisma/client";

export async function getChannels() {
  const channels = await prisma.archiveChannel.findMany();
  return channels;
}

export async function getChannelGeneral() {
  const channel = await prisma.archiveChannel.findFirstOrThrow({
    where: { isGeneral: true },
  });
  return channel;
}

export async function getChannelName({ id }: { id: string }) {
  const channel = await prisma.archiveChannel.findUnique({ where: { id } });
  return channel?.name;
}

export async function getLatestMessageIsoDate() {
  const latestMessage = await prisma.archiveMessage.findFirstOrThrow({
    orderBy: { ts: "desc" },
  });
  return latestMessage.isoDate;
}

function buildMessageSearchQuery(search?: string) {
  if (!search) return null;

  return {
    OR: [
      { text: { contains: search } },
      { isoDate: { contains: search } },
      { user: { name: { contains: search } } },
    ],
  };
}

const onlyToplevelMessages = {
  OR: [
    { type: ArchiveMessageType.NORMAL },
    { type: ArchiveMessageType.THREAD_PARENT },
  ],
};

export async function getChannelMessages({
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
  const searchQuery = buildMessageSearchQuery(search);

  const messages = await prisma.archiveMessage.findMany({
    take: take,
    skip: skip,
    orderBy: { ts: "asc" },
    include: { user: true },
    where: {
      channelId: channelId,
      ...onlyToplevelMessages,
      ...searchQuery,
    },
  });

  return messages;
}
export async function getChannelMessagesCount({
  channelId,
  search,
}: {
  channelId: string;
  search?: string;
}) {
  const searchQuery = buildMessageSearchQuery(search);

  const messageCount = await prisma.archiveMessage.count({
    where: { channelId: channelId, ...onlyToplevelMessages, ...searchQuery },
  });

  return messageCount;
}

export async function getThreadReplies({ messageId }: { messageId: string }) {
  const replies = await prisma.archiveMessage.findMany({
    orderBy: { ts: "asc" },
    include: { user: true },
    where: { parentId: messageId },
  });
  return replies;
}

export async function getMessage({ messageId }: { messageId: string }) {
  const message = await prisma.archiveMessage.findUniqueOrThrow({
    include: { user: true },
    where: { id: messageId },
  });
  return message;
}
