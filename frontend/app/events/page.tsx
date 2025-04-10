import { cookies } from "next/headers";
import { Event } from "@/lib/types";
import EventComponent from "@/components/Event";

async function getEvents(): Promise<Event[]> {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", "Bearer " + token);
  }

  const res = await fetch("http://localhost:3000/api/events", {
    method: "GET",
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    throw new Error("no se ha podido obtener los eventos");
  }

  const data = await res.json();
  return data.events as Event[];
}

export default async function Page() {
  const events: Event[] = await getEvents();

  return (
    <>
      <h1>Eventos Disponibles</h1>
      {events.length > 0 && (
        <ul className="flex flex-col space-y-4">
          {events.map((event) => (
            <EventComponent key={event.id} event={event} />
          ))}
        </ul>
      )}
    </>
  );
}
