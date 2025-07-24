"use client"
import React, { createContext, useState, ReactNode } from 'react';

// Type for the message
export type MessageType = 'success' | 'error' | 'info' | 'warning' | null;

// Type for the context
export interface MessageContextType {
  message: string | null;
  type: MessageType;
  setMessage: (message: string | null, type: MessageType) => void;
}

// Create the context with a default value
export const MessageContext = createContext<MessageContextType | undefined>(undefined);

type MessageProviderProps = {
  children: ReactNode;
};

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<MessageType>(null);

  const updateMessage = (message: string | null, type: MessageType) => {
    setMessage(message);
    setType(type);
  };

  return (
    <MessageContext.Provider value={{ message, type, setMessage: updateMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
