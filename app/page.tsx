import { getGeneralChannel } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const generalChannel = await getGeneralChannel();

  if (generalChannel?.id) redirect(`/channels/${generalChannel.id}`);
  else redirect("/channels");
}
