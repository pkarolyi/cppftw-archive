import { searchMessages } from "@/lib/data";
import SearchResult from "./ui/search_result";
import { Message } from "@prisma/client";

export default async function SearchResults({
  term,
}: Readonly<{ term?: string }>) {
  const messages = await searchMessages({ term });

  console.log(messages[0]);

  return (
    <div className="h-full overflow-x-hidden overflow-y-scroll py-1 lg:px-4 lg:py-2">
      {messages.map((message) => (
        <SearchResult key={message.id} message={message} />
      ))}
    </div>
  );
}
