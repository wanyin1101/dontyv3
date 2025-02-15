import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FEATURE_ITEMS } from "./FeatureData";

export function InteractiveFeatures({ isDarkMode }: { isDarkMode: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = FEATURE_ITEMS[activeIndex];

  return (
    <section
      className={`py-16 transition-colors duration-300 ${
        isDarkMode ? "bg-zinc-950 text-white" : "bg-gray-50 text-black"
      }`}
    >
      {/* Centered Title */}
      <h2 className="text-3xl font-bold text-center mb-8">Features</h2>

      {/* Large Rounded Rectangle */}
      <div
        className={`max-w-6xl mx-auto overflow-hidden rounded-xl shadow-lg ${
          isDarkMode ? "bg-zinc-900" : "bg-white"
        }`}
      >
        <div className="flex flex-col lg:flex-row w-full h-[550px] lg:h-[650px]">
          {/* LEFT: Larger image display */}
          <div className="relative lg:w-1/2 h-[350px] lg:h-full">
            <Image
              src={activeFeature.imageSrc}
              alt={activeFeature.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* RIGHT: Feature Info */}
          <div className="lg:w-1/2 p-8 flex flex-col">
            {/* Active Feature Title + Description */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{activeFeature.title}</h3>
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {activeFeature.description}
              </p>
            </div>

            {/* Clickable List */}
            <div className="space-y-4">
              {FEATURE_ITEMS.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-full text-left p-4 rounded transition-colors outline-none focus:outline-none ${
                      isActive
                        ? isDarkMode
                          ? "bg-zinc-800 border border-gray-700"
                          : "bg-gray-200 border border-gray-400"
                        : isDarkMode
                        ? "bg-zinc-800/50 hover:bg-zinc-800"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <p className="font-semibold text-lg">{item.title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
