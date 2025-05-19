"use client";

import { z } from "zod";
import { Event, Topic } from "@/lib/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/contexts/UserContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CalendarDemo } from "./CalendarComponent";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type EventComponentProps = {
  event: Event;
  apuntado?: boolean;
  topics: Topic[];
  token: string;
};

type UpdateSubscribedToEventType = {
  state: boolean;
  eventID: number;
  userID: number;
  token: string;
};

const updateSubscribedToEvent = async ({
  state,
  eventID,
  userID,
  token,
}: UpdateSubscribedToEventType): Promise<any> => {
  const uri = !state
    ? `http://localhost:3000/api/users/${userID}/events/${eventID}/unsubscribe`
    : `http://localhost:3000/api/users/${userID}/events/${eventID}/subscribe`;

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", "Bearer " + token);
  }

  const res = await fetch(uri, {
    method: state ? "POST" : "DELETE",
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const msg = state
      ? "no se ha podido suscribir al evento"
      : "no se ha podido desuscribir al evento";
    throw new Error(msg);
  }

  return res.json();
};

const eventSchema = z.object({
  name: z.string().min(1, "Debe tener más de 1 carácter de longitud"),
  description: z.string().optional(),
  location: z.string().min(2, "Debe tener más de 2 carácteres de longitud"),
  date: z.date(),
  picture: z
    .any()
    .optional()
    .nullable()
    .refine(
      (file) => {
        if (!file) return true;
        return file instanceof File;
      },
      {
        message: "Foto obligatoria",
      },
    )
    .refine(
      (file) => {
        if (!file) return true;
        return file?.size < 5 * 1024 * 1024;
      },
      {
        message: "El tamaño del archivo debe ser menor a 5MB",
      },
    )
    .refine(
      (file) => {
        if (!file) return true;
        return ["image/jpeg", "image/png"].includes(file?.type);
      },
      {
        message: "Solo están permitidos los archivos JPEG y PNG",
      },
    ),
  topicID: z.number().nullable(),
});

type FormEventData = z.infer<typeof eventSchema>;

