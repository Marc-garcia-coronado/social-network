import { Topic } from "@/lib/types";
import EventFeed from "@/components/EventFeed";

async function getTopics(): Promise<Topic[]> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Credentials", "include");

  const res = await fetch(`http://social-network-production.up.railway.app/api/topics`, {
    headers,
  });

  if (!res.ok) throw new Error("no se ha podido obtener los gustos!");
  return await res.json();
}

// types.ts (opcional)
export type PageProps = {
  searchParams?: {
    q?: string;
    topic?: string;
  };
};


export default async function Page({ searchParams }: PageProps) {
  const topics = await getTopics();

  return (
    <EventFeed
      topics={topics}
      initialSearch={searchParams?.q || ""}
      initialTopic={searchParams?.topic || ""}
    />
  );
}
