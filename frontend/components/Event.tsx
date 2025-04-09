"use client";

import { Event } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";

type EventComponentProps = {
  event: Event;
  apuntado?: boolean;
};

export default function EventComponent({
  event,
  apuntado = false,
}: EventComponentProps) {
  const [isApuntado, setIsApuntado] = useState<boolean>(apuntado);

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
      <Button type="button" onClick={() => setIsApuntado((prev) => !prev)}>
        {isApuntado ? "esta apuntado" : "no esta apuntado"}
      </Button>
    </li>
  );
}
