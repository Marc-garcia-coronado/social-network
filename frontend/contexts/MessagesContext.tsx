// context/MessagesContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

type MessagesContextType = {
  numberNotReadedMsg: Record<number, number>;
  setNumberNotReadedMsg: React.Dispatch<React.SetStateAction<Record<number, number>>>;
};

const MessagesContext = createContext<MessagesContextType | null>(null);

export const MessagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [numberNotReadedMsg, setNumberNotReadedMsg] = useState<Record<number, number>>({});

  return (
    <MessagesContext.Provider value={{ numberNotReadedMsg, setNumberNotReadedMsg }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessagesContext = () => {
  const context = useContext(MessagesContext);
  if (!context) throw new Error('useMessagesContext must be used inside MessagesProvider');
  return context;
};
