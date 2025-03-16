"use client"; // This must be a client component

import React from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThirdwebProvider>
      {/* The rest of your app can now use thirdweb context */}
      {children}
      {/* React Toastify container for pop-up notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" 
      />
    </ThirdwebProvider>
  );
}
