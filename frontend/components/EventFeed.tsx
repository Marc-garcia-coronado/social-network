"use client";

import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import EventComponent from "@/components/EventComponent";
import SearchBar from "@/components/SearchBar";
import SelectComponent from "@/components/SelectComponent";
import { Event, Topic } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/contexts/UserContext";

interface Props {
  initialSearch: string;
  initialTopic: string;
  topics: Topic[];
}

const LIMIT = 9;

export interface GetEventsPaginatedParams {
  search?: string;
  topic?: string;
  page?: number;
}

export interface GetEventsPaginatedResponse {
  events: Event[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
  };
}

export async function getEventsPaginated({
  search = "",
  topic = "",
  page = 1,
}: GetEventsPaginatedParams): Promise<GetEventsPaginatedResponse> {
  const url = new URL("http://localhost:3000/api/events");
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", LIMIT.toString());
  if (search) url.searchParams.set("q", search);
  if (topic && topic !== "all") url.searchParams.set("topic", topic);

  const res = await fetch(url.toString(), {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch events");

  return await res.json();
}

export default function EventFeed({
  initialSearch,
  initialTopic,
  topics,
}: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [topic, setTopic] = useState(initialTopic);
  const [userTopics, setuserTopics] = useState([]);

  const { user } = useUserContext()

  useEffect(() => {
    // Fetch all topics and user topics
    const fetchTopics = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${user?.id}/topics`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${document.cookie.replace(
                /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
                "$1"
              )}`,
            },
          }
        );
        const topics = await response.json();
        setuserTopics(topics);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, []);

  const fetchSubscribedEvents = async (): Promise<number[]> => {
    const resSubs = await fetch(
      `http://localhost:3000/api/users/${user?.id}/events/subscribed`,
      {
        credentials: "include",
      }
    );
    const data = await resSubs.json();
    return data.events.map((event: Event) => event.id);
  };

  const { data: subscribedIds = [] } = useQuery({
    queryKey: ["subscribed-events"],
    queryFn: fetchSubscribedEvents,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["events", search, topic],
    queryFn: ({ pageParam = 1 }) =>
      getEventsPaginated({ search, topic, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total_count } = lastPage.pagination;
      const totalPages = Math.ceil(total_count / limit);
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const events =
    data?.pages.flatMap((page: GetEventsPaginatedResponse) => page.events) ??
    [];


  return (
    <main className="mb-32">
      <div className="flex flex-col items-center justify-center mb-10 md:mx-20 md:flex-row md:justify-between md:gap-3">
        <SearchBar
          value={search}
          placeholder="Buscar evento..."
          onChange={(val: string) => setSearch(val)}
        />
        <SelectComponent
          topics={userTopics}
          value={topic}
          onChange={(val: string) => setTopic(val)}
          className="w-3/6 md:w-[170px]"
        />
      </div>

      {isLoading ? (
        <p className="text-center">Cargando eventos...</p>
      ) : error ? (
        <p className="text-red-500 text-center mt-8">
          Hubo un error al cargar los eventos.
        </p>
      ) : events.length === 0 || events[0] === null ? (
        <p className="text-red-500 text-center mt-8">
          No se han encontrado eventos con '{search}'
        </p>
      ) : (
        <ul className="flex flex-wrap gap-4 justify-center mb-32">
          {events.map((event) => (
            <EventComponent
              key={event?.id ?? `event-${event?.name}`} // fallback para asegurar el key
              event={event}
              apuntado={subscribedIds.includes(event?.id)}
              topics={userTopics}
              refetchEvents={refetch}
            />
          ))}
        </ul>
      )}

      {hasNextPage && (
        <div className="text-center mt-6">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? "Cargando..." : "Cargar más"}
          </Button>
        </div>
      )}
    </main>
  );
}