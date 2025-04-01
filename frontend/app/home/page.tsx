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
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({}); // Estado para manejar likes por post

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

// Fetch stats and creator info for all posts when homeData changes
useEffect(() => {
  if (homeData?.posts) {
    homeData.posts.forEach((post: any) => {
      fetchPostStats(post.id);
      fetchPostCreator(post.user); // Assuming `creator_id` is available in the post data
    });
  }
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
              Creator:{" "}
              {postCreators[post.user.id]?.name ?? "Loading..."}{" "}
              {/* <img
                src={postCreators[post.id]?.picture ?? ""}
                alt="Creator"
                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
              /> */}
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