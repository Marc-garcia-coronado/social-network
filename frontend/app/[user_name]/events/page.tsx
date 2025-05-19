import { cookies } from "next/headers";
import { Topic } from "@/lib/types";
import EventFeed from "@/components/EventFeed";

async function getTopics(token: string | undefined): Promise<Topic[]> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", "Bearer " + token);
  }

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
  const cookiesStore = cookies();
  const token = cookiesStore.get("token")?.value || "";
  const topics = await getTopics(token);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-center mt-5 mb-10">
        Eventos Disponibles
      </h1>
      <EventFeed
        token={token}
        topics={topics}
        initialSearch={searchParams.q || ""}
        initialTopic={searchParams.topic || ""}
      />
    </div>
  );
}
