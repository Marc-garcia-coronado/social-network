"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Stepper, { Step } from "@/components/StepForm";
import { motion } from "framer-motion";
import { useUserContext } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { Topic } from "@/lib/types";
import { uploadImage } from "@/hooks/useUploadImage";

const getTopicsFn = async () => {
  const response = await fetch(
    `https://social-network-production.up.railway.app/api/topics`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "No se ha podido obtener los topics");
  }

  return data;
};

const schemaLogin = z.object({
  email: z.string().email("Email no válido"),
  password: z.string().min(3, "Debe tener más de 3 carácteres de longitud"),
});

const schemaRegister = z
  .object({
    userName: z.string().min(2, "Debe tener más de 2 carácteres de longitud").max(30, "Debe tener máximo 30 carácteres de longitud"),
    fullName: z.string().min(2, "Debe tener más de 2 carácteres de longitud").max(30, "Debe tener máximo 30 carácteres de longitud"),
    email: z.string().email(),
    password: z.string().min(4, "Debe tener mínimo de 4 carácteres"),
    confirmPassword: z.string(),
    bio: z
      .string()
      .max(200, "La biografía no debe superar 200 caracteres")
      .optional(),
    profile_picture: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schemaLogin>;
type RegisterFormData = z.infer<typeof schemaRegister>;

export default function Login() {
  const [isLoginSelected, setIsLoginSelected] = useState<boolean>(true);

  return (
    <>
      <div
        className="
          grid grid-cols-3
          items-center
          gap-4
          px-4 py-4 md:mt-10
          w-full max-w-5xl mx-auto
        "
      >
        {/* Columna izquierda vacía */}
        <div />
        {/* Logo centrado en la columna del medio */}
        <div className="flex justify-center items-center select-none">
          <h1 className="text-4xl md:text-5xl font-archivo text-white tracking-tighter text-center mb-9 md:mb-32 ">
            Fle<span className="text-lime-400">X</span>in.
          </h1>
        </div>
        {/* Columna derecha vacía */}
        <div />
      </div>

      <div className=" w-full flex items-center justify-center">
        <div className="w-full max-w-md bg-zinc-900 p-8 rounded-lg shadow-lg">
          <div className="relative flex justify-between mb-5 hover:bg-accent rounded-sm overflow-hidden">
            <motion.div
              className="absolute top-0 bottom-0 w-1/2 bg-lime-400 rounded-sm"
              animate={{ x: isLoginSelected ? "0%" : "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />

            <p
              className="relative flex-1 text-center py-3 cursor-pointer z-10 "
              style={{ color: isLoginSelected ? "black" : "white" }}
              onClick={() => setIsLoginSelected(true)}
            >
              Login
            </p>

            <p
              className="relative flex-1 text-center py-3 cursor-pointer z-10"
              style={{ color: !isLoginSelected ? "black" : "white" }}
              onClick={() => setIsLoginSelected(false)}
            >
              Registrarse
            </p>
          </div>
          {isLoginSelected ? (
            <LoginForm />
          ) : (
            <RegisterForm setIsLoginSelected={setIsLoginSelected} />
          )}
        </div>
      </div>
    </>
  );
}

type FormProps = {
  className?: string;
};

const LoginForm = ({ className }: FormProps) => {
  const router = useRouter();
  const { setUser } = useUserContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schemaLogin),
  });

  const loginFn = async (body: FormData) => {
    const response = await fetch(
      "https://social-network-production.up.railway.app/api/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se ha podido hacer login");
    }

    return data;
  };

  const mutation = useMutation({
    mutationFn: loginFn,
    onSuccess: (data) => {
      if (data) {
        setUser(data.user);
        router.push(`/${data.user.user_name}/home`);
      }
    },
    onError: () => {
      alert("Email o Contraseña no validos");
    },
  });

  const onSubmit = async (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <form
      className={`flex flex-col gap-y-3 ${className}`}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          {...register("email")}
          className="bg-background hover:bg-accent"
          placeholder="email@example.com"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          {...register("password")}
          type="password"
          className="bg-background hover:bg-accent"
          placeholder="********"
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="mt-3">
        Enviar
      </Button>
    </form>
  );
};

type RegisterFormProps = {
  className?: string;
  setIsLoginSelected: React.Dispatch<React.SetStateAction<boolean>>;
};

const followTopicsFn = async ({
  token,
  ids,
}: {
  token: string;
  ids: number[];
}) => {
  const response = await fetch(
    "https://social-network-production.up.railway.app/api/topics/follow",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        topics: ids,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Ha fallado al seguir los temas seleccionados");
  }

  return response.json();
};

const registerPost = async (body: RegisterFormData) => {
  const response = await fetch(
    "https://social-network-production.up.railway.app/api/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: body.userName,
        full_name: body.fullName,
        email: body.email,
        password: body.password,
        bio: body.bio,
        profile_picture: body.profile_picture,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Ha fallado al crear un usuario");
  }

  return response.json();
};

