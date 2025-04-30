"use client";
import { useUserContext } from "@/contexts/UserContext";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";

export default function Profile() {
  const { user } = useUserContext();
  const authenticatedUserID = user?.id; 

  const { user_name } = useParams(); // Obtener el parámetro de la ruta
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<{ posts: any[] }>({ posts: [] });
  
  const [postStats, setPostStats] = useState<Record<number, { likes: number; comments: number }>>({});
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [visibleComments, setVisibleComments] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [likedComments, setLikedComments] = useState<Record<number, boolean>>({});
  const [commentLikesCount, setCommentLikesCount] = useState<Record<number, number>>({});

  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data based on user_name
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user_name) return;

      try {
        const response = await fetch(`http://localhost:3000/api/users/${user_name}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error fetching user data");
        }

        const userData = await response.json();
        setUserData(userData);

        // Fetch user posts
        const postsResponse = await fetch(`http://localhost:3000/api/users/${userData.id}/posts`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!postsResponse.ok) {
          throw new Error("Error fetching user posts");
        }

        const postsData = await postsResponse.json();
        setUserPosts(postsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user_name]);

  // Fetch stats for each post
  const fetchPostStats = async (postID: number) => {
    try {
      const [likesResponse, commentsResponse] = await Promise.all([
        fetch(`http://localhost:3000/api/likes/posts/${postID}/count`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        }),
        fetch(`http://localhost:3000/api/posts/${postID}/comments/count`, {
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
            "$1"
          )}`,
        },
      });

      if (!response.ok) {
        throw new Error(isLiked ? "Error al quitar el like" : "Error al dar like");
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
      const response = await fetch(`http://localhost:3000/api/posts/${postID}/comments`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`,
        },
      });
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
  
      const response = await fetch(`http://localhost:3000/api/posts/${postID}/comments`, {
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
      });
  
      if (!response.ok) {
        throw new Error("Error adding comment");
      }
  
      const newCommentData = await response.json();
  
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
      const response = await fetch(`http://localhost:3000/api/likes/comments/${commentID}/count`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.replace(
            /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
            "$1"
          )}`,
        },
      });

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
      console.error(`Error fetching likes count for comment ${commentID}:`, error);
    }
  }

  useEffect(() => {
    const fetchPostStats = async (postID: number) => {
      try {
        const [likesResponse, commentsResponse] = await Promise.all([
          fetch(`http://localhost:3000/api/likes/posts/${postID}/count`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${document.cookie.replace(
                /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
                "$1"
              )}`,
            },
          }),
          fetch(`http://localhost:3000/api/posts/${postID}/comments/count`, {
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
        const response = await fetch(`http://localhost:3000/api/users/likes/posts`, {
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
      const response = await fetch(`http://localhost:3000/api/users/${userID}/followers/count`, {
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
      const response = await fetch(`http://localhost:3000/api/users/${userID}/follows/count`, {
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
      const response = await fetch(`http://localhost:3000/api/users/follow/${userID}`, {
        method: "POST",
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
      const response = await fetch(`http://localhost:3000/api/users/unfollow/${userID}`, {
        method: "DELETE",
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
            "$1"
          )}`,
        },
      });

      if (!response.ok) {
        throw new Error(isLiked ? "Error al quitar el like" : "Error al dar like");
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
      const response = await fetch(`http://localhost:3000/api/users/likes/comments`, {
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
        throw new Error("Error fetching user comment likes");
      }
      const likedCommentsData = await response.json();
      // Convertimos la lista de comment IDs en un mapa para un acceso más rápido
      const likedCommentsMap = likedCommentsData.reduce((acc: Record<number, boolean>, commentID: number) => {
        acc[commentID] = true;
        return acc;
      }, {});
      setLikedComments(likedCommentsMap);
    } catch (error) {
      console.error("Error fetching user comment likes:", error);
    }
  };

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
          const response = await fetch(`http://localhost:3000/api/users/${userData.id}/following`, {
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
            throw new Error("Error checking follow status");
          }
  
          const data = await response.json();
          setIsFollowing(data.is_following);
          console.log(isFollowing);
        } catch (error) {
          console.error("Error checking follow status:", error);
        }
      };
  
      checkIfFollowing();
    }
  }, [userData]);

  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  // Cambiar el user.?id para que se tome correctamente, haciendo el pull se solucionara diria
  // Ya que marc lo corrigio en su branch
  return (
    <div className="min-h-screen p-8 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
        <p className="text-gray-600">Bienvenido, {userData?.name || "Usuario"}!</p>
        {userData?.id != user?.id && (
        <button onClick={() => (isFollowing ? unfollowUser(userData.id) : followUser(userData.id))} className={`mt-4 px-4 py-2 rounded ${isFollowing ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}>
          {isFollowing ? "Dejar de seguir" : "Seguir"}
        </button>
        )}
      </header>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold">Información Personal</h2>
        <div className="mt-4 space-y-2">
          <p><strong>Nombre:</strong> {userData?.name}</p>
          <p><strong>Email:</strong> {userData?.email}</p>
          <p><strong>Seguidores:</strong> {followersCount}</p>
          <p><strong>Siguiendo:</strong> {followingCount}</p>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Publicaciones</h2>
        <ul className="flex flex-wrap gap-4 justify-center">
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
              />
            ))
          ) : (
            <li>No hay publicaciones aún.</li>
          )}
        </ul>
      </section>
    </div>
  );
}