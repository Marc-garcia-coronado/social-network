"use client";
import { useEffect, useState } from "react";
import { useUserContext } from "@/contexts/UserContext";
import useUser from "@/hooks/useUser";
import PostCard from "@/components/PostCard";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";

type PageParam = {
  pageParam?: number;
};

const fetchPosts = async ({
  pageParam = 1,
}: PageParam): Promise<{
  posts: any;
  pagination: { page: number; limit: number; total_count: number };
}> => {
  const response = await fetch(
    `https://social-network-production.up.railway.app/api/feed?page=${pageParam}`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching posts");
  }

  return response.json();
};

export default function Home() {
  const { user } = useUserContext();
  const userID: number = user?.id ?? 0;

  const {
    data: homeData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: homeLoading,
    error: homeError,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total_count } = lastPage.pagination;
      const totalPages = Math.ceil(total_count / limit);
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useUser(userID);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(""); // Estado para la barra de búsqueda
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]); // Estado para los usuarios filtrados
  const [showNoResults, setShowNoResults] = useState(false); // Nuevo estado

  const [postStats, setPostStats] = useState<
    Record<number, { likes: number; comments: number }>
  >({});
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [likedComments, setLikedComments] = useState<Record<number, boolean>>(
    {}
  );
  const [commentLikesCount, setCommentLikesCount] = useState<
    Record<number, number>
  >({});
  const [visibleComments, setVisibleComments] = useState<
    Record<number, boolean>
  >({});
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  const filteredPosts = (homeData?.pages ?? [])
    .flatMap((page) => page.posts ?? [])
    .filter((post: any) =>
      selectedTopicId ? post.topic?.id === selectedTopicId : true
    );
  // Fetch likes and comments count for a specific post
  const fetchPostStats = async (postID: number) => {
    try {
      const [likesResponse, commentsResponse] = await Promise.all([
        fetch(`https://social-network-production.up.railway.app/api/likes/posts/${postID}/count`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch(`https://social-network-production.up.railway.app/api/posts/${postID}/comments/count`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (!likesResponse.ok || !commentsResponse.ok) {
        throw new Error("Error fetching post stats");
      }

      const likesData = await likesResponse.json();
      const commentsData = await commentsResponse.json();

      setPostStats((prevStats) => ({
        ...prevStats,
        [postID]: {
          likes: likesData.post_likes_count,
          comments: commentsData.post_comments_count,
        },
      }));
    } catch (error) {
      console.error(`Error fetching stats for post ${postID}:`, error);
    }
  };
  // Función para manejar el toggle de likes
  const toggleLike = async (postID: number) => {
    try {
      const isLiked = likedPosts[postID];
      const endpoint = isLiked
        ? `https://social-network-production.up.railway.app/api/posts/${postID}/dislike`
        : `https://social-network-production.up.railway.app/api/posts/${postID}/like`;
      const method = isLiked ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          isLiked ? "Error al quitar el like" : "Error al dar like"
        );
      }

      // Actualizar el estado de likes
      setLikedPosts((prevLikes) => ({
        ...prevLikes,
        [postID]: !isLiked,
      }));

      // Actualizar el contador de likes
      setPostStats((prevStats) => ({
        ...prevStats,
        [postID]: {
          ...prevStats[postID],
          likes: prevStats[postID].likes + (isLiked ? -1 : 1),
        },
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/likes/posts`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching user likes");
      }

      const likedPostsData = await response.json();

      // Convertimos la lista de post IDs en un mapa para un acceso más rápido
      const likedPostsMap = likedPostsData
        ? likedPostsData.reduce(
          (acc: Record<number, boolean>, postID: number) => {
            acc[postID] = true;
            return acc;
          },
          {}
        )
        : [];

      setLikedPosts(likedPostsMap);
    } catch (error) {
      console.error("Error fetching user likes:", error);
    }
  };

  // Función para obtener los comentarios de un post
  const fetchComments = async (postID: number) => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/posts/${postID}/comments`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error fetching comments");
      }
      const commentsData = await response.json();
      setComments((prevComments) => ({
        ...prevComments,
        [postID]: commentsData.comments,
      }));
      setVisibleComments((prev) => ({
        ...prev,
        [postID]: true,
      }));
      // Fetch likes count for each comment
      commentsData.comments.forEach((comment: any) => {
        fetchCommentLikesCount(comment.id);
      });
    } catch (error) {
      console.error(`Error fetching comments for post ${postID}:`, error);
    }
  };

  // Fetch likes count for a specific comment
  const fetchCommentLikesCount = async (commentID: number) => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/likes/comments/${commentID}/count`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching comment likes count");
      }

      const likesData = await response.json();

      // Actualiza el estado para almacenar el conteo de likes de cada comentario
      setCommentLikesCount((prevCount) => ({
        ...prevCount,
        [commentID]: likesData.comment_likes_count,
      }));
    } catch (error) {
      console.error(
        `Error fetching likes count for comment ${commentID}:`,
        error
      );
    }
  };

  // Función para agregar un nuevo comentario
  const addComment = async (postID: number) => {
    try {
      const commentText = newComment[postID];
      if (!commentText) return;

      const response = await fetch(
        `https://social-network-production.up.railway.app/api/posts/${postID}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: commentText }),
        }
      );

      if (!response.ok) {
        throw new Error("Error adding comment");
      }

      await fetchComments(postID);

      // Limpia el campo de texto del comentario
      setNewComment((prevNewComment) => ({
        ...prevNewComment,
        [postID]: "",
      }));
      // Actualiza el contador de comentarios en postStats
      // Opcional: Actualiza el contador de comentarios si es necesario
      setPostStats((prevStats) => ({
        ...prevStats,
        [postID]: {
          ...prevStats[postID],
          comments: (prevStats[postID]?.comments || 0) + 1,
        },
      }));
    } catch (error) {
      console.error(`Error adding comment to post ${postID}:`, error);
    }
  };

  // Función para manejar el toggle de likes en comentarios
  const toggleCommentLike = async (commentID: number) => {
    try {
      const isLiked = likedComments ? likedComments[commentID] : false;
      const endpoint = isLiked
        ? `https://social-network-production.up.railway.app/api/comments/${commentID}/dislike`
        : `https://social-network-production.up.railway.app/api/comments/${commentID}/like`;

      const method = isLiked ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          isLiked ? "Error al quitar el like" : "Error al dar like"
        );
      }

      setLikedComments((prevLikedComments) => ({
        ...prevLikedComments,
        [commentID]: !isLiked,
      }));
      // Actualizar el contador de likes
      setCommentLikesCount((prevCount) => ({
        ...prevCount,
        [commentID]: prevCount[commentID] + (isLiked ? -1 : 1),
      }));
    } catch (error) {
      console.error(`Error toggling like for comment ${commentID}:`, error);
    }
  };

  const fetchUserCommentLikes = async () => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/likes/comments`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching user comment likes");
      }

      const likedCommentsData: number[] = await response.json();

      // Convertimos la lista de comment IDs en un mapa para un acceso más rápido
      const likedCommentsMap = likedCommentsData?.reduce(
        (acc: Record<number, boolean>, commentID: number) => {
          acc[commentID] = true;
          return acc;
        },
        {}
      );

      setLikedComments(likedCommentsMap);
    } catch (error) {
      console.error("Error fetching user comment likes:", error);
    }
  };
  // Fetch stats and creator info for all posts when homeData changes
  useEffect(() => {
    const fetchData = async () => {
      if (homeData?.pages) {
        // Fetch stats and creator info for all posts
        homeData.pages.forEach((page) => {
          page.posts.forEach((post: any) => {
            fetchPostStats(post.id);
          });
        });

        // Fetch user likes
        await fetchUserLikes();
        await fetchUserCommentLikes();
      }
    };

    fetchData();
  }, [homeData]);

  // Función para buscar usuarios en el backend
  const fetchFilteredUsers = async (term: string) => {
    try {
      setShowNoResults(false); // Ocultar mensaje mientras se busca
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/search?query=${term}&limit=10`,
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

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers([]);
      setShowNoResults(false); // Ocultar mensaje si no hay texto
    } else {
      const delayDebounceFn = setTimeout(() => {
        fetchFilteredUsers(searchTerm);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm]);

  if (homeLoading || userLoading) {
    return <div>Loading...</div>;
  }

  if (homeError) {
    return <div>Error: {homeError.message}</div>;
  }

  if (userError) {
    return <div>Error: {userError.message}</div>;
  }

  return (
    <div>
      <div
        className="
          header
          grid grid-cols-1 md:grid-cols-3
          items-center
          gap-4
          px-4 py-4 mt-10
          w-full max-w-5xl mx-auto
        "
      >
        {/* Logo */}
        <div className="flex justify-center md:justify-start items-center mb-2 md:mb-0 select-none">
          <h1 className="text-4xl md:text-5xl font-archivo text-white tracking-tighter text-center md:text-left">
            Fle<span className="text-lime-400">X</span>in.
          </h1>
        </div>

        {/* SearchBar + Messages (mobile) */}
        <div className="flex w-full md:hidden flex-row items-center justify-center gap-2 relative">
          <div className="w-full max-w-md">
            <SearchBar
              value={searchTerm}
              placeholder="Buscar usuario..."
              onChange={(val: string) => setSearchTerm(val)}
              className="w-full"
            />
            {filteredUsers.length > 0 && (
              <ul className="mt-2 border rounded-md shadow divide-y z-20 absolute top-full w-full bg-zinc-900">
                {filteredUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center p-4 space-x-4 cursor-pointer"
                    onClick={() => router.push(`/${user.user_name}/profile`)}
                  >
                    <Image
                      src={user.profile_picture || "/teddy.webp"}
                      alt={`${user.full_name}'s avatar`}
                      width={1000}
                      height={1000}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm">@{user.user_name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {showNoResults && searchTerm && filteredUsers.length === 0 && (
              <div className="mt-2 text-center text-sm text-gray-400 border rounded-md shadow divide-y z-20 absolute top-full w-full bg-zinc-900">
                No se encontraron usuarios.
              </div>
            )}
          </div>
          {/* Messages Icon (mobile) */}
          <button
            onClick={() => router.push(`/${user?.user_name}/messages`)}
            className="ml-2 text-white hover:text-lime-400 transition-all"
          >
            <MessageCircle size={32} />
          </button>
        </div>

        {/* SearchBar (desktop) */}
        <div className="relative w-full hidden md:flex justify-center">
          <div className="w-full max-w-md">
            <SearchBar
              value={searchTerm}
              placeholder="Buscar usuario..."
              onChange={(val: string) => setSearchTerm(val)}
              className="w-full"
            />
            {filteredUsers.length > 0 && (
              <ul className="mt-2 border rounded-md shadow divide-y z-20 absolute top-full w-full bg-zinc-900">
                {filteredUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center p-4 space-x-4 cursor-pointer"
                    onClick={() => router.push(`/${user.user_name}/profile`)}
                  >
                    <Image
                      src={user.profile_picture || "/teddy.webp"}
                      alt={`${user.full_name}'s avatar`}
                      width={1000}
                      height={1000}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm">@{user.user_name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {showNoResults && searchTerm && filteredUsers.length === 0 && (
              <div className="mt-2 text-center text-sm text-gray-400 border rounded-md shadow divide-y z-20 absolute top-full w-full bg-zinc-900">
                No se encontraron usuarios.
              </div>
            )}
          </div>
        </div>

        {/* Messages Icon (desktop) */}
        <div className="hidden md:flex justify-center md:justify-end items-center mt-2 md:mt-0">
          <button
            onClick={() => router.push(`/${user?.user_name}/messages`)}
            className="relative text-white hover:text-lime-400 transition-all"
          >
            <MessageCircle size={32} />
          </button>
        </div>
      </div>

      <ul className="flex flex-wrap justify-center mb-3 gap-2 px-4 py-2">
        {userData ? (
          userData.map((topic: any) => (
            <li
              key={topic.id}
              className={`
                transition-all duration-200
                px-5 py-2 rounded-full text-sm font-semibold shadow-lg cursor-pointer border-2
                flex items-center gap-2
                ${
            selectedTopicId === topic.id
              ? "bg-gradient-to-r from-lime-300 via-lime-400 to-lime-500 text-black border-lime-600 scale-105 ring-2 ring-lime-400"
              : "bg-gradient-to-r from-white via-white to-gray-100 text-white border-gray-200 hover:scale-105 hover:ring-2 hover:ring-gray-200"
            }
              `}
              style={{
                boxShadow:
                  selectedTopicId === topic.id
                    ? "0 4px 20px 0 rgba(163, 230, 53, 0.25)"
                    : "0 2px 8px 0 rgba(0,0,0,0.06)",
              }}
              onClick={() =>
                setSelectedTopicId((prev) =>
                  prev === topic.id ? null : topic.id
                )
              }
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{
                  background:
                    selectedTopicId === topic.id ? "#84cc16" : "#d1d5db",
                }}  
              ></span>
              {topic.name}
            </li>
          ))
        ) : (
          <li className="text-gray-500">No topics available</li>
        )}
      </ul>
      <div className="flex flex-col gap-8 mb-32">
        <ul className="flex flex-wrap gap-4 justify-center">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                postStats={postStats}
                likedPosts={likedPosts}
                visibleComments={visibleComments}
                comments={comments}
                newComment={newComment}
                toggleLike={toggleLike}
                fetchComments={fetchComments}
                toggleCommentLike={toggleCommentLike}
                setNewComment={setNewComment}
                commentLikesCount={commentLikesCount}
                likedComments={likedComments}
                addComment={addComment}
                currentUser={userData}
                refreshPosts={fetchNextPage}
                commentsCount={postStats[post.id]?.comments ?? 0}
              />
            ))
          ) : (
            <li>No hay publicaciones aún.</li>
          )}
        </ul>
        {hasNextPage && !selectedTopicId && (
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
      </div>
    </div>
  );
}
