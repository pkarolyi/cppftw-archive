import Channels from "@/components/channels";

export default function MessagesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    channelId: string;
  };
}) {
  return (
    <main className="h-screen flex p-2 bg-gradient-to-br from-cyan-800 to-yellow-800">
      <div className="h-full w-1/4 backdrop-brightness-50 rounded-l-md">
        <Channels activeChannel={params.channelId} />
      </div>
      <div className="h-full w-3/4 bg-slate-50 rounded-r-md break-words">
        {children}
      </div>
    </main>
  );
}
