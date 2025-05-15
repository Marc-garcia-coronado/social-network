"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Forward, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";

interface CommentsDrawerProps {
  post: any;
  comments: Record<number, any[]>;
  newComment: Record<number, string>;
  setNewComment: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  addComment: (postId: number) => void;
  commentLikesCount: Record<number, number>;
  likedComments: Record<number, boolean>;
  fetchComments: (postId: number) => void;
  toggleCommentLike: (commentId: number) => void;
}
export function CommentsDrawer({
  post,
  comments,
  newComment,
  setNewComment,
  addComment,
  commentLikesCount,
  likedComments,
  fetchComments,
  toggleCommentLike,
}: CommentsDrawerProps) {
  const openDrawer = async () => {
    await fetchComments(post.id);
  };
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button onClick={openDrawer} className="text-white hover:text-gray-200">
          <MessageCircle />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-xl p-4">
          <DrawerHeader>
            <DrawerTitle>Comentarios</DrawerTitle>
            <DrawerDescription>
              Lee y agrega comentarios sobre esta publicación.
            </DrawerDescription>
          </DrawerHeader>

          {/* Lista de comentarios */}
          <div className="space-y-4 max-h-72 overflow-y-auto">
            {(comments[post.id] || []).length > 0 ? (
              (comments[post.id] || []).map((comment, index) => (
                <div
                  onDoubleClick={() => toggleCommentLike(comment.id)}
                  key={comment.id ?? `${post.id}-index-${index}`}
                  className="rounded-md bg-gray-100 p-3 text-sm flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Image
                      src={comment.user.profilePicture || "/teddy.webp"}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="fw-bold">{comment.user.user_name}</p>
                    <p className="text-gray-800">{comment.body}</p>
                  </div>
                  <button
                    onClick={() => toggleCommentLike(comment.id)}
                    className={`p-1 rounded-full transition-all duration-300 ${
                      likedComments && likedComments[comment.id]
                        ? "bg-red-500 animate-like"
                        : "bg-transparent"
                    }`}
                  >
                    <Heart
                      className={` w-5 h-5 transition-colors duration-300 ${
                        likedComments && likedComments[comment.id]
                          ? "text-white"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                  <div className="text-gray-700 ml-2">
                    <span>{commentLikesCount[comment.id] ?? 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay comentarios aún.
              </p>
            )}
          </div>

          {/* Campo para nuevo comentario */}
          <div className="mt-4 flex items-center gap-2">
            <textarea
              className="flex-1 rounded-md border border-gray-300 p-2 text-sm h-10"
              placeholder="Escribe un comentario..."
              value={newComment[post.id] || ""}
              onChange={(e) =>
                setNewComment((prev) => ({
                  ...prev,
                  [post.id]: e.target.value,
                }))
              }
            />
            <Button
              className="flex-shrink-0 h-10 bg-black hover:bg-lime-400 hover:text-black"
              onClick={() => addComment(post.id)}
              disabled={(newComment[post.id] || "").trim() === ""}
            >
              <Forward />
            </Button>
          </div>

          <DrawerFooter className="mt-4">
            <DrawerClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
