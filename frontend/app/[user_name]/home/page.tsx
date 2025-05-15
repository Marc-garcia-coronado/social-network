"use client";
import { useEffect, useState } from "react";
import { useUserContext } from "@/contexts/UserContext";
import useHome from "@/hooks/useHome";
import useUser from "@/hooks/useUser";
import DockComponent from "@/components/DockComponent";
import Link from "next/link";
import { User } from "@/lib/types";
import PostCard from "@/components/PostCard";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const { user } = useUserContext();
  const userID: number = user?.id ?? 0;

  const {
    data: homeData,
    error: homeError,
    isLoading: homeLoading,
  } = useHome();
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useUser(userID);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(""); // Estado para la barra de búsqueda
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]); // Estado para los usuarios filtrados
  const [isSearching, setIsSearching] = useState(false); // Estado para mostrar un indicador de búsqueda
  const [showNoResults, setShowNoResults] = useState(false); // Nuevo estado

  const [postStats, setPostStats] = useState<
    Record<number, { likes: number; comments: number }>
  >({});
  const [postCreators, setPostCreators] = useState<
    Record<number, { name: string }>
  >({});
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [likedComments, setLikedComments] = useState<Record<number, boolean>>(
    {},
  );
  const [commentLikesCount, setCommentLikesCount] = useState<
    Record<number, number>
  >({});
  const [visibleComments, setVisibleComments] = useState<
    Record<number, boolean>
  >({});

  // Fetch likes and comments count for a specific post
  const fetchPostStats = async (postID: number) => {
    try {
      const [likesResponse, commentsResponse] = await Promise.all([
        fetch(`http://localhost:3000/api/likes/posts/${postID}/count`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1",
            )}`,
          },
        }),
        fetch(`http://localhost:3000/api/posts/${postID}/comments/count`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1",
            )}`,
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
  // Fetch creator info for a specific post
  const fetchPostCreator = async (user: User) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${user.id}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1",
            )}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Error fetching post creator");
      }
      const creatorData = await response.json();
      setPostCreators((prevCreators) => ({
        ...prevCreators,
        [user.id]: {
          name: creatorData.user_name,
          //picture: creatorData.profile_picture,
        },
      }));
    } catch (error) {
      console.error(`Error fetching creator for post ${user.id}:`, error);
    }
  };
  // Función para manejar el toggle de likes
  const toggleLike = async (postID: number) => {
    try {
      const isLiked = likedPosts[postID];
      const endpoint = isLiked
        ? `http://localhost:3000/api/posts/${postID}/dislike`
        : `http://localhost:3000/api/posts/${postID}/like`;

      const method = isLiked ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.replace(
            /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
            "$1",
          )}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          isLiked ? "Error al quitar el like" : "Error al dar like",
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
        `http://localhost:3000/api/users/likes/posts`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1",
            )}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error fetching user likes");
      }

      const likedPostsData = await response.json();

      // Convertimos la lista de post IDs en un mapa para un acceso más rápido
      const likedPostsMap = likedPostsData.reduce(
        (acc: Record<number, boolean>, postID: number) => {
          acc[postID] = true;
          return acc;
        },
        {},
      );

      setLikedPosts(likedPostsMap);
    } catch (error) {
      console.error("Error fetching user likes:", error);
    }
  };

  // Función para obtener los comentarios de un post
  const fetchComments = async (postID: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/posts/${postID}/comments`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`,
          },
        },
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
        `http://localhost:3000/api/likes/comments/${commentID}/count`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
              "$1",
            )}`,
          },
        },
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
        error,
      );
    }
  };

  // Función para agregar un nuevo comentario
  const addComment = async (postID: number) => {
    try {
      const commentText = newComment[postID];
      if (!commentText) return;

      const response = await fetch(
        `http://localhost:3000/api/posts/${postID}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1",
            )}`,
          },
          body: JSON.stringify({ body: commentText }),
        },
      );

      if (!response.ok) {
        throw new Error("Error adding comment");
      }

      const newCommentData = await response.json();

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
      const isLiked = likedComments[commentID];
      const endpoint = isLiked
        ? `http://localhost:3000/api/comments/${commentID}/dislike`
        : `http://localhost:3000/api/comments/${commentID}/like`;

      const method = isLiked ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.replace(
            /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
            "$1",
          )}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          isLiked ? "Error al quitar el like" : "Error al dar like",
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
        `http://localhost:3000/api/users/likes/comments`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
              "$1",
            )}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error fetching user comment likes");
      }

      const likedCommentsData: number[] = await response.json();

      // Convertimos la lista de comment IDs en un mapa para un acceso más rápido
      const likedCommentsMap = likedCommentsData.reduce(
        (acc: Record<number, boolean>, commentID: number) => {
          acc[commentID] = true;
          return acc;
        },
        {},
      );

      setLikedComments(likedCommentsMap);
    } catch (error) {
      console.error("Error fetching user comment likes:", error);
    }
  };
  // Fetch stats and creator info for all posts when homeData changes
  useEffect(() => {
    const fetchData = async () => {
      if (homeData?.posts) {
        // Fetch stats and creator info for all posts
        homeData.posts.forEach((post: any) => {
          fetchPostStats(post.id);
          fetchPostCreator(post.user);
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
      setIsSearching(true);
      setShowNoResults(false); // Ocultar mensaje mientras se busca
      const response = await fetch(
        `http://localhost:3000/api/users/search?query=${term}&limit=10`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1",
            )}`,
          },
        },
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
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers([]);
      setShowNoResults(false); // Ocultar mensaje si no hay texto
    } else {
      const delayDebounceFn = setTimeout(() => {
        fetchFilteredUsers(searchTerm);
      }, 500); // Debounce de 500ms
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm]);

  console.log(filteredUsers);
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
      <div className="header flex items-center justify-between px-4 py-2 mt-20">
        {/* Logo */}
        <div className="logo">
          <Image src="/logo.png" width={24} height={24} alt="Logo" className="h-8 cursor-pointer" />
        </div>

        {/* Barra de búsqueda */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black text-center text-black"
          />
        </div>

        {/* Messages Icon */}
        <div className="messages">
          <button onClick={() => router.push("/messages")} className="relative">
            <MessageSquare size={32} />
          </button>
        </div>
      </div>
      {/* Lista de resultados */}
      {filteredUsers.length > 0 && (
        <ul className="mt-4 bg-white border rounded-md shadow divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <li
              key={user.id}
              className="flex items-center p-4 space-x-4 cursor-pointer"
              onClick={() => router.push(`/${user.user_name}/profile`)}
            >
              <img
                src={user.profilePicture || "/teddy.webp"}
                alt={`${user.full_name}'s avatar`}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">{user.full_name}</p>
                <p className="text-sm text-gray-500">@{user.user_name}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Mensaje si no hay resultados */}
      {showNoResults && searchTerm && filteredUsers.length === 0 && (
        <p className="mt-4 text-gray-500">No se encontraron usuarios.</p>
      )}

      <ul className="flex flex-wrap gap-2 px-4 py-2">
        {userData ? (
          userData.map((topic: any) => (
            <li
              key={topic.id}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium shadow"
            >
              {topic.name}
            </li>
          ))
        ) : (
          <li className="text-gray-500">No topics available</li>
        )}
      </ul>
      <div className="stories">{/*Aqui irçan las historias */}</div>
      <ul className="flex flex-wrap gap-4 justify-center">
        {homeData?.posts ? (
          homeData.posts.map((post: any) => (
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
            />
          ))
        ) : (
          <p>No hay publicaciones disponibles.</p>
        )}
      </ul>
    </div>
  );
}