const RegisterForm = ({ className, setIsLoginSelected }: RegisterFormProps) => {
  const [topicsIDsSelected, setTopicsIDsSelected] = useState<Array<number>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schemaRegister),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["allTopics"],
    queryFn: () => getTopicsFn(),
  });

  const mutationTopics = useMutation({
    mutationFn: followTopicsFn,
  });

  const mutation = useMutation({
    mutationFn: registerPost,
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "¡Registro exitoso!",
          description: "✅ ¡Te has registrado exitosamente!",
        });
        const token: string = data.token;
        mutationTopics.mutate({ token, ids: topicsIDsSelected });
        setIsLoginSelected(true);
      }
    },
    onError: () => {
      toast({
        title: "¡Registro fallido!",
        description: "❌ ¡No se ha podido registrar correctamente!",
      });
    },
  });

  const onSubmit = async (formData: RegisterFormData) => {
    try {
      let profilePictureUrl = "";

      // Subir la imagen si existe
      if (formData.profile_picture[0]) {
        const file = formData.profile_picture[0];
        profilePictureUrl = await uploadImage(file); // Subir la imagen y obtener la URL
      }

      // Enviar los datos del formulario con la URL de la imagen
      mutation.mutate({
        ...formData,
        profile_picture: profilePictureUrl, // Agregar la URL de la imagen
      });
    } catch (error) {
      console.error("Error al subir la imagen o registrar el usuario:", error);
    }
  };

  useEffect(() => {
    if (isError) {
      toast({
        description: "❌ ¡Ha habido un error al obtener los gustos!",
      });
    }
  }, [isError]);

  return (
    <form
      id="formRegister"
      className={`space-y-6 ${className}`}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Stepper
        initialStep={1}
        onFinalStepCompleted={() => {
          // Trigger form submission
          const form = document.getElementById(
            "formRegister"
          ) as HTMLFormElement;
          if (form) {
            form.requestSubmit();
          }
        }}
        backButtonText="Anterior"
        nextButtonText="Siguiente"
      >
        <Step>
          <div className="p-1">
            <div className="space-y-1 mb-3">
              <p className="text-xl font-medium">¡Elige tus nombres!</p>
              <p className="text-sm text-neutral-300">
                Escribe el nombre de usuario con el que quieres que tus
                seguidores vean y tu nombre completo.
              </p>
            </div>
            <Label htmlFor="userName">Nombre de Usuario</Label>
            <Input
              {...register("userName")}
              className="bg-background hover:bg-accent mb-3"
              placeholder="Nombre de Usuaro"
            />
            {errors.userName && (
              <p className="text-red-500">{errors.userName.message}</p>
            )}
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              {...register("fullName")}
              className="bg-background hover:bg-accent"
              placeholder="Nombre Completo"
            />
            {errors.fullName && (
              <p className="text-red-500">{errors.fullName.message}</p>
            )}
          </div>
        </Step>
        <Step>
          <div className="p-1">
            <div className="space-y-1 mb-3">
              <p className="text-xl font-medium">¡Pon tu correo!</p>
              <p className="text-sm text-neutral-300">
                Escribe tu correo electrónico con el que quieras registrarte.
              </p>
            </div>
            <Label htmlFor="email">Email</Label>
            <Input
              {...register("email")}
              className="bg-background hover:bg-accent"
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>
        </Step>
        <Step>
          <div className="p-1">
            <div className="space-y-1 mb-3">
              <p className="text-xl font-medium">
                Escoge tu mejor Foto de Perfil y Biografía!
              </p>
              <p className="text-sm text-neutral-300">
                Selecciona tu mejor imagen para que se visualice en tu perfil
                junto a una biografia a tu gusto.
              </p>
            </div>
            <Label htmlFor="profile_picture">Foto de Perfil</Label>
            <Input
              type="file"
              id="profile_picture"
              accept="image/png, image/jpeg"
              className="bg-background hover:bg-accent mb-3"
              {...register("profile_picture")}
            />
            {errors.profile_picture && (
              <p className="text-red-500">
                {String(errors.profile_picture.message)}
              </p>
            )}
            <div className="p-1">
              <Label htmlFor="bio">Biografía</Label>
              <textarea
                {...register("bio")}
                className="w-full p-2 border rounded-md  bg-background hover:bg-accent"
                rows={1}
                placeholder="Escribe algo sobre ti..."
              />
              {errors.bio && (
                <p className="text-red-500">{errors.bio.message}</p>
              )}
            </div>
          </div>
        </Step>
        <Step>
          <div className="p-1">
            <div className="space-y-1 mb-3">
              <p className="text-xl font-medium">Personaliza tu feed</p>
              <p className="text-sm text-neutral-300">
                Selecciona los temas que más te interesan para ver solo
                publicaciones relacionadas con ellos.
              </p>
            </div>
            {isLoading && <p>Loading...</p>}
            {!isLoading && !isError && data && (
              <ul className="flex items-center gap-2 overflow-x-scroll">
                {data.map((topic: Topic) => (
                  <li key={topic.id}>
                    <Button
                      className={`cursor-pointer capitalize outline-transparent shadow-none border ${
                        topicsIDsSelected.includes(topic.id)
                          ? "bg-lime-400 hover:bg-lime-300"
                          : ""
                      } `}
                      onClick={() =>
                        setTopicsIDsSelected((prev) => {
                          if (prev.includes(topic.id)) {
                            return prev.filter((id) => id !== topic.id);
                          } else {
                            return [...prev, topic.id];
                          }
                        })
                      }
                    >
                      {topic.name}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Step>
        <Step>
          <div className="space-y-3 mb-1 p-1">
            <div className="space-y-1 mb-3">
              <p className="text-xl font-medium">Ultimos pasos...</p>
              <p className="text-sm text-neutral-300">
                Selecciona una contraseña segura para tu cuenta
              </p>
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                {...register("password")}
                type="password"
                className="bg-background hover:bg-accent"
                placeholder="********"
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirma Contraseña</Label>
              <Input
                {...register("confirmPassword")}
                type="password"
                className="bg-background hover:bg-accent"
                placeholder="********"
              />
              {errors.confirmPassword && (
                <p className="text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </Step>
      </Stepper>
    </form>
  );
};
