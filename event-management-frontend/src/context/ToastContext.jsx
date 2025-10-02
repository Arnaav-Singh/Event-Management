import React, { createContext, useState, useContext } from "react";

export const ToastContext = createContext({ toast: { message: "", type: "" }, notify: () => {} });

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: "", type: "" });

  const notify = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  return (
    <ToastContext.Provider value={{ toast, notify }}>
      {children}
      {toast.message && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-white z-50 ${
            toast.type === "error"
              ? "bg-red-500"
              : toast.type === "success"
              ? "bg-green-500"
              : "bg-blue-500"
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);