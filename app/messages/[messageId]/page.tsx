import Message from "@/components/message";
import MessageSkeleton from "@/components/message_skeleton";
import { getMessage } from "@/lib/data";
import { Suspense } from "react";

export default async function MessagePage({
  params,
}: {
  params: {
    messageId: string;
  };
}) {
  const messageId = params.messageId;

  const message = await getMessage({ messageId });

  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={<MessageSkeleton />}>
        <Message
          id={message.id}
          date={message.isoDate}
          text={message.text}
          type={message.type}
          userImageUrl={message.user.imageUrl}
          userName={message.user.name}
        />
      </Suspense>
    </div>
  );
}
