import { use, useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import { uploadImage } from "@/hooks/useUploadImage";
import Image from "next/image";

export function SettingsSheet({
  refreshUserData,
}: {
  refreshUserData: () => void;
}) {
  const { user, setUser } = useUserContext();
  const toast = useToast();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    user_name: user?.user_name || "",
    bio: user?.bio || "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [userTopics, setUserTopics] = useState<any[]>([]);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch all topics and user topics
    const fetchTopics = async () => {
      try {
        const allTopicsResponse = await fetch(
          "http://localhost:3000/api/topics",
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
        const userTopicsResponse = await fetch(
          `http://localhost:3000/api/users/${user?.id}/topics`,
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

        const allTopicsData = await allTopicsResponse.json();
        const userTopicsData = await userTopicsResponse.json();

        setAllTopics(allTopicsData);
        setUserTopics(userTopicsData);
        setSelectedTopics(userTopicsData);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, []);

  const handleToggleTopic = (topic: any) => {
    if (selectedTopics.some((t) => t.id === topic.id)) {
      setSelectedTopics(selectedTopics.filter((t) => t.id !== topic.id));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSave = async () => {
    try {
      // IDs originales y seleccionados
      const originalIds = userTopics.map((t) => t.id);
      const selectedIds = selectedTopics.map((t) => t.id);

      // Topics nuevos a seguir
      const toFollow = selectedTopics.filter((t) => !originalIds.includes(t.id));
      // Topics a dejar de seguir
      const toUnfollow = userTopics.filter((t) => !selectedIds.includes(t.id));

      // Seguir nuevos topics
      if (toFollow.length > 0) {
        await fetch("http://localhost:3000/api/topics/follow", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
          body: JSON.stringify({ topics: toFollow.map((t) => t.id) }),
        });
      }

      // Dejar de seguir topics eliminados
      if (toUnfollow.length > 0) {
        await fetch("http://localhost:3000/api/topics/unfollow", {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
          body: JSON.stringify({ topics: toUnfollow.map((t) => t.id) }),
        });
      }

      toast.toast({
        description: "✅ Topics actualizados correctamente.",
      });
      setUserTopics(selectedTopics);
    } catch (error) {
      console.error("Error saving topics:", error);
      toast.toast({
        variant: "destructive",
        description: "❌ Error al actualizar los topics.",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    
    }
  };

  const handleProfileUpdate = async () => {
    try {
      let profilePictureUrl = user?.profile_picture;

      // Subir la imagen si se selecciona una nueva
      if (profilePicture) {
        profilePictureUrl = await uploadImage(profilePicture);
      }

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
          body: JSON.stringify({ ...formData, profile_picture: profilePictureUrl }),
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

  const handleLogout = async () => {
    await fetch("http://localhost:3000/api/logout", {
      method: "POST", 
      credentials: "include", 
      headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },});
    setUser(null);
    router.push("/login");
  };


  return (
    <Sheet>
      <SheetTrigger asChild>
        <Settings className="w-8 h-8 text-black cursor-pointer hover:text-lime-400 transition-all" />
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
        <div className="grid grid-cols-1 items-center gap-4">
          <section className="flex justify-center">
            <Image
            src={previewImage || user?.profile_picture || "/teddy.webp"}
            alt={user?.user_name || "Avatar"}
              width={1000}
              height={1000}
              className="w-40 h-40 rounded-full object-cover"
            />
          </section>
          <Label htmlFor="profile_picture" className="text-center">
            Foto de Perfil
          </Label>
          <Input
            id="profile_picture"
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
          />
        </div>
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
            <Button onClick={handleProfileUpdate} className="mb-3">
              Guardar Cambios
            </Button>
          </SheetClose>
        </SheetFooter>
        <SheetHeader>
          <SheetTitle>Deportes Seleccionados</SheetTitle>
          <SheetDescription>
            Realiza cambios en tus deportes seleccionados aquí. Haz clic en
            guardar cuando termines.
          </SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-8 mt-3">
          {/* User Topics */
          /*
              Me he quedado aqui, queda poner los topics para poner y quitar y despues 
              el cerrar sesion
            */}
          <div>
            <h3 className="text-lg font-semibold text-center">Tus Topics</h3>
            <ul className="list-none border p-4 rounded">
              {selectedTopics.map((topic) => (
                <li
                  key={topic.id}
                  className="cursor-pointer py-2 px-4 bg-lime-400 hover:bg-lime-500 rounded mb-2"
                  onClick={() => handleToggleTopic(topic)}
                >
                  {topic.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Other Topics */}
          <div>
            <h3 className="text-lg font-semibold text-center">Otros Topics</h3>
            <ul className="list-none border p-4 rounded">
              {allTopics
                .filter((topic) => !selectedTopics.some((t) => t.id === topic.id))
                .map((topic) => (
                  <li
                    key={topic.id}
                    className="cursor-pointer py-2 px-4 bg-gray-300 hover:bg-gray-400 rounded mb-2"
                    onClick={() => handleToggleTopic(topic)}
                  >
                    {topic.name}
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSave} className="mb-3">
            Guardar Topics
          </Button>
        </SheetFooter>
        {/* Botón de cerrar sesión abajo a la derecha */}
        <div className="absolute right-6 bottom-6">
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            Cerrar Sesión
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
