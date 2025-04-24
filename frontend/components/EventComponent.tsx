"use client";

import { Event } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";

type EventComponentProps = {
  event: Event;
  apuntado?: boolean;
  userID: number;
  token: string;
};

type UpdateSubscribedToEventType = {
  state: boolean;
  eventID: number;
  userID: number;
  token: string | undefined;
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

  return res.json();
};

export default function EventComponent({
  event,
  apuntado = false,
  token,
  userID,
}: EventComponentProps) {
  const [isApuntado, setIsApuntado] = useState<boolean>(apuntado);

  const mutation = useMutation({
    mutationFn: updateSubscribedToEvent,
    onSuccess: () => {
      console.log("tutto correcto");
    },
    onError: () => {
      console.log("tutto incorrecto");
    },
  });

  const handleChangeIsApuntado = () => {
    const newState = !isApuntado;
    setIsApuntado(newState);
    mutation.mutate({
      state: newState,
      eventID: event.id,
      userID,
      token,
    });
  };

  return (
    <li className="flex flex-col w-5/6 mx-auto border-transparent rounded-md shadow shadow-black">
      <Image
        src={event.picture ? event.picture : "/globe.svg"}
        alt={event.description}
        width={30}
        height={30}
        className="w-full max-h-40"
      />
      <h2>{event.name}</h2>
      <p>{event.description}</p>
      <p>{event.topic.name}</p>
      <p>{event.user?.email}</p>
      <p>{event.location}</p>
      <p>{event.createdAt}</p>
      <Button
        type="button"
        className={isApuntado ? "bg-green-500" : ""}
        onClick={() => handleChangeIsApuntado()}
      >
        {isApuntado ? "esta apuntado" : "no esta apuntado"}
      </Button>
    </li>
  );
}
