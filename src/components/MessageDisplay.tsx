"use client";
import React, { useEffect, useState } from "react";
import { useMessages } from "../context/useMessage";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
  error: <XCircle className="w-5 h-5 text-red-600" />,
  info: <Info className="w-5 h-5 text-blue-600" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
};

const MessageDisplay: React.FC = () => {
  const { message, type, setMessage } = useMessages();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (message && isMounted) {
      setIsVisible(true);

      const timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 4500);

      const removeMessageTimeoutId = setTimeout(() => {
        setMessage(null, type);
      }, 5000);

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(removeMessageTimeoutId);
      };
    }
  }, [message, setMessage, type, isMounted]);

  const messageStyles = {
    success: "border-emerald-600 bg-emerald-50 text-emerald-800",
    error: "border-red-600 bg-red-50 text-red-800",
    info: "border-blue-600 bg-blue-50 text-blue-800",
    warning: "border-yellow-600 bg-yellow-50 text-yellow-800",
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="z-50 fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
      {message && (
        <div
          className={`flex items-start gap-3 border rounded-lg p-4 shadow-lg transition-all duration-500 ease-in-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } ${type ? messageStyles[type] : "bg-gray-100 border-gray-300 text-gray-800"}`}
        >
          <div className="mt-0.5">{type && icons[type]}</div>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
    </div>
  );
};

export default MessageDisplay;
