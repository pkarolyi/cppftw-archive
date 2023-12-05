import Messages from "@/components/messages";
import MessagesSkeleton from "@/components/skeletons/messages_skeleton";
import Content from "@/components/ui/content";
import ContentHeader from "@/components/ui/content_header";
import Paginator from "@/components/ui/paginator";
import SearchBox from "@/components/ui/search_box";
import { getChannelMessagesCount, getChannelName } from "@/lib/data";
import Link from "next/link";
import { Suspense } from "react";

export default async function ChannelPage({
  params,
  searchParams,
}: {
  params: {
    channelId: string;
  };
  searchParams: {
    search?: string;
    page?: string;
    size?: string;
  };
}) {
  const channelId = params.channelId;
  const search = searchParams.search;
  const page = Number(searchParams.page) || 1;
  const take = Number(searchParams.size) || 100;
  const skip = (page - 1) * take;

  const [totalMessages, channelName] = await Promise.all([
    getChannelMessagesCount({ channelId, search }),
    getChannelName({ id: channelId }),
  ]);

  return (
    <Content>
      <ContentHeader>
        <div className="flex gap-2 justify-between items-start">
          <div className="text-xl lg:text-2xl text-stone-900 font-bold">
            # {channelName}
          </div>
          <Link
            className="block text-2xl leading-none lg:hidden"
            href="/channels"
          >
            &#9776;
          </Link>
        </div>
        <SearchBox />
        <Paginator pageCount={Math.ceil(totalMessages / take)} />
      </ContentHeader>
      <Suspense
        key={`${search}-${page}-${take}`}
        fallback={<MessagesSkeleton />}
      >
        <Messages
          channelId={channelId}
          search={search}
          take={take}
          skip={skip}
        />
      </Suspense>
    </Content>
  );
}
