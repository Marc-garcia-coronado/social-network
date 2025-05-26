"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, SquarePen, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Topic } from "@/lib/types";

const getTopicsFn = async (id: number) => {
  const response = await fetch(
    `https://social-network-production.up.railway.app/api/users/${id}/topics`,
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "No se ha podido obtener los topics");
  }

  return data;
};

export function DropdownCardMenu({
  postId,
  userId,
  refreshPosts,
  postTitle,
  postTopicId,
}: {
  postId: string;
  userId: string;
  refreshPosts: () => void;
  postTitle: string;
  postTopicId: number;
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [title, setTitle] = useState(postTitle || "");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["topics", userId],
    queryFn: () => getTopicsFn(Number(userId)),
    enabled: !!userId,
  });
  const {
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: postTitle || "",
      topic_id: postTopicId || null,
    },
  });
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({
    topic_id: postTopicId || null,
  });
  function setValue(key: string, value: number | null): void {
    setFormValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));
  }
  function watch(key: string): any {
    return formValues[key];
  }
  const savePostChanges = async (
    postId: string,
    updatedData: { title?: string; topic_id?: string }
  ) => {
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/${userId}/posts/${postId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Error al guardar los cambios del post");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error al guardar los cambios del post:", error);
      throw error;
    }
  };

  const onSubmit = async () => {
    try {
      const updatedData = {
        title,
        topic_id: watch("topic_id"),
      };
      await savePostChanges(postId, updatedData);
      setOpenEdit(false);
      refreshPosts();
    } catch (error) {
      console.error("No se pudieron guardar los cambios", error);
    }
  };

  return (
    <>
      {/* Dialogo Editar */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Post</DialogTitle>
            <DialogDescription>
              Modifica el contenido del post aquí.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="title">Título:</Label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)} // Actualizamos el estado
                  className="input"
                />
                {errors.title && (
                  <p className="text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="topics">Selecciona el tema para el post:</Label>
                <ul
                  className="list-none flex gap-4 overflow-x-scroll max-w-min"
                  id="topics"
                >
                  {isLoading ? (
                    <p>Loading...</p>
                  ) : isError ? (
                    <p className="text-red-600">{(error as Error)?.message}</p>
                  ) : (
                    data?.map((topic: Topic) => (
                      <li
                        key={topic.id}
                        onClick={() =>
                          setValue(
                            "topic_id",
                            watch("topic_id") === topic.id ? null : topic.id
                          )
                        }
                      >
                        <Badge
                          className={`${
                            watch("topic_id") === topic.id
                              ? "bg-lime-400 hover:bg-lime-300"
                              : ""
                          } cursor-pointer py-2 px-4`}
                        >
                          {topic.name}
                        </Badge>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="mt-3">
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogo Eliminar */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Deseas eliminar el post?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  const response = await fetch(
                    `https://social-network-production.up.railway.app/api/users/${userId}/posts/${postId}`,
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
                    throw new Error("Error al eliminar el post");
                  }

                  refreshPosts();
                  setOpenDelete(false);
                } catch (error) {
                  console.error("Error eliminando el post:", error);
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dropdown */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-black/50 hover:bg-lime-400 hover:text-black transition-all text-white">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Opciones del Post</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer focus:bg-lime-400 focus:text-black"
              onSelect={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                setOpenEdit(true);
              }}
            >
              <SquarePen className="mr-2 h-4 w-4" />
              <span>Editar Post</span>
              <DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer focus:bg-lime-400 focus:text-black"
              onSelect={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                setOpenDelete(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Eliminar Post</span>
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
