import { cookies } from "next/headers";
import { Event, Topic } from "@/lib/types";
import EventComponent from "@/components/EventComponent";
import SearchBar from "@/components/SearchBar";
import SelectComponent from "@/components/SelectComponent";

async function getEvents(
  token: string | undefined,
  search?: string,
  topic?: string,
): Promise<Event[]> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", "Bearer " + token);
  }

  const url = new URL("http://localhost:3000/api/events");
  if (search) {
    url.searchParams.set("q", search);
  }
  if (topic) {
    url.searchParams.set("topic", topic);
  }

  const res = await fetch(url.toString(), {
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

async function getUserSubscribedEvents(
  token: string | undefined,
): Promise<Event[]> {
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

async function getTopics(token: string | undefined): Promise<Topic[]> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", "Bearer " + token);
  }

  const res = await fetch(`http://localhost:3000/api/topics`, {
    method: "GET",
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    throw new Error("no se ha podido obtener los gustos!");
  }

  const data = await res.json();
  return data;
}

export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string; topic?: string };
}) {
  const cookiesStore = await cookies();
  const token: string | undefined = cookiesStore.get("token")?.value;

  const search = searchParams.q || "";
  const topic = searchParams.topic || "";

  const events: Event[] = await getEvents(token, search, topic);
  const subscribedEvents: Event[] = await getUserSubscribedEvents(token);
  const subscribedEventsIds: number[] =
    subscribedEvents?.map((event: Event) => event.id) || [];
  const topics: Topic[] = await getTopics(token);

  return (
    <div className="container mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-center mt-5 mb-10">
          Eventos Disponibles
        </h1>

        <div className="flex flex-col items-center justify-center mb-10 md:mx-20 md:flex-row md:justify-between md:gap-3">
          <SearchBar
            initialSearch={search}
            className="w-full place-self-center md:w-4/6 md:place-self-start"
          />
          <SelectComponent
            topics={topics}
            className="w-3/6 md:w-[170px] place-self-start"
          />
        </div>
      </div>
      {Array.isArray(events) && events.length > 0 ? (
        <ul className="lg:mx-20 grid md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-8 mb-32">
          {events?.map((event) => (
            <EventComponent
              key={event.id}
              event={event}
              apuntado={subscribedEventsIds.includes(event.id)}
              topics={topics}
              token={token ?? ""}
            />
          ))}
        </ul>
      ) : (
        <p className="text-red-500 text-center">
          No se han encontrado eventos con '{searchParams.q}'
        </p>
      )}
    </div>
  );
}
