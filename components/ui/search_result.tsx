import { getChannelName, getMessagePageFromTs, getUser } from "@/lib/data";
import { Message, MessageType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import Timestamp from "./timestamp";

export default async function SearchResult({
  message,
}: Readonly<{
  message: Message;
}>) {
  const messagePage = await getMessagePageFromTs({
    channelId: message.channelId,
    ts: message.ts,
    take: 100,
  });

  const channelName = await getChannelName({ id: message.channelId });
  const user = await getUser({ id: message.userId });

  return (
    <Link
      href={`/channels/${message.channelId}?messageTs=${message.ts}&page=${messagePage}&take=100`}
    >
      <div className="mb-4 rounded-md border border-stone-300 bg-white px-2 py-1 text-stone-800 hover:border-stone-400 hover:bg-stone-100">
        <div className="font-bold text-stone-600"># {channelName}</div>
        <div className="flex flex-row items-start gap-2">
          {user?.imageUrl && (
            <div className="mt-1 flex-none">
              <Image
                alt={`Profile picture of ${user.name}`}
                src={user.imageUrl}
                className="h-[36px] w-[36px] rounded-md lg:h-[42px] lg:w-[42px]"
                width={42}
                height={42}
              />
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex gap-2 text-sm lg:text-base">
              <span className="font-bold">
                {user?.name ?? "[error getting username]"}
              </span>
              <Timestamp date={message.isoDate} />
            </div>
            <p className="whitespace-pre-line text-sm lg:text-base">
              {message.text}
            </p>
            {message.type === MessageType.THREAD_PARENT && (
              <div className="font-bold text-stone-600">
                This message has thread replies
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
