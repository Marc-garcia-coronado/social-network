"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export function DropdownCardMenu({
  postId,
  userId,
  refreshPosts,
}: {
  postId: string;
  userId: string;
  refreshPosts: () => void;
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      {/* Dialogo Editar */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Post</DialogTitle>
            <DialogDescription>
              Modifica el contenido del post aquí.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                defaultValue="Título de ejemplo"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Contenido
              </Label>
              <Input
                id="content"
                defaultValue="Contenido de ejemplo"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setOpenEdit(false)}>
              Guardar cambios
            </Button>
          </DialogFooter>
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
                    `http://localhost:3000/api/users/${userId}/posts/${postId}`,
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

                  console.log("eliminado");
                  refreshPosts();
                  setOpenDelete(false);
                } catch (error) {
                  console.error("Error eliminando el post:", error);
                  // Manejo de errores, como mostrar un mensaje al usuario
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
          <Button className="bg-black/50">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Opciones del Post</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
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
              className="cursor-pointer"
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
