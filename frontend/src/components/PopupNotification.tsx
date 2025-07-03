import React from "react";

interface PopupNotificationProps {
  message: string;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

const PopupNotification: React.FC<PopupNotificationProps> = ({
  message,
  onClose,
  onLogin,
  onRegister,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white shadow-xl border rounded-lg p-6 w-96 animate-pop-in relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ❌
        </button>
        <div className="text-gray-800 text-center">{message}</div>
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button
            onClick={onLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Đăng nhập
          </button>

          <span className="text-gray-500 font-semibold">hoặc</span>

          <button
            onClick={onRegister}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupNotification;
