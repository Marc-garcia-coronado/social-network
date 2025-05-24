import { useEffect, useState } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectMultipleComponent from "@/components/SelectMultipleComponent";
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
import { Badge } from "@/components/ui/badge";

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
  const [selectedTopics, setSelectedTopics] = useState<any[]>([]); // Tus gustos
  const [availableTopics, setAvailableTopics] = useState<any[]>([]); // Otros temas disponibles
  const [selectedFromSelect, setSelectedFromSelect] = useState<string[]>([]); // IDs seleccionados en el select
  const router = useRouter();

  useEffect(() => {
    // Fetch all topics and user topics
    const fetchTopics = async () => {
      try {
        const allTopicsResponse = await fetch(
          "https://social-network-production.up.railway.app/api/topics",
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
          `https://social-network-production.up.railway.app/api/users/${user?.id}/topics`,
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

        setAvailableTopics(
          allTopicsData.filter(
            (topic: any) =>
              !userTopicsData.some((userTopic: any) => userTopic.id === topic.id)
          )
        );
        setAllTopics(allTopicsData);
        setUserTopics(userTopicsData);
        setSelectedTopics(userTopicsData);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [user?.id]);

  const handleSave = async () => {
    try {
      if (selectedTopics.length === 0) {
        toast.toast({
          variant: "destructive",
          description: "Debes mantener al menos un topic en tus gustos.",
        });
        return;
      }
      const currentSelectedTopics = [...selectedTopics];
      // IDs originales y seleccionados
      const originalIds = userTopics.map((t) => t.id);
      const selectedIds = currentSelectedTopics.map((t) => t.id);
      

      // Topics nuevos a seguir
      const toFollow = currentSelectedTopics.filter(
        (t) => !originalIds.includes(t.id)
      );
      // Topics a dejar de seguir
      const toUnfollow = userTopics.filter((t) => !selectedIds.includes(t.id));

      // Seguir nuevos topics
      if (toFollow.length > 0) {
        await fetch("https://social-network-production.up.railway.app/api/topics/follow", {
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
        for (const topic of toUnfollow) {
          await fetch(`https://social-network-production.up.railway.app/api/topics/unfollow`, {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${document.cookie.replace(
                /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
                "$1"
              )}`,
            },
            body: JSON.stringify({ topics: [topic.id] }),
          });
        }
      }

      toast.toast({
        description: "✅ Topics actualizados correctamente.",
      });
      setUserTopics(currentSelectedTopics);
    } catch (error) {
      console.error("Error saving topics:", error);
      toast.toast({
        variant: "destructive",
        description: "❌ Error al actualizar los topics.",
      });
    }
  };

  const handleSelectChange = (selectedIds: string[]) => {
    const selectedIdsAsNumbers = selectedIds.map((id) => parseInt(id, 10));
  
    const newSelectedTopics = availableTopics.filter((topic) =>
      selectedIdsAsNumbers.includes(topic.id)
    );
  
    setSelectedTopics((prev) => {
      const existingIds = prev.map((t) => t.id);
      const merged = [
        ...prev,
        ...newSelectedTopics.filter((t) => !existingIds.includes(t.id)),
      ];
  
      setAvailableTopics(
        allTopics.filter((topic) => !merged.some((sel) => sel.id === topic.id))
      );
  
      return merged;
    });
  
    setSelectedFromSelect(selectedIds);
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

  const handleRemoveTopic = (topicToRemove: any) => {
    setSelectedTopics((prevSelected) => {
      const updatedSelected = prevSelected.filter(
        (topic) => topic.id !== topicToRemove.id
      );

      setAvailableTopics((prev) => [
        ...prev.filter((t) => t.id !== topicToRemove.id),
        topicToRemove,
      ]);
      setSelectedFromSelect((prev) =>
        prev.filter((id) => id !== topicToRemove.id.toString())
      );

      return updatedSelected;
    });
  };
  
  

  const handleProfileUpdate = async () => {
    try {
      let profilePictureUrl = user?.profile_picture;

      // Subir la imagen si se selecciona una nueva
      if (profilePicture) {
        profilePictureUrl = await uploadImage(profilePicture);
      }

      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/${user?.id}`,
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
    await fetch("https://social-network-production.up.railway.app/api/logout", {
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
        <Settings className="w-8 h-8 cursor-pointer hover:text-lime-400 transition-all" />
      </SheetTrigger>
      <SheetContent className="bg-zinc-900 overflow-y-scroll">
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
                className="w-24 h-24 rounded-full object-cover"
              />
            </section>
            <Label htmlFor="profile_picture" className="text-center">
              Foto de Perfil
            </Label>
            <Input
              id="profile_picture"
              type="file"
              accept="image/*"
              className="bg-background hover:bg-accent"
              onChange={handleProfilePictureChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="full_name" className="text-right">
              Nombre
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="col-span-3 bg-background hover:bg-accent"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user_name" className="text-right">
              Usuario
            </Label>
            <Input
              id="user_name"
              name="user_name"
              value={formData.user_name}
              onChange={handleInputChange}
              className="col-span-3 bg-background hover:bg-accent"
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
              className="col-span-3 bg-background hover:bg-accent"
              placeholder="Escribe algo sobre ti..."
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={handleProfileUpdate} className="mb-5 w-full">
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
        <div className="flex flex-col gap-3 mt-3">
          {/* User Topics */}
          {/* Other Topics */}
          <div>
            <SelectMultipleComponent
              topics={availableTopics}
              value={selectedFromSelect}
              onChange={handleSelectChange}
              className="w-full hover:bg-accent"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-center">Tus Gustos</h3>
            <ul className="list-none border p-4 flex flex-wrap gap-2 items-center">
              {selectedTopics.map((topic) => (
                <li
                  key={topic.id}
                  className="cursor-pointer"
                  onClick={() => handleRemoveTopic(topic)}
                >
                  <Badge
                    className={`text-black bg-lime-400 hover:bg-lime-300 py-2 px-4 mb-3" cursor-pointer`}
                  >                    
                    {topic.name}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSave} className="mb-5 w-full">
            Guardar Topics
          </Button>
        </SheetFooter>
        <SheetHeader>
          <SheetTitle>Cerrar Sessión</SheetTitle>
          <SheetDescription>
            <SheetDescription className="mb-3">
              Cierra tu sesión aquí.
            </SheetDescription>
            {/* Botón de cerrar sesión abajo a la derecha */}
            <div className="flex justify-end">
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white w-full"
              >
                Cerrar Sesión
              </Button>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
