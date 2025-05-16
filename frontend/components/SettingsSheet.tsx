import { use, useState } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function SettingsSheet({
  refreshUserData,
}: {
  refreshUserData: () => void;
}) {
  const { user, setUser } = useUserContext();
  const toast = useToast();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    user_name: user?.user_name || "",
    bio: user?.bio || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${user?.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Error updating profile");

      const updatedUser = await response.json();
      setUser(updatedUser); // Actualizar el contexto del usuario
      refreshUserData(); // Actualizar los datos del usuario en la página

      toast.toast({
        description: `✅ Perfil actualizado correctamente.`,
      });
    } catch (error) {
      console.error(error);
      toast.toast({
        variant: "destructive",
        description: `❌ Error al actualizar el perfil.`,
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Settings className="w-8 h-8 text-black cursor-pointer hover:text-lime-500 transition-all" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configuración del Perfil</SheetTitle>
          <SheetDescription>
            Realiza cambios en tu perfil aquí. Haz clic en guardar cuando
            termines.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="full_name" className="text-right">
              Nombre Completo
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Correo
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user_name" className="text-right">
              Nombre de Usuario
            </Label>
            <Input
              id="user_name"
              name="user_name"
              value={formData.user_name}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Biografía
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Escribe algo sobre ti..."
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={handleProfileUpdate}>Guardar Cambios</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
