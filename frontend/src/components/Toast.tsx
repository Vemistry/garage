// components/Toast.tsx

import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50`}>
      <div
        className={`${typeColor} text-white px-4 py-2 rounded shadow-md animate-pop-in`}
      >
        {message}
      </div>
    </div>
  );
};

export default Toast;
