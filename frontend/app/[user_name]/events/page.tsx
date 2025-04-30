import { cookies } from "next/headers";
import { Event } from "@/lib/types";
import EventComponent from "@/components/EventComponent";

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

async function getAuth(headers: Headers | HeadersInit): Promise<number> {
  const resUser = await fetch("http://localhost:3000/api/auth", {
    method: "GET",
    credentials: "include",
    headers,
  });

  if (!resUser.ok) {
    throw new Error("no se ha podido obtener el usuario");
  }

  const dataUser = await resUser.json();
  return dataUser.user.id;
}

async function getUserSubscribedEvents(): Promise<Event[]> {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", "Bearer " + token);
  }

  const userId = await getAuth(headers);

  const res = await fetch(
    `http://localhost:3000/api/users/${userId}/events/subscribed`,
    {
      method: "GET",
      credentials: "include",
      headers,
    },
  );

  if (!res.ok) {
    throw new Error(
      "no se ha podido obtener los eventos que el usuario esta subscrito",
    );
  }

  const data = await res.json();
  return data.events;
}

export default async function Page() {
  const events: Event[] = await getEvents();
  const subscribedEvents: Event[] = await getUserSubscribedEvents();
  const subscribedEventsIds: number[] = subscribedEvents
    ? subscribedEvents?.map((event: Event) => event.id)
    : [];

  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", "Bearer " + token);
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-center mt-5 mb-10">
        Eventos Disponibles
      </h1>
      {events.length > 0 && (
        <ul className="flex flex-col space-y-4 mt-5 mb-24">
          {events.map((event) => (
            <EventComponent
              key={event.id}
              event={event}
              apuntado={subscribedEventsIds.includes(event.id)}
              token={token ?? ""}
            />
          ))}
        </ul>
      )}
    </>
  );
}