const updateEventFn = async ({
  data,
  eventID,
  userID,
  token,
}: {
  data: FormEventData;
  eventID: number;
  userID: number;
  token: string;
}) => {
  const response = await fetch(
    `http://localhost:3000/api/users/${userID}/events/${eventID}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description ?? "",
        topic_id: data.topicID,
        picture: data.picture?.name ?? "",
        location: data.location,
        date: data.date,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("fallo al modificar el evento");
  }

  return { status: response.status, message: "evento modificado" };
};

export default function EventComponent({
  event,
  apuntado = false,
  topics,
  token,
}: EventComponentProps) {
  const [isApuntado, setIsApuntado] = useState<boolean>(apuntado);
  const { user } = useUserContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormEventData>({
    resolver: zodResolver(eventSchema),
  });

  const updateMutation = useMutation({
    mutationFn: updateEventFn,
    onSuccess: () => {
      reset();
      toast({
        description: `✅ Se ha modificado el evento exitosamente`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: `❌ Error al modificar el evento: ${error.message}`,
      });
    },
  });

  const mutation = useMutation({
    mutationFn: updateSubscribedToEvent,
    onError: () => {
      return toast({
        variant: "destructive",
        description:
          "Ha habido un error al cambiar el estado de la suscripcion",
      });
    },
    onSuccess: () => {
      return toast({
        title: isApuntado
          ? "Apuntado correctamente"
          : "Desapuntado correctamente",
        description: isApuntado
          ? "¡Te has apuntado correctamente al evento!"
          : "¡Te has desapuntado correctamente al evento!",
      });
    },
  });

  const handleChangeIsApuntado = () => {
    const newState = !isApuntado;
    setIsApuntado(newState);
    mutation.mutate({
      state: newState,
      eventID: event.id,
      userID: user?.id ?? 0,
      token,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("picture", file);
    }
  };

  const selectedDate = watch("date");

  const onSubmit = (dataForm: FormEventData) => {
    updateMutation.mutate({
      data: dataForm,
      eventID: event.id,
      userID: user?.id ?? 0,
      token,
    });
  };

  useEffect(() => {
    if (event) {
      setValue("name", event.name);
      setValue("description", event.description);
      setValue("location", event.location);
      setValue("date", new Date(event.date));
      setValue("topicID", event.topic.id);
    }
  }, [event, setValue]);

  return (
    <li className="flex flex-col w-[350px] md:w-full min-h-[350px] overflow-hidden mx-auto border-transparent rounded-md shadow ">
      <Image
        src={event?.picture ? event.picture : "/globe.svg"}
        alt={event?.description}
        width={30}
        height={30}
        className="w-full max-h-40 rounded-t-md object-cover"
      />
      <Badge className="w-fit mt-5 mx-5">{event?.topic.name}</Badge>
      <div className="px-5 py-1 flex flex-col ">
        <h2 className="capitalize font-bold my-3">{event?.name}</h2>
        <div className="flex gap-2 items-center">
          <Label htmlFor="desc">Descripción:</Label>
          <p id="desc">{event?.description}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Label htmlFor="location">Localización:</Label>
          <p id="location">{event?.location}</p>
        </div>
        <div className="flex gap-2 items-center mb-5">
          <Label htmlFor="date">Fecha del evento:</Label>
          <p id="date">{new Date(event?.date).toLocaleDateString()}</p>
        </div>
      </div>
      {event?.creator?.id === user?.id ? (
        <Dialog modal={false}>
          <DialogTrigger asChild>
            <Button variant="default" className="w-fit mx-auto mb-5">
              Editar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Evento</DialogTitle>
              <DialogDescription>
                Haz cambios para modificar el contenido del evento. Haz click en
                guardar cuando hayas acabado.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 py-4"
            >
              <div className="flex items-center gap-4">
                <Label htmlFor="name" className="w-20 text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  defaultValue={event.name}
                  className="flex-1 w-full"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="description" className="w-20 text-right">
                  Descripción
                </Label>
                <Input
                  id="description"
                  defaultValue={event.description}
                  className="flex-1 w-full"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-red-600">{errors.description.message}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="location" className="w-20 text-right">
                  Localización
                </Label>
                <Input
                  id="location"
                  defaultValue={event.location}
                  className="flex-1"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-red-600">{errors.location.message}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="date" className="w-20 text-right">
                  Fecha
                </Label>
                <CalendarDemo
                  value={selectedDate}
                  onChangeAction={(date) => {
                    if (date) {
                      setValue("date", date);
                    }
                  }}
                />
                {errors.date && (
                  <p className="text-red-600">{errors.date.message}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="file" className="w-20 text-right">
                  Foto:
                </Label>
                <Input
                  type="file"
                  id="file"
                  accept="image/png, image/jpeg"
                  defaultValue={event.picture}
                  onChange={handleFileChange}
                  className="w-4/6"
                />
              </div>
              {errors && (
                <p className="text-red-600">{errors.topicID?.message}</p>
              )}
              <Label htmlFor="topics">Selecciona el tema para el evento:</Label>
              <ul className="list-none flex gap-4" id="topics">
                {topics?.map((topic: Topic) => (
                  <li
                    key={topic.id}
                    onClick={() =>
                      setValue(
                        "topicID",
                        watch("topicID") === topic.id ? null : topic.id,
                      )
                    }
                  >
                    <Badge
                      className={`${
                        watch("topicID") === topic.id
                          ? "bg-yellow-600 hover:bg-yellow-500"
                          : ""
                      } cursor-pointer py-2 px-4`}
                    >
                      {topic.name}
                    </Badge>
                  </li>
                ))}
              </ul>
              {errors.topicID && (
                <p className="text-red-600">{errors.topicID.message}</p>
              )}
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                type="button"
                className={`self-center mb-3
              ${
                isApuntado
                  ? "bg-lime-400 hover:bg-lime-500 text-black"
                  : "bg-transparent border-2 text-black border-black hover:bg-black hover:text-white"
              }
              `}
                onClick={() => handleChangeIsApuntado()}
              >
                {!isApuntado ? <p>Apuntarse</p> : <p>Desapuntarse</p>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isApuntado ? <p>Desapuntarse</p> : <p>Apuntarse</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </li>
  );
}
