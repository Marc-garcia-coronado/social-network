"use client";
import { useEffect, useState } from "react";
import { useUserContext } from "@/contexts/UserContext";
import useHome from "@/hooks/useHome";
import useUser from "@/hooks/useUser";

export default function Home() {
  const { user } = useUserContext();
  const userID: number = user?.id ?? 0;

  const { data: homeData, error: homeError, isLoading: homeLoading } = useHome();
  const { data: userData, error: userError, isLoading: userLoading } = useUser(userID);

  const [postStats, setPostStats] = useState<Record<number, { likes: number; comments: number }>>({});
  const [postCreators, setPostCreators] = useState<Record<number, { name: string}>>({});
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  const [comments, setComments] = useState<Record<number, any[]>>({});  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [likedComments, setLikedComments] = useState<Record<number, boolean>>({});
  const [commentLikesCount, setCommentLikesCount] = useState<Record<number, number>>({});
  const [visibleComments, setVisibleComments] = useState<Record<number, boolean>>({});

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
  // Fetch creator info for a specific post
  const fetchPostCreator = async (user: any) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
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
        throw new Error("Error fetching post creator");
      }
      const creatorData = await response.json();
      setPostCreators((prevCreators) => ({
        ...prevCreators,
        [user.id]: {
          name: creatorData.user_name
          //picture: creatorData.profile_picture,
        },
      }));
      console.log(creatorData)
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
  
      // Convertimos la lista de post IDs en un mapa para un acceso más rápido
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

  // Función para obtener los comentarios de un post
  const fetchComments = async (postID: number) => {
    if (visibleComments[postID]) {
    // Si los comentarios ya están visibles, ocultarlos
    setVisibleComments((prev) => ({
      ...prev,
      [postID]: false,
    }));
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/posts/${postID}/comments`, {
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
      throw new Error("Error fetching comments");
    }

    const commentsData = await response.json();

    // Actualiza el estado para almacenar solo el array de comentarios
    setComments((prevComments) => ({
      ...prevComments,
      [postID]: commentsData.comments,
    }));

    // Marcar los comentarios como visibles
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
  
      // Actualiza el estado para agregar el nuevo comentario al array existente
      setComments((prevComments) => ({
        ...prevComments,
        [postID]: [...(prevComments[postID] || []), newCommentData],
      }));
  
      // Limpia el campo de texto del comentario
      setNewComment((prevNewComment) => ({
        ...prevNewComment,
        [postID]: "",
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
            /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
            "$1"
          )}`,
        },
      });
  
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
    if (homeData?.posts) {
      // Fetch stats and creator info for all posts
      homeData.posts.forEach((post: any) => {
        fetchPostStats(post.id);
        fetchPostCreator(post.user);
      });

      // Fetch user likes
      await fetchUserLikes();
      await fetchUserCommentLikes(); // Llamada para obtener los likes de los comentarios
    }
  };

  fetchData();
}, [homeData]);

if (homeLoading || userLoading) {
  return <div>Loading...</div>;
}

if (homeError) {
  return <div>Error: {homeError.message}</div>;
}

if (userError) {
  return <div>Error: {userError.message}</div>;
}
console.log(userID);
return (
  <div>
    <h1>Posts</h1>
    <ul>
      {homeData?.posts ? (
        homeData.posts.map((post: any) => (
          <li key={post.id}>
            <div>
              <strong>{post.title}</strong>
            </div>
            <div>
              Likes: {postStats[post.id]?.likes ?? "Loading..."} - Comments:{" "}
              {postStats[post.id]?.comments ?? "Loading..."}
            </div>
            <div>
              <button onClick={() => toggleLike(post.id)}>
                {likedPosts[post.id] ? "Quitar Like" : "Dar Like"}
              </button>
            </div>
            <div>
              <button onClick={() => fetchComments(post.id)}>
                {visibleComments[post.id] ? "Ocultar Comentarios" : "Mostrar Comentarios"}
              </button>
              {visibleComments[post.id] && (
                <ul>
                  {(comments[post.id] || []).map((comment: any) => (
                    <li key={comment.id}>
                      <div>{comment.body}</div>
                      <div>Likes: {commentLikesCount[comment.id] ?? "Loading..."}</div>
                      <button onClick={() => toggleCommentLike(comment.id)}>
                        {likedComments[comment.id] ? "Quitar Like" : "Dar Like"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <input
                type="text"
                value={newComment[post.id] || ""}
                onChange={(e) =>
                  setNewComment((prevNewComment) => ({
                    ...prevNewComment,
                    [post.id]: e.target.value,
                  }))
                }
                placeholder="Escribe un comentario..."
              />
              <button onClick={() => addComment(post.id)}>Enviar</button>
            </div>
          </li>
        ))
      ) : (
        <li>No posts available</li>
      )}
    </ul>
    <h1>User Topics</h1>
    <ul>
      {userData ? (
        userData.map((topic: any) => <li key={topic.id}>{topic.name}</li>)
      ) : (
        <li>No topics available</li>
      )}
    </ul>
  </div>
);
}