"use client"
import { useUserContext } from "@/contexts/UserContext";
import Dock from "@/src/blocks/Components/Dock/Dock";
import { House, CalendarPlus2, Plus, UserRound } from 'lucide-react';
import { useRouter } from "next/navigation";

const DockComponent = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const items = [
    { icon: <House color="white"/>, label: 'Home', onClick: () => router.push("/home") },
    { icon: <CalendarPlus2 color="white"/>, label: 'Events', onClick: () => router.push("/events") },
    { icon: <Plus color="white"/>, label: 'Post', onClick: () => router.push("/post") },
    { icon: <UserRound color="white"/>, label: 'Profile', onClick: () => router.push(user?.user_name || "/404") },
  ];

  return (
    <Dock 
      items={items}
      panelHeight={68}
      baseItemSize={50}
      magnification={70}
      spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
    />
  );
};

export default DockComponent;