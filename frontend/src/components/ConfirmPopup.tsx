// components/ui/ConfirmPopup.tsx

import React from "react";

interface ConfirmPopupProps {
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
  title = "Xác nhận",
  message,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white shadow-lg rounded-xl p-6 w-96 relative animate-pop-in">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ❌
        </button>
        <h2 className="text-xl font-semibold text-center mb-2">{title}</h2>
        <p className="text-gray-700 text-center">{message}</p>
        <div className="flex justify-center mt-4 gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            ✅ Đồng ý
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
          >
            ❌ Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
