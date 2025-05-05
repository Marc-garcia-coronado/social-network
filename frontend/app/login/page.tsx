"use client";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Stepper, { Step } from "@/components/StepForm";
import { motion } from "framer-motion";
import { useUserContext } from "@/contexts/UserContext";

const schemaLogin = z.object({
  email: z.string().email("Email no válido"),
  password: z.string().min(3, "Debe tener más de 3 carácteres de longitud"),
});

const schemaRegister = z
  .object({
    userName: z.string().min(2, "Debe tener más de 2 carácteres de longitud"),
    fullName: z.string().min(2, "Debe tener más de 2 carácteres de longitud"),
    email: z.string().email(),
    password: z.string().min(4, "Debe tener mínimo de 4 carácteres"),
    confirmPassword: z.string(),
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
    <div className="h-screen w-full flex items-center justify-center bg-gray-100 text-black ">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <div className="relative flex justify-between mb-5 bg-gray-200 rounded-sm overflow-hidden">
          <motion.div
            className="absolute top-0 bottom-0 w-1/2 bg-slate-800 rounded-sm"
            animate={{ x: isLoginSelected ? "0%" : "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />

          <p
            className="relative flex-1 text-center py-3 cursor-pointer z-10"
            style={{ color: isLoginSelected ? "white" : "black" }}
            onClick={() => setIsLoginSelected(true)}
          >
            Login
          </p>

          <p
            className="relative flex-1 text-center py-3 cursor-pointer z-10"
            style={{ color: !isLoginSelected ? "white" : "black" }}
            onClick={() => setIsLoginSelected(false)}
          >
            Registrarse
          </p>
        </div>
        {isLoginSelected ? <LoginForm /> : <RegisterForm setIsLoginSelected={setIsLoginSelected} />}
      </div>
    </div>
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
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schemaLogin),
  });

  const loginFn = async (body: FormData) => {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

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
    onError: (error) => {
      console.log("Login error: ", error);
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
        <Label htmlFor="email" className="dark:text-black">
          Email
        </Label>
        <Input {...register("email")} />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password" className="dark:text-black">
          Contraseña
        </Label>
        <Input {...register("password")} type="password" />
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

const RegisterForm = ({ className, setIsLoginSelected }: RegisterFormProps) => {
  const registerPost = async (body: RegisterFormData) => {
    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: body.userName,
        full_name: body.fullName,
        email: body.email,
        password: body.password,
      }),
    });

    if (!response.ok) {
      throw new Error("Ha fallado al crear un usuario");
    }

    return response.json();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schemaRegister),
  });

  const router = useRouter();
  const mutation = useMutation({
    mutationFn: registerPost,
    onSuccess: (data) => {
      if (data) {
        setIsLoginSelected(true);
      }
    },
    onError: (error) => {
      console.log("Register error: ", error);
      alert("Registration error");
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    mutation.mutate(data);
  };

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
          <Label htmlFor="userName" className="dark:text-black">
            Nombre de Usuario
          </Label>
          <Input {...register("userName")} />
          {errors.userName && (
            <p className="text-red-500">{errors.userName.message}</p>
          )}
        </Step>
        <Step>
          <Label htmlFor="fullName" className="dark:text-black">
            Nombre Completo
          </Label>
          <Input {...register("fullName")} />
          {errors.fullName && (
            <p className="text-red-500">{errors.fullName.message}</p>
          )}
        </Step>
        <Step>
          <Label htmlFor="email" className="dark:text-black">
            Email
          </Label>
          <Input {...register("email")} />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </Step>
        <Step>
          <div className="space-y-3 mb-1">
            <div>
              <Label htmlFor="password" className="dark:text-black">
                Contraseña
              </Label>
              <Input {...register("password")} type="password" />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="dark:text-black">
                Confirma Contraseña
              </Label>
              <Input {...register("confirmPassword")} type="password" />
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