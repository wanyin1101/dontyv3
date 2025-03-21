"use client";

import React, { useState } from "react";
import Image from "next/image";
import { defineChain, getContract } from "thirdweb";
import { client } from "@/app/client";
import { claimTo } from "thirdweb/extensions/erc721";
import { baseSepolia } from "thirdweb/chains";
import { TransactionButton, useActiveAccount } from "thirdweb/react";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// Data for each container/card with unique addresses
const containersData = [
  {
    title: "SlowLo",
    image: "/slowlo.png",
    description: "Meet SlowLo !",
    address: "0x79dc3441FB8d05BeA4Edf372C0BF1c36be4ae8C8",
  },
  {
    title: "Floppy",
    image: "/floppy.png",
    description: "Hop into hope with Floppy!",
    address: "0x93c8EF9F13C2c00223c51Eca6fC91A77b1174E6c",
  },
  {
    title: "Original Rose",
    image: "/BG_webpage_.png",
    description: "Timeless essence of Donty—Original Rose.",
    address: "0xe1Fd326E6325e923F3C6278d9cF82665CB6735B6",
  },
  {
    title: "Colur Rose",
    image: "/colur_webpage_v3.png",
    description: "Brighten your day with Color Rose!",
    address: "0xe89c861642e1Bf24121840234880e89fE28DeefC",
  },
  {
    title: "Dark Rose",
    image: "/bg_colur_webpage_v3.png",
    description: "Embrace the mystery of Dark Rose!",
    address: "0xa13492E9aC4d4Bed1742aB69AdCE56455961f10b",
  },
];

export default function SouvenirPage() {
  const account = useActiveAccount();
  const [activeIndex, setActiveIndex] = useState(0);

  // Handle next/previous logic
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % containersData.length);
  };

  const handlePrevious = () => {
    setActiveIndex((prev) =>
      (prev + containersData.length - 1) % containersData.length
    );
  };

  return (
    <main
      className={`
        min-h-screen
        flex flex-col
        bg-cover bg-center bg-no-repeat
        text-gray-900 dark:text-gray-100
        transition-colors duration-300
        // Light mode image
        bg-[url('/colur_webpage_v3.png')]
        // Dark mode image
        dark:bg-[url('/bg_colur_webpage_v3.png')]
      `}
    >
      {/* Top Navbar */}
      <Navbar />

      {/* Centered Content Container with Light/Dark Background */}
      <div className="flex flex-col flex-1 items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          {/* Left Arrow */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 transform p-4 transition-transform z-10 hover:scale-110"
          >
            <Image
              src="/Left.svg"
              alt="Left Arrow"
              width={32}
              height={32}
              className="object-contain dark:invert"
            />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 transform p-4 transition-transform z-10 hover:scale-110"
          >
            <Image
              src="/right.svg"
              alt="Right Arrow"
              width={32}
              height={32}
              className="object-contain dark:invert"
            />
          </button>

          {/* AnimatePresence for smooth transitions */}
          
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeIndex}
              className="
                w-full
                h-[550px]
                bg-white/80 dark:bg-gray-900/80
                backdrop-blur-sm
                rounded-lg
                shadow-lg
                p-8
                transition-colors
                duration-300
                flex
                flex-col
                justify-between
              "
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Page Heading (Title) */}
              <h1
                className="
                  font-caveat
                  text-5xl
                  text-center
                  transition
                  hover:text-white
                "
              >
                {containersData[activeIndex].title}
              </h1>

              {/* Image Container */}
              <div className="flex justify-center items-center my-4 h-[250px]">
                <Image
                  src={containersData[activeIndex].image}
                  alt="Preview NFT Image"
                  width={250}
                  height={250}
                  className="object-contain"
                />
              </div>

              {/* Description */}
              <p
                className="
                  font-caveat
                  text-2xl
                  text-center
                  mb-4
                  transition
                  hover:text-white
                "
              >
                {containersData[activeIndex].description}
              </p>

              {/* Transaction Button */}
              <div className="flex justify-center">
                <TransactionButton
                  transaction={() =>
                    claimTo({
                      contract: getContract({
                        client: client,
                        chain: defineChain(baseSepolia),
                        address: containersData[activeIndex].address,
                      }),
                      to: account?.address || "",
                      quantity: 1n,
                    })
                  }
                  onTransactionSent={() => {
                    // Show a yellow toast while the transaction is pending
                    toast.warning("Transaction pending...");
                  }}
                  onTransactionConfirmed={() => {
                    // Show a green toast on success
                    toast.success("NFT claimed successfully!");
                  }}
                  onError={(error) => {
                    // Show a red toast on error
                    if (error instanceof Error) {
                      toast.error(`Failed to NFT claimed: ${error.message}`);
                    } else {
                      toast.error("Failed to NFT claimed: Unknown error");
                    }
                  }}
                  className="
                    px-4 py-2
                    bg-blue-500 hover:bg-blue-600
                    dark:bg-blue-600 dark:hover:bg-blue-700
                    text-white
                    font-medium
                    rounded-md
                    transition-colors duration-300
                  "
                >
                  Claim NFT
                </TransactionButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
