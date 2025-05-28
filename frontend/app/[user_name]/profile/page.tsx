"use client";
import { useUserContext } from "@/contexts/UserContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import { SettingsSheet } from "@/components/SettingsSheet";
import Image from "next/image";
import { Event } from "@/lib/types";
import EventComponent from "@/components/EventComponent";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user } = useUserContext();
  const router = useRouter();

  const { user_name } = useParams(); // Obtener el parámetro de la ruta
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<{ posts: any[] }>({ posts: [] });

  const [postStats, setPostStats] = useState<
    Record<number, { likes: number; comments: number }>
  >({});
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [visibleComments, setVisibleComments] = useState<
    Record<number, boolean>
  >({});
  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [likedComments, setLikedComments] = useState<Record<number, boolean>>(
    {}
  );
  const [commentLikesCount, setCommentLikesCount] = useState<
    Record<number, number>
  >({});

  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"posts" | "events" | "subscribed">(
    "posts"
  );
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [subscribedEvents, setSubscribedEvents] = useState<Event[]>([]); // Nuevo estado
  const [userTopics, setuserTopics] = useState([]);

  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all topics and user topics
    const fetchTopics = async () => {
      try {
        const response = await fetch(
          `https://social-network-production.up.railway.app/api/users/${user?.id}/topics`,
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

  const refreshUserData = async () => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/${user_name}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching user data");
      }

      const userData = await response.json();
      setUserData(userData);
      const postsResponse = await fetch(
        `https://social-network-production.up.railway.app/api/users/${userData.id}/posts`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!postsResponse.ok) {
        throw new Error("Error fetching user posts");
      }
      const postsData = await postsResponse.json();
      setUserPosts(postsData);
    } catch (err: any) {
      console.error("Error refreshing user data:", err.message);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, [user_name]);

  // Fetch de eventos del usuario
  const fetchUserEvents = async (userID: number) => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/${userID}/events`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error fetching user events");
      const data = await response.json();
      setUserEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching user events:", error);
    }
  };

  // Llama a fetchUserEvents cuando el usuario cambie y la pestaña sea "events"
  useEffect(() => {
    if (userData?.id && activeTab === "events") {
      fetchUserEvents(userData.id);
    }
  }, [userData, activeTab]);

  const fetchSubscribedEventsList = async (userID: number) => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/${userID}/events/subscribed`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error fetching subscribed events");
      const data = await response.json();
      setSubscribedEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching subscribed events:", error);
    }
  };

  // Llama a fetchSubscribedEventsList cuando el usuario cambie y la pestaña sea "subscribed"
  useEffect(() => {
    if (
      userData?.id &&
      activeTab === "subscribed" &&
      userData?.id === user?.id
    ) {
      fetchSubscribedEventsList(userData.id);
    }
  }, [userData, activeTab, user]);
  const refreshPosts = async () => {
    try {
      const postsResponse = await fetch(
        `https://social-network-production.up.railway.app/api/users/${userData.id}/posts`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!postsResponse.ok) {
        throw new Error("Error fetching user posts");
      }

      const postsData = await postsResponse.json();
      setUserPosts(postsData);
    } catch (err: any) {
      console.error("Error refreshing posts:", err.message);
    }
  };

  // Fetch stats for each post
  const fetchPostStats = async (postID: number) => {
    try {
      const [likesResponse, commentsResponse] = await Promise.all([
        fetch(`https://social-network-production.up.railway.app/api/likes/posts/${postID}/count`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        }),
        fetch(`https://social-network-production.up.railway.app/api/posts/${postID}/comments/count`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
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

  useEffect(() => {
    if (userPosts?.posts?.length > 0) {
      userPosts.posts.forEach((post) => fetchPostStats(post.id));
    }
  }, [userPosts]);

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
          Authorization: `Bearer ${document.cookie.replace(
            /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
            "$1"
          )}`,
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

  // Función para obtener los comentarios de un post
  const fetchComments = async (postID: number) => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/posts/${postID}/comments`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
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
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
          body: JSON.stringify({ body: commentText }),
        }
      );

      if (!response.ok) {
        throw new Error("Error adding comment");
      }

      await fetchComments(postID);

      // Limpia el campo de entrada del comentario
      setNewComment((prevNewComment) => ({
        ...prevNewComment,
        [postID]: "",
      }));

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

  const fetchCommentLikesCount = async (commentID: number) => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/likes/comments/${commentID}/count`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
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

  useEffect(() => {
    const fetchPostStats = async (postID: number) => {
      try {
        const [likesResponse, commentsResponse] = await Promise.all([
          fetch(`https://social-network-production.up.railway.app/api/likes/posts/${postID}/count`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${document.cookie.replace(
                /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
                "$1"
              )}`,
            },
          }),
          fetch(`https://social-network-production.up.railway.app/api/posts/${postID}/comments/count`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${document.cookie.replace(
                /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
                "$1"
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

    const fetchUserLikes = async () => {
      try {
        const response = await fetch(
          `https://social-network-production.up.railway.app/api/users/likes/posts`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${document.cookie.replace(
                /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
                "$1"
              )}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error fetching user likes");
        }

        const likedPostsData = await response.json();

        const likedPostsMap = likedPostsData.reduce(
          (acc: Record<number, boolean>, postID: number) => {
            acc[postID] = true;
            return acc;
          },
          {}
        );

        setLikedPosts(likedPostsMap);
      } catch (error) {
        console.error("Error fetching user likes:", error);
      }
    };

    if (userPosts?.posts?.length > 0) {
      userPosts.posts.forEach((post) => fetchPostStats(post.id));
      fetchUserLikes();
    }
  }, [userPosts]);

  const fetchFollowersCount = async (userID: number) => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/${userID}/followers/count`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching followers count");
      }

      const data = await response.json();
      setFollowersCount(data.followers_count);
    } catch (error) {
      console.error("Error fetching followers count:", error);
    }
  };

  const fetchFollowingCount = async (userID: number) => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/${userID}/follows/count`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching following count");
      }

      const data = await response.json();
      setFollowingCount(data.follows_count);
    } catch (error) {
      console.error("Error fetching following count:", error);
    }
  };

  const followUser = async (userID: number) => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/follow/${userID}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error following user");
      }

      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1); // Incrementar el contador de seguidores
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const unfollowUser = async (userID: number) => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/unfollow/${userID}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error unfollowing user");
      }

      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1); // Decrementar el contador de seguidores
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };
  // Función para manejar el toggle de likes en comentarios
  const toggleCommentLike = async (commentID: number) => {
    try {
      const isLiked = likedComments?.[commentID];
      const endpoint = isLiked
        ? `https://social-network-production.up.railway.app/api/comments/${commentID}/dislike`
        : `https://social-network-production.up.railway.app/api/comments/${commentID}/like`;

      const method = isLiked ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.replace(
            /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
            "$1"
          )}`,
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
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error fetching user comment likes");
      }
      const likedCommentsData = await response.json();
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

  const fetchSubscribedEvents = async (): Promise<number[]> => {
    const res = await fetch(
      `https://social-network-production.up.railway.app/api/users/${user?.id}/events/subscribed`,
      { credentials: "include" }
    );
    const data = await res.json();
    return data.events.map((event: any) => event.id);
  };

  const { data: subscribedIds = [] } = useQuery({
    queryKey: ["subscribed-events", user?.id],
    queryFn: fetchSubscribedEvents,
    enabled: !!user?.id,
  });

  useEffect(() => {
    fetchSubscribedEvents();
  }, [user]);

  // Llama a fetchUserCommentLikes al cargar el componente
  useEffect(() => {
    fetchUserCommentLikes();
  }, []);

  useEffect(() => {
    if (userData?.id) {
      fetchFollowersCount(userData.id);
      fetchFollowingCount(userData.id);

      // Verificar si el usuario ya está siendo seguido
      const checkIfFollowing = async () => {
        try {
          const response = await fetch(
            `https://social-network-production.up.railway.app/api/users/${userData.id}/following`,
            {
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${document.cookie.replace(
                  /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
                  "$1"
                )}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Error checking follow status");
          }

          const data = await response.json();
          setIsFollowing(data.is_following);
        } catch (error) {
          console.error("Error checking follow status:", error);
        }
      };

      checkIfFollowing();
    }
  }, [userData, isFollowing]);
  console.log(userData);
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div className="min-h-screen">
      <div className="w-full mb-8 grid grid-cols-3 items-center gap-4 px-4 py-4 md:mt-10 relative">
        {/* Columna izquierda vacía */}
        <div />
        {/* Logo centrado en la columna del medio */}
        <div className="flex justify-center items-center select-none">
          <h1 className="text-4xl md:text-5xl font-archivo text-white tracking-tighter text-center">
            Fle<span className="text-lime-400">X</span>in.
          </h1>
        </div>
        {/* Settings a la derecha */}
        <div className="flex justify-end items-center">
          {userData?.id === user?.id && (
            <SettingsSheet refreshUserData={refreshUserData} />
          )}
        </div>
      </div>
      {/* ...resto del código... */}
      <header className="flex flex-col justify-center">
        <section className="flex justify-center">
          <Image
            src={userData?.profile_picture || "/teddy.webp"}
            alt={userData?.user_name || "Avatar"}
            width={1000}
            height={1000}
            className="w-40 h-40 rounded-full object-cover"
          />
        </section>
        <section className="mb-8 mt-4 space-y-2">
          <h2 className="text-center">
            <strong>{userData?.full_name || "Nombre"}</strong>
          </h2>
          <p className="text-center text-gray-300">
            {"@" + userData?.user_name || ""}
          </p>
          <p className="text-center">{userData?.bio || ""}</p>
          <p className="text-center">
            <strong>
              {followersCount} seguidores | {followingCount} siguiendo
            </strong>
          </p>
          {userData?.id != user?.id && (
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() =>
                  isFollowing
                    ? unfollowUser(userData.id)
                    : followUser(userData.id)
                }
                variant={isFollowing ? "destructive" : "default"}
                className={
                  isFollowing
                    ? "mt-4 min-w-[140px] rounded-full"
                    : "mt-4 min-w-[140px] rounded-full bg-lime-400 text-black hover:bg-lime-300"
                }
              >
                {isFollowing ? "Dejar de seguir" : "Seguir"}
              </Button>
              <Button
                onClick={() =>
                  router.push(
                    `/${user?.user_name}/messages/${userData.id}`
                  )
                }
                className="mt-4 min-w-[140px] rounded-full"
              >
                Mensaje
              </Button>
            </div>
          )}
        </section>
      </header>
      <section className="pb-6">
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`text-xl font-semibold pb-1 transition-all ${
              activeTab === "posts"
                ? "underline underline-offset-4 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            Publicaciones
          </button>
          <button
            className={`text-xl font-semibold pb-1 transition-all ${
              activeTab === "events"
                ? "underline underline-offset-4 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("events")}
          >
            Eventos
          </button>
          {userData?.id === user?.id && (
            <button
              className={`text-xl font-semibold pb-1 transition-all ${
                activeTab === "subscribed"
                  ? "underline underline-offset-4 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("subscribed")}
            >
              Apuntado
            </button>
          )}
        </div>

        {/* Contenido según la pestaña */}
        {activeTab === "posts" ? (
          <>
            <ul className="flex flex-wrap gap-4 justify-center mb-32">
              {userPosts?.posts?.length > 0 ? (
                userPosts.posts.map((post) => (
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
                    refreshPosts={refreshPosts}
                    commentsCount={postStats[post.id]?.comments ?? 0}
                  />
                ))
              ) : (
                <li>No hay publicaciones aún.</li>
              )}
            </ul>
          </>
        ) : activeTab === "events" ? (
          <>
            <ul className="flex flex-wrap gap-4 justify-center mb-32">
              {userEvents.length > 0 ? (
                userEvents.map((event) => (
                  <EventComponent
                    key={event.id}
                    event={event}
                    topics={userTopics}
                    apuntado={subscribedIds.includes(event?.id)}
                    refetchEvents={() => fetchUserEvents(userData.id)}
                  />
                ))
              ) : (
                <li>No hay eventos aún.</li>
              )}
            </ul>
          </>
        ) : (
          <>
            <ul className="flex flex-wrap gap-4 justify-center mb-32">
              {subscribedEvents.length > 0 ? (
                subscribedEvents.map((event) => (
                  <EventComponent
                    key={event.id}
                    event={event}
                    topics={[]}
                    apuntado={true}
                    refetchEvents={() => fetchSubscribedEventsList(userData.id)}
                  />
                ))
              ) : (
                <li>No hay eventos apuntados aún.</li>
              )}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
