import { cookies } from "next/headers";
import { Topic } from "@/lib/types";
import EventFeed from "@/components/EventFeed";

async function getTopics(): Promise<Topic[]> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Credentials", "include");

  const res = await fetch(`http://localhost:3000/api/topics`, {
    headers,
  });

  if (!res.ok) throw new Error("no se ha podido obtener los gustos!");
  return await res.json();
}

export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string; topic?: string };
}) {
  const topics = await getTopics();

  return (
    <>
      <EventFeed
        topics={topics}
        initialSearch={searchParams.q || ""}
        initialTopic={searchParams.topic || ""}
      />
    </>
  );
}
