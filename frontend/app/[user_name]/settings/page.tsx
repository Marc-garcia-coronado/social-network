"use client";

import { useState } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function Settings() {
  const { user, setUser } = useUserContext();
  const router = useRouter();

  const [formData, setFormData] = useState({
    //profilePicture: "/teddy.webp", cambiar la estructura para poner la foto en un futuro
    full_name: user?.full_name || "",
    email: user?.email || "",
    user_name: user?.user_name || "",
    password: "",
  });

  const [topics, setTopics] = useState<number[]>([]); // Topics seleccionados
  const [allTopics, setAllTopics] = useState<any[]>([]); // Lista de todos los topics

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${user?.id}`,
        {
          method: "PATCH",
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
      console.log(response)
      if (!response.ok) throw new Error("Error updating profile");

      const updatedUser = await response.json();
      setUser(updatedUser);
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el perfil");
    }
  };

  const handleTopicsUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/topics/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.replace(
            /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
            "$1"
          )}`,
        },
        body: JSON.stringify({ topics }),
      });
      if (!response.ok) throw new Error("Error updating topics");

      alert("Topics actualizados correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar los topics");
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    router.push("/login");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Ajustes</h1>

      {/* Editar Perfil */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Editar Perfil</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium">Foto de Perfil</label>
            {/* <input
              type="text"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              placeholder="URL de la foto de perfil"
            /> */}
          </div>
          <div>
            <label className="block font-medium">Nombre Completo</label>
            <input
              type="text"
              name="fullName"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-medium">Correo</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-medium">Nombre de Usuario</label>
            <input
              type="text"
              name="userName"
              value={formData.user_name}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-medium">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            />
          </div>
          <button
            onClick={handleProfileUpdate}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Guardar Cambios
          </button>
        </div>
      </section>

      {/* Gestionar Topics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Gestionar Topics</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium">Añadir/Quitar Topics</label>
            <select
              multiple
              value={topics.map(String)}
              onChange={(e) =>
                setTopics(
                  Array.from(e.target.selectedOptions, (opt) =>
                    Number(opt.value)
                  )
                )
              }
              className="w-full border rounded p-2"
            >
              {allTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleTopicsUpdate}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Guardar Topics
          </button>
        </div>
      </section>

      {/* Cerrar Sesión */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Cerrar Sesión</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Cerrar Sesión
        </button>
      </section>
    </div>
  );
}
