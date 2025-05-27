import { motion } from "motion/react";
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";
import {
  IconBallBasketball,
  IconBike,
  IconCalendar,
  IconCamera,
  IconChessKnight,
  IconGymnastics,
  IconRun,
  IconSwimming,
  IconUser,
} from "@tabler/icons-react";
import Image from "next/image";

export function BentoGridSecondComponent() {
  return (
    <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={item.className}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  );
}

const SkeletonOne = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2  items-center space-x-2 bg-white dark:bg-black"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
        <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 w-3/4 ml-auto bg-white dark:bg-black"
      >
        <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
      </motion.div>
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 bg-white dark:bg-black"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
        <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
      </motion.div>
    </motion.div>
  );
};

const SkeletonThree = () => {
  const first = {
    initial: {
      y: 10,
      rotate: -5,
    },
    hover: {
      y: 0,
      rotate: 0,
    },
  };
  const second = {
    initial: {
      y: -10,
      rotate: 5,
    },
    hover: {
      y: 0,
      rotate: 0,
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row items-center justify-center space-x-2"
    >
      <motion.div
        variants={first}
        className="h-fit w-1/6 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
      >
        <IconSwimming className="h-10 w-10" />
        <p className="border border-blue-500 bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Natación
        </p>
      </motion.div>
      <motion.div
        variants={second}
        className="h-fit relative z-20 w-1/6 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
      >
        <IconBike className="h-10 w-10" />
        <p className="border border-emerald-500 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Ciclismo
        </p>
      </motion.div>
      <motion.div
        variants={first}
        className="h-fit w-1/6 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
      >
        <IconChessKnight className="h-10 w-10" />
        <p className="border border-yellow-500 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Ajedrez
        </p>
      </motion.div>
      <motion.div
        variants={second}
        className="h-fit w-1/6 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
      >
        <IconRun className="h-10 w-10" />
        <p className="border border-violet-500 bg-violet-100 dark:bg-violet-900/20 text-violet-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Atletismo
        </p>
      </motion.div>
      <motion.div
        variants={first}
        className="h-fit relative z-20 w-1/6 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
      >
        <IconGymnastics className="h-10 w-10" />
        <p className="border border-rose-500 bg-rose-100 dark:bg-rose-900/20 text-rose-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Gimnasia
        </p>
      </motion.div>
    </motion.div>
  );
};
const SkeletonFour = () => {
  const first = {
    initial: {
      x: 20,
      rotate: -5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  const second = {
    initial: {
      x: -20,
      rotate: 5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-2"
    >
      <motion.div
        variants={first}
        className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
      >
        <Image
          src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="avatar"
          height={100}
          width={100}
          className="rounded-full h-10 w-10"
          loading="lazy"
        />
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
          Martí Serra
        </p>
        <p className="border border-red-500 bg-red-100 dark:bg-red-900/20 text-red-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Golf
        </p>
      </motion.div>
      <motion.div className="h-full relative z-20 w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="avatar"
          height={100}
          width={100}
          className="rounded-full h-10 w-10"
          loading="lazy"
        />
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
          Kevin Hard
        </p>
        <p className="border border-green-500 bg-green-100 dark:bg-green-900/20 text-green-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Basketball
        </p>
      </motion.div>
      <motion.div
        variants={second}
        className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
      >
        <Image
          src="https://images.unsplash.com/photo-1586299485759-f62264d6b63f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="avatar"
          height={100}
          width={100}
          className="rounded-full h-10 w-10"
          loading="lazy"
        />
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
          Sandra Jimenez
        </p>
        <p className="border border-orange-500 bg-orange-100 dark:bg-orange-900/20 text-orange-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Football
        </p>
      </motion.div>
    </motion.div>
  );
};
const SkeletonFive = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-2xl border border-neutral-100 dark:border-white/[0.2] p-2  items-center space-x-2 bg-white dark:bg-black"
      >
        <Image
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="avatar"
          height={100}
          width={100}
          className="rounded-full h-10 w-10"
          loading="lazy"
        />
        <p className="text-xs text-neutral-500">
          Me encanta hacer deporte con gente nueva, descubrir nuevas disciplinas
          y compartir cada experiencia que vivo.
        </p>
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center justify-end space-x-2 w-3/4 ml-auto bg-white dark:bg-black"
      >
        <p className="text-xs text-neutral-500">¡Totalmente! Es lo mejor.</p>
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
      </motion.div>
    </motion.div>
  );
};
const items = [
  {
    title: "Sigue tus deportes favoritos",
    description:
      "Personaliza tu feed con temas como fútbol, baloncesto, running y más.",
    header: <SkeletonThree />,
    className: "md:col-span-2",
    icon: <IconBallBasketball className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Publica y comenta",
    description:
      "Comparte tus partidos, entrenamientos o noticias con la comunidad.",
    header: <SkeletonFive />,
    className: "md:col-span-1",
    icon: <IconCamera className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Eventos deportivos reales",
    description: "Únete a partidos y quedadas organizadas por otros usuarios.",
    header: <SkeletonOne />,
    className: "md:col-span-1",
    icon: <IconCalendar className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Comunidad activa",
    description: "Conecta, comenta y haz equipo con otros deportistas y fans.",
    header: <SkeletonFour />,
    className: "md:col-span-2",
    icon: <IconUser className="h-4 w-4 text-neutral-500" />,
  },
];
