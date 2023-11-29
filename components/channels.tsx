import { getChannels, getLatestMessageIsoDate } from "@/lib/data";
import clsx from "clsx";
import Link from "next/link";
import Timestamp from "./timestamp";

export default async function Channels({
  activeChannel,
}: {
  activeChannel?: string;
}) {
  const channels = await getChannels();
  const latestMessageDate = await getLatestMessageIsoDate();

  return (
    <div className="h-full flex flex-col">
      <div className="text-2xl text-slate-50 font-bold p-4 border-b border-slate-500 h-16">
        <h1>CPP FTW</h1>
      </div>
      <div className="py-2 h-full overflow-y-scroll overflow-x-hidden">
        {channels
          .sort((a, b) => (a.name < b.name ? -1 : 1))
          .map((channel) => (
            <Link key={channel.id} href={`/channels/${channel.id}`}>
              <div
                className={clsx(
                  "text-base text-slate-200 mx-2 px-2 py-1 rounded-md hover:bg-cyan-900 hover:text-slate-50",
                  activeChannel === channel.id &&
                    "bg-yellow-800 text-slate-50 font-bold"
                )}
              >
                # {channel.name}
              </div>
            </Link>
          ))}
      </div>
      <div className="text-slate-50 text-xs border-t border-slate-500 px-4 py-2">
        Last archived message: <Timestamp date={latestMessageDate} />
      </div>
    </div>
  );
}