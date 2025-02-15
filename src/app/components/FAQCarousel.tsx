// FAQCarousel.tsx

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** 
 * Your 6 FAQ items. We'll chunk them into 3 pages of 2 each.
 */
const FAQ_ITEMS = [
  {
    question: "Is KYC required for donors or recipients?",
    answer: `Donty does basic vetting on listed charities. 
Donors can review documentation, community feedback, and on-chain data for credibility.`,
  },
  {
    question: "How do I verify the legitimacy of a charity?",
    answer: `KYC isn’t mandatory on Donty. Some organizations or jurisdictions may require additional identity checks.`,
  },
  {
    question: "Can I integrate my existing wallet?",
    answer: `We support MetaMask, OKX web3 wallet, and others. 
For Web2 logins, we offer Google, Facebook, and Apple.`,
  },
  {
    question: "Where is Donty deployed?",
    answer: `Donty is currently deployed on the Base Sepolia testnet: 
https://chainlist.org/chain/84532?testnets=true`,
  },
  {
    question: "How do I get Base Sepolia ETH?",
    answer: `You can obtain Base Sepolia ETH from various faucets.
See: https://docs.base.org/docs/tools/network-faucets/`,
  },
  {
    question: "Are there any fees for using Donty?",
    answer: `Donty charges minimal fees for network costs. 
Donors still see exactly how much goes to each recipient.`,
  },
];

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// 2 FAQs per page => 3 total pages
const pages = chunkArray(FAQ_ITEMS, 2);
const totalPages = pages.length;

// Framer Motion slide variants (left/right)
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const AUTO_SCROLL_INTERVAL_MS = 14000; // 8 seconds

export default function FAQCarousel() {
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(0); // +1 forward, -1 backward
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Move to next page
  const goNext = () => {
    setDirection(1);
    setPageIndex((prev) => (prev + 1) % totalPages);
  };

  // Jump to a specific page (dot click)
  const goToPage = (idx: number) => {
    // determine direction
    setDirection(idx > pageIndex ? 1 : -1);
    setPageIndex(idx);
    // user has interacted, so disable auto scroll
    setAutoScrollEnabled(false);
  };

  // Start auto-scrolling if enabled
  const startAutoScroll = () => {
    if (timerRef.current) return; // already started
    timerRef.current = setInterval(() => {
      goNext();
    }, AUTO_SCROLL_INTERVAL_MS);
  };

  const stopAutoScroll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // On mount or changes to `autoScrollEnabled`, control the interval
  useEffect(() => {
    if (autoScrollEnabled) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
    // Cleanup on unmount
    return () => {
      stopAutoScroll();
    };
  }, [autoScrollEnabled]);

  const currentPageFaqs = pages[pageIndex];

  return (
    <div
      className="relative max-w-3xl mx-auto"
      // If user hovers, we pause auto-scrolling so they’re not disturbed
      onMouseEnter={() => setAutoScrollEnabled(false)}
      // If user leaves, we can resume auto-scrolling
      onMouseLeave={() => setAutoScrollEnabled(true)}
    >
      <div className="overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={pageIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {currentPageFaqs.map((item, i) => (
              <details
                key={i}
                className="p-4 bg-gray-50 dark:bg-zinc-900 
                           rounded cursor-pointer shadow"
              >
                <summary className="font-semibold text-lg select-none">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-gray-700 
                              dark:text-gray-300 whitespace-pre-line"
                >
                  {item.answer}
                </p>
              </details>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3 small dots for pagination */}
      <div className="flex justify-center mt-4 space-x-3">
        {pages.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to page ${idx + 1}`}
            onClick={() => goToPage(idx)}
            className={`
              h-2 w-2 rounded-full
              ${
                idx === pageIndex
                  ? "bg-gray-700 dark:bg-gray-100"
                  : "bg-gray-300 dark:bg-gray-600"
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}
