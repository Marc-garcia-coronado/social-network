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
import { uploadImage } from "@/hooks/useUploadImage";

type EventComponentProps = {
  event: Event;
  apuntado?: boolean;
  topics: Topic[];
  refetchEvents?: () => void;
};

type UpdateSubscribedToEventType = {
  state: boolean;
  eventID: number;
  userID: number;
};

const updateSubscribedToEvent = async ({
  state,
  eventID,
  userID,
}: UpdateSubscribedToEventType): Promise<any> => {
  const uri = !state
    ? `https://social-network-production.up.railway.app/api/users/${userID}/events/${eventID}/unsubscribe`
    : `https://social-network-production.up.railway.app/api/users/${userID}/events/${eventID}/subscribe`;

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

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
      }
    )
    .refine(
      (file) => {
        if (!file) return true;
        return file?.size < 5 * 1024 * 1024;
      },
      {
        message: "El tamaño del archivo debe ser menor a 5MB",
      }
    )
    .refine(
      (file) => {
        if (!file) return true;
        return ["image/jpeg", "image/png"].includes(file?.type);
      },
      {
        message: "Solo están permitidos los archivos JPEG y PNG",
      }
    ),
  topicID: z.number().nullable(),
});

type FormEventData = z.infer<typeof eventSchema>;

const updateEventFn = async ({
  data,
  eventID,
  userID,
}: {
  data: FormEventData;
  eventID: number;
  userID: number;
}) => {
  let imageURL = data.picture?.name ? "" : undefined;

  // Subir la imagen si se selecciona una nueva
  if (data.picture instanceof File) {
    imageURL = await uploadImage(data.picture);
  }

  const response = await fetch(
    `https://social-network-production.up.railway.app/api/users/${userID}/events/${eventID}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description ?? "",
        topic_id: data.topicID,
        picture: imageURL,
        location: data.location,
        date: data.date,
      }),
    }
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
  refetchEvents,
}: EventComponentProps) {
  const [isApuntado, setIsApuntado] = useState<boolean>(apuntado);
  const [openEdit, setOpenEdit] = useState(false);
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
      refetchEvents?.();
      setOpenEdit(false);
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
    // Crear una copia de los datos del formulario
    const updatedData: Partial<FormEventData> = { ...dataForm };

    // Si no se selecciona una nueva imagen, elimina el campo `picture` para que no se envíe
    if (!dataForm.picture) {
      delete updatedData.picture;
    }
    updateMutation.mutate({
      data: dataForm,
      eventID: event.id,
      userID: user?.id ?? 0,
    });
  };
  const [openDelete, setOpenDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Función para borrar el evento
  const handleDeleteEvent = async () => {
    setLoadingDelete(true);
    try {
      const response = await fetch(
        `https://social-network-production.up.railway.app/api/users/${user?.id}/events/${event.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al borrar el evento");
      }
      toast({
        description: "✅ Evento borrado correctamente.",
      });
      setOpenDelete(false);
      refetchEvents?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `❌ Error al borrar el evento: ${error.message}`,
      });
    } finally {
      setLoadingDelete(false);
    }
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
    <li className="flex flex-col w-[350px] md:w-[400px] min-h-[350px] overflow-hidden border border-[rgba(120,120,120,0.15)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-zinc-900 rounded-xl shadow-xl transition-colors">
      <div className="flex-1 px-5 py-1 flex flex-col justify-between">
        <div>
          <Badge className="w-fit mt-5 mx-5">{event?.topic.name}</Badge>
          <h2 className="capitalize font-bold my-3">{event?.name}</h2>
          <div className="flex gap-2 pt-1">
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
        {event?.creator?.id === user?.id && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-3">
              <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-fit"
                    onClick={() => setOpenDelete(true)}
                  >
                    Borrar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>¿Estás seguro?</DialogTitle>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
