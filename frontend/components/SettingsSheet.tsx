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
  const [userTopics, setUserTopics] = useState<string[]>([]);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  useEffect(() => {
    // Fetch all topics and user topics
    const fetchTopics = async () => {
      try {
        const allTopicsResponse = await fetch("http://localhost:3000/api/topics", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        });
        const userTopicsResponse = await fetch("http://localhost:3000/api/user/topics", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        });

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/topics/follow", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.replace(
            /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
            "$1"
          )}`,
        },
        body: JSON.stringify({ topics: selectedTopics }),
      });

      if (!response.ok) {
        throw new Error("Error saving topics");
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
            <Button onClick={handleProfileUpdate} className="mb-3">Guardar Cambios</Button>
          </SheetClose>
        </SheetFooter>
        <SheetHeader>
          <SheetTitle>Deportes Seleccionados</SheetTitle>
          <SheetDescription>
            Realiza cambios en tus deportes seleccionados aquí. Haz clic en guardar cuando
            termines.
          </SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-8">
            {/* User Topics */
            /*
              Me he quedado aqui, queda poner los topics para poner y quitar y despues 
              el cerrar sesion 
            */
            
            }
            <div>
              <h3 className="text-lg font-semibold">Tus Topics</h3>
              <ul className="list-none border p-4 rounded">
                {selectedTopics.map((topic) => (
                  <li
                    key={topic}
                    className="cursor-pointer py-2 px-4 bg-yellow-100 hover:bg-yellow-200 rounded mb-2"
                    onClick={() => handleToggleTopic(topic)}
                  >
                    {topic}
                  </li>
                ))}
              </ul>
            </div>

            {/* Other Topics */}
            <div>
              <h3 className="text-lg font-semibold">Otros Topics</h3>
              <ul className="list-none border p-4 rounded">
                {allTopics
                  .filter((topic) => !selectedTopics.includes(topic))
                  .map((topic) => (
                    <li
                      key={topic}
                      className="cursor-pointer py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded mb-2"
                      onClick={() => handleToggleTopic(topic)}
                    >
                      {topic}
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
      </SheetContent>
    </Sheet>
  );
}
