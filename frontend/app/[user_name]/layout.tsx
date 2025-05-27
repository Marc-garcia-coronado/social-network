import type { Metadata } from "next";
import "../globals.css";
import DockComponent from "@/components/DockComponent";
import { MessagesProvider } from "@/contexts/MessagesContext";

export const metadata: Metadata = {
  title: "Flexin | Share your game, own your vibe",
  description: "Flexin | Share your game, own your vibe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MessagesProvider>{children}</MessagesProvider>
      <div className="max-h-14 fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 flex justify-center items-center w-full p-4">
        <DockComponent />
      </div>
    </>
  );
}
