import React, { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { DropdownCardMenu } from "./DropdownCardMenu";
import { CommentsDrawer } from "./CommentsDrawer";
import Image from "next/image";


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
  }) => {
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
      }}    >
      {/* Post Image */}
      {post.picture && (
        <div className="absolute inset-0">
          <Image
            src={/*post.picture ||*/ "/teddy.webp"}
            alt="Post Image"
            className="w-full h-full object-cover"
            width={450}
            height={450}
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
              className={`w-6 h-6 transition-colors duration-300 ${
                likedPosts[post.id] ? "text-white" : "text-gray-300"
              }`}
            />
          </button>
          <span>{postStats[post.id]?.likes ?? "Loading..."}</span>
          </div>
          {post.user.id === currentUser?.id && (
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
          <img
            src={post.user.profilePicture || "/teddy.webp"}
            alt="User Avatar"
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
          disableDoubleClick={() => setIsDoubleClickEnabled(false)} 
          enableDoubleClick={() => setIsDoubleClickEnabled(true)}   
        />    
          <button className="text-white hover:text-gray-200">
          {/* Placeholder for future icon */}
          <Send />
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Comentarios
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Comments List */}
            <ul className="space-y-4 max-h-96 overflow-y-auto">
              {(comments[post.id] || []).map((comment: any, index: number) => (
                <li
                  key={
                    comment.id
                      ? `${post.id}-${comment.id}`
                      : `${post.id}-index-${index}`
                  }
                  className="border-b pb-2"
                >
                  <p className="text-white-700">{comment.body}</p>
                  <div className="text-sm text-white-500">
                    Likes: {commentLikesCount[comment.id] ?? "Loading..."}
                  </div>
                  <button
                    onClick={() => toggleCommentLike(comment.id)}
                    className={`text-sm ${
                      likedComments[comment.id]
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}
                  >
                    {likedComments[comment.id] ? "Quitar Like" : "Dar Like"}
                  </button>
                </li>
              ))}
            </ul>

            {/* Add Comment Section */}
            <div className="mt-4">
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
                className="w-full border rounded p-2"
              />
              <button
                onClick={() => addComment(post.id)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default PostCard;
