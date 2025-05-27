"use client";

import { motion } from "motion/react";
import { BentoGridSecondComponent } from "@/components/BentoGridSecondComponent";
import EventComponentLanding from "@/components/EventComponentLanding";
import { HeroSectionOne } from "@/components/HeroSection";
import { InfiniteMovingCardsComponent } from "@/components/InfiniteMovingCardsComponent";
import { Event } from "@/lib/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<boolean>(false);
  const router = useRouter()

  useEffect(() => {
    fetch("https://social-network-production.up.railway.app/api/events/closest", {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => setEvents(res.events))
      .catch(() => setError(true));
  }, []);

  return (
    <>
      <HeroSectionOne />
      <section className="flex flex-col gap-10 my-20">
        <h2 className="text-5xl font-extrabold text-center w-4/6 mx-auto">
          Todo en un solo lugar para los amantes del deporte
        </h2>
        <BentoGridSecondComponent />
      </section>
      <section className="flex flex-col gap-10 my-20">
        <h2 className="text-5xl font-extrabold text-center w-4/6 mx-auto">
          No solo se habla de deporte. ¡Se vive!
        </h2>
        <p className="text-center text-lg font-normal text-neutral-600 dark:text-neutral-300">
          Próximos eventos...
        </p>
        {events?.length === 0 && !error && <p>Cargando...</p>}
        {error && (
          <p className="text-red-500 text-center">
            ¡Ha ocurrido un error al obtener los próximos eventos!
          </p>
        )}
        {Array?.isArray(events) && events?.length > 0 && (
          <ul className="flex flex-wrap gap-4 justify-center">
            {events?.map((event) => (
              <li key={event?.id}>
                <EventComponentLanding event={event} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="flex flex-col gap-10 my-20">
        <h2 className="text-5xl font-extrabold text-center w-4/6 mx-auto">
          Lo que dice nuestra comunidad
        </h2>
        <InfiniteMovingCardsComponent />
      </section>
      <section className="flex flex-col gap-10 my-20">
        <h2 className="text-5xl font-extrabold text-center w-4/6 mx-auto">
          ¿Estás listo para llevar tu pasión al siguiente nivel?
        </h2>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            onClick={() => router.push("/login")}
          >
            Crea tu cuenta gratis
          </button>
        </motion.div>
      </section>
    </>
  );
}
