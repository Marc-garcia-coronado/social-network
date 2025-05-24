"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { DropdownCardMenu } from "./DropdownCardMenu";
import { CommentsDrawer } from "./CommentsDrawer";
import Image from "next/image";
import { useUserContext } from "@/contexts/UserContext";

interface PostCardProps {
  post: any;
  postStats: Record<number, { likes: number; comments: number }>;
  likedPosts: Record<number, boolean>;
  visibleComments: Record<number, boolean>;
  comments: Record<number, any[]>;
  newComment: Record<number, string>;
  toggleLike: (postId: number) => void;
  fetchComments: (postId: number) => void;
  toggleCommentLike: (commentId: number) => void;
  setNewComment: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  commentLikesCount: Record<number, number>;
  likedComments: Record<number, boolean>;
  addComment: (postId: number) => void;
  currentUser: { id: number };
  refreshPosts: () => void;
  commentsCount: number;
}
const PostCard: React.FC<PostCardProps> = ({
  currentUser,
  post,
  postStats,
  likedPosts,
  visibleComments,
  comments,
  newComment,
  toggleLike,
  fetchComments,
  toggleCommentLike,
  setNewComment,
  commentLikesCount,
  likedComments,
  addComment,
  refreshPosts,
  commentsCount,
}) => {
  const { user } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDoubleClickEnabled, setIsDoubleClickEnabled] = useState(true);
  const router = useRouter();

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <li
      key={post.id}
      className="relative bg-white shadow-md rounded-lg w-[350px] sm:w-[350px] md:w-[450px] h-[350px] sm:h-[350px] md:h-[450px] overflow-hidden"
      onDoubleClick={() => {
        if (isDoubleClickEnabled) toggleLike(post.id);
      }}
    >
      {/* Post Image */}
      {post.picture.Valid && (
        <div className="absolute inset-0">
          <Image
            src={post.picture.String}
            alt="Post Image"
            width={1000}
            height={1000}
            className="w-full h-full object-cover pointer-events-none "
            priority
          />
        </div>
      )}

      {/* Likes Section */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="text-white text-sm font-medium flex items-center space-x-2">
          <button
            onClick={() => toggleLike(post.id)}
            className={`p-2 rounded-full transition-all duration-300 ${
              likedPosts[post.id] ? "bg-red-500 animate-like" : "bg-transparent"
            }`}
          >
            <Heart
              className={`w-6 h-6 transition-colors  duration-300 ${
                likedPosts[post.id]
                  ? "text-white"
                  : "text-gray-300  hover:text-lime-400"
              }`}
            />
          </button>
          <span>{postStats[post.id]?.likes ?? "Loading..."}</span>
        </div>
        {post.user.id === user?.id && (
          <DropdownCardMenu
            postId={post.id}
            userId={post.user.id}
            refreshPosts={refreshPosts}
            postTitle={post.title}
            postTopicId={post.topic.id}
          />
        )}
      </div>

      {/* Footer Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 flex items-center justify-between z-10">
        {/* User Info */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => router.push(`/${post.user.user_name}/profile`)}
        >
          <Image
            src={post.user.profile_picture || "/teddy.webp"}
            alt="User Avatar"
            width={24}
            height={24}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col">
            <div>
              <span className="text-sm font-medium">{post.title}</span>
              <span className="text-sm font-extralight">
                {" - " +
                  formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
              </span>
            </div>
            <span className="text-sm font-light">{post.user.user_name}</span>
          </div>
        </div>

        {/* Icons */}
        <div className="flex space-x-4">
          <CommentsDrawer
            post={post}
            comments={comments}
            newComment={newComment}
            setNewComment={setNewComment}
            addComment={addComment}
            commentLikesCount={commentLikesCount}
            likedComments={likedComments}
            fetchComments={fetchComments}
            toggleCommentLike={toggleCommentLike}
            commentsCount={commentsCount ?? 0}
            disableDoubleClick={() => setIsDoubleClickEnabled(false)}
            enableDoubleClick={() => setIsDoubleClickEnabled(true)}
          />
        </div>
      </div>
    </li>
  );
};

export default PostCard;
