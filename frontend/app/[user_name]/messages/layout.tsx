"use client";

import { useEffect, useState, ReactNode } from "react";
import { User } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

const fetchConversations = async (): Promise<User[]> => {
  try {
    const response = await fetch(`http://localhost:3000/api/messages`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching conversations");
    }

    const data = await response.json();

    return data.conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export default function MessagesLayout({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showNoResults, setShowNoResults] = useState<boolean>(false);
  const [numberNotReadedMsg, setNumberNotReadedMsg] = useState<
    Record<number, number>
  >({});
  const router = useRouter();
  const { user } = useUserContext();

  const fetchGetNotReadedConversationMessage = async (
    id: number
  ): Promise<number> => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/messages/${id}/read`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching not readed conversation messages");
      }

      const data = await response.json();
      return data.number;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return 0;
    }
  };

  // Función para buscar usuarios en el backend
  const fetchFilteredUsers = async (term: string) => {
    try {
      setShowNoResults(false); // Ocultar mensaje mientras se busca
      const response = await fetch(
        `http://localhost:3000/api/users/search?query=${term}&limit=10`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching users");
      }
      const data = await response.json();
      setFilteredUsers(data.users);

      // Validar que data.users exista y sea un array
      if (!data || !Array.isArray(data.users)) {
        setFilteredUsers([]);
        setShowNoResults(true);
        return;
      }
      // Mostrar mensaje de "No se encontraron usuarios" después de un retraso si no hay resultados
      if (data.users.length === 0) {
        setTimeout(() => {
          setShowNoResults(true);
        }, 500); // Retraso de 500ms
      } else {
        setShowNoResults(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setFilteredUsers([]);
      setShowNoResults(true);
    }
  };

  const {
    data: conversations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => fetchConversations(),
    refetchInterval: 1000 * 60,
  });

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredUsers([]);
      setShowNoResults(false); // Ocultar mensaje si no hay texto
    } else {
      const delayDebounceFn = setTimeout(() => {
        fetchFilteredUsers(search);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [search]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!conversations || !Array.isArray(conversations)) return;

      const counts: Record<number, number> = {};

      for (const convo of conversations) {
        const number = await fetchGetNotReadedConversationMessage(convo.id);
        counts[convo.id] = number;
      }

      setNumberNotReadedMsg(counts);
    };

    fetchUnreadCounts();
  }, [conversations]);

  return (
    <div className="flex h-screen">
      <aside className="min-w-96 border-r flex flex-col">
        <h1 className="ps-4 mb-4 text-3xl mt-4">Chats</h1>
        <div className="relative">
          <SearchBar
            value={search}
            placeholder="Buscar usuario..."
            onChange={(val: string) => setSearch(val)}
            className="px-4"
          />
          {/* Lista de resultados */}
          {filteredUsers.length > 0 ? (
            <ul className="mt-4 bg-white border shadow divide-y divide-gray-200 absolute top-full left-0 w-full">
              {filteredUsers.map((searchedUser) => (
                <li
                  key={searchedUser.id}
                  className="flex items-center p-4 space-x-4 cursor-pointer"
                  onClick={() => {
                    setSearch("");
                    router.push(
                      `/${user?.user_name}/messages/${searchedUser.id}`
                    );
                  }}
                >
                  <Image
                    src={searchedUser.profile_picture || "/teddy.webp"}
                    alt={`${searchedUser.full_name}'s avatar`}
                    width={24}
                    height={24}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {searchedUser.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{searchedUser.user_name}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            showNoResults && (
              <p className="self-center text-red-500">
                No hay resultados con &apos;{search}&apos;
              </p>
            )
          )}
        </div>
        {isLoading && (
          <p className="text-gray-400">Cargando tus conversaciones...</p>
        )}
        {isError && <p className="text-red-500">Ha ocurrido un error</p>}
        <ul className="mt-4 border-y divide-y divide-gray-200 overflow-y-auto ">
          {Array.isArray(conversations) &&
            conversations.length > 0 &&
            conversations.map((conversation: User) => (
              <div
                key={conversation.id}
                className="flex justify-between items-center cursor-pointer p-4 w-full"
                onClick={() => {
                  router.push(
                    `/${user?.user_name}/messages/${conversation.id}`
                  );
                  fetch(
                    `http://localhost:3000/api/messages/${conversation.id}/read`,
                    {
                      method: "PATCH",
                      credentials: "include",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  ).then((res) => {
                    if (res.ok) {
                      setNumberNotReadedMsg((prev) => ({
                        ...prev,
                        [conversation.id]: 0,
                      }));
                    }
                  });
                }}
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={
                      conversation.profile_picture
                        ? conversation.profile_picture
                        : "/teddy.webp"
                    }
                    alt={`imagen de perfil de ` + conversation.user_name}
                    width={24}
                    height={24}
                    className="w-14 h-14 rounded-full"
                  />
                  <p>{conversation.user_name}</p>
                </div>

                {numberNotReadedMsg[conversation.id] > 0 && (
                  <div className="flex rounded-full bg-lime-600 w-6 h-6 items-center justify-center text-center">
                    <p className="text-sm text-white">
                      {numberNotReadedMsg[conversation.id]}
                    </p>
                  </div>
                )}
              </div>
            ))}
        </ul>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
