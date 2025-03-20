"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion,useAnimation } from "framer-motion";
import FAQCarousel from "./components/FAQCarousel";
import { CollapsibleList } from "./components/CollapsibleList";
import { InteractiveFeatures } from "./components/InteractiveFeatures";
import EcosystemBadge from "./components/EcosystemBadge";
import FeatureCard from "./components/FeatureCard";


// -----------------------------
// Fade-in-up variants for Framer Motion
// -----------------------------
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const borrowFeatures = [
  { title: "Low costs", description: "Reduce your borrowing costs." },
  { title: "Higher collateralization factors", description: "Borrow more against your assets." },
  { title: "Per market rates", description: "Pay interest according to your collateral and risk." },
  { title: "Zero fees", description: "Borrowing with no extra charges." },
];

export default function Home() {

  const featuresData = [
    {
      title: "Transparency",
      description: "Donations are recorded on the blockchain for real-time tracking.",
    },
    {
      title: "Automation",
      description: "Funds are automatically released to charities via a smart contract.",
    },
    {
      title: "Reduced Costs & Time",
      description: "Enjoy faster, low-cost transactions through Base.",
    },
    {
      title: "Global Accessibility",
      description: "Enables worldwide contributions through Web3 wallets.",
    },
  ];

  // Dark Mode State & Effects
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const isDark = storedTheme === "dark";
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.classList.toggle("dark", newMode);
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  // -----------------------------
  // Marquee controls
  // -----------------------------
  const marqueeControls = useAnimation();

  // Start the marquee on mount
  useEffect(() => {
    marqueeControls.start({
      x: ["0%", "-50%"],
      transition: {
        duration: 12, // Adjust speed
        repeat: Infinity,
        ease: "linear",
      },
    });
  }, [marqueeControls]);

  // Pause/resume when hovering the marquee container
  const handleMarqueeMouseEnter = () => {
    marqueeControls.stop();
  };
  const handleMarqueeMouseLeave = () => {
    marqueeControls.start({
      x: ["0%", "-50%"],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "linear",
      },
    });
  };

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* HERO SECTION */}
      <motion.section
        id="hero"
        className="
          relative
          h-screen
          text-white
          bg-no-repeat bg-cover bg-center
          bg-[url('/colur_webpage_v3.png')]
          dark:bg-[url('/bg_colur_webpage_v3.png')]
        "
        variants={fadeInUpVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        {/* Dynamic Gradient Overlay */}
        <div className="absolute inset-0 dynamic-gradient" />

        {/* Icon at top-left */}
        <motion.div
          className="absolute top-8 left-6 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <a href="#content" className="inline-block hover:opacity-90 transition">
            <Image
              src="/donty.svg"
              alt="Donty Icon"
              width={300}
              height={300}
              className="mb-4"
            />
          </a>
        </motion.div>

        {/* Heading with delayed entry */}
        <div className="relative w-full h-full flex flex-col items-center justify-center px-4">
          <a href="#content" className="hover:underline">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="font-caveat text-5xl text-center hover:text-white transition"
            >
              The fragrance always stays in the hand that gives the rose.
            </motion.h1>
          </a>
        </div>
      </motion.section>

      {/* CONTENT SECTION */}
      <motion.section
        id="content"
        className="py-16 bg-gray-50 dark:bg-zinc-900"
        variants={fadeInUpVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container max-w-screen-lg mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Welcome to Donty
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {/* Launch App Button */}
            <Link href="/main">
              <button className="px-8 py-3 text-lg font-semibold 
                                border-2 border-pink-400 text-pink-400 rounded 
                                hover:bg-pink-400 hover:text-white transition">
                Launch App
              </button>
            </Link>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center gap-2 
                         px-8 py-3 text-lg font-semibold 
                         border-2 border-blue-400 text-blue-400 rounded 
                         hover:bg-blue-400 hover:text-white transition 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle Dark Mode"
            >
              <img
                src={isDarkMode ? "/sun.svg" : "/moon.svg"}
                alt="Theme Toggle"
                className="h-5 w-5 theme-icon"
              />
              <span className="text-gray-800 dark:text-gray-200">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>

            {/* Documentation Button */}
            <a
              href="https://wanyins-organization.gitbook.io/donty-docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                className="px-8 py-3 text-lg font-semibold 
                          border-2 border-green-400 text-green-400 rounded 
                          hover:bg-green-400 hover:text-white transition"
              >
                View Docs
              </button>
            </a>
          </div>

          {/* Content row (image + text) */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <Image
                src="/donty.svg"
                alt="Content Illustration"
                width={600}
                height={400}
                className="w-full h-auto rounded shadow"
              />
            </div>
            <div className="w-full md:w-1/2">
              <p className="mb-4">
                A charitable decentralized application (dApp) designed to help
                non-profit organizations raise funds and ensure transparency through Web3 technologies.
              </p>
              <p className="mb-4">
                Donty creates more efficient, transparent, secure, and decentralized
                systems, empowering donors and recipients while fostering trust
                and amplifying impact.
              </p>
            </div>
          </div>
        </div>
      </motion.section>


      {/* FEATURES SECTION  */}
      <InteractiveFeatures isDarkMode={isDarkMode} />



      {/* TEAM SECTION */}
      <motion.section
        id="team"
        className="py-16 bg-gray-50 dark:bg-zinc-900"
        variants={fadeInUpVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container max-w-screen-lg mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>

          {/* Flex container for three "cards" (left ASCII, center card, right ASCII) */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            
            {/* LEFT ASCII ART Card */}
            <div className="p-4 bg-white dark:bg-zinc-800 rounded shadow w-full max-w-sm text-center">
              <pre className="font-mono text-sm leading-tight text-gray-900 dark:text-gray-100 whitespace-pre">
      {`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣠⣠⣶⣿⣷⣿⣿⣿⣷⣷⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣤⣾⣿⢿⣻⡽⣞⣳⡽⠚⠉⠉⠙⠛⢿⣶⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣼⣿⣿⢻⣟⣧⢿⣻⢿⠀⠀⠀⠀⠀⠀⠀⠻⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⣾⣿⡿⠞⠛⠚⠫⣟⡿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠘⢿⣧⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣼⣿⡟⠀⠀⠀⠀⠀⠈⢻⡽⣆⠀⠀⣴⣷⡄⠀⠀⠀⠘⣿⡆⠀⠀⣀⣠⣤⡄
⠀⠀⣿⣿⠁⠀⠀⠀⠀⠀⠀⠈⣿⠿⢷⡀⠘⠛⠃⠀⠠⠀⠀⣿⣅⣴⡶⠟⠋⢹⣿
⠀⠀⢻⣿⡀⠀⠀⠀⢾⣿⡆⠀⢿⣴⣴⡇⠀⠀⠀⠀⠀⠀⢠⡟⠋⠁⠀⠀⠀⢸⣿
⠀⠀⠈⢿⣇⠀⠀⠀⠈⠉⠥⠀⠀⠉⠉⠀⠀⠀⠀⠀⠀⢀⡾⠁⠀⠀⠀⠀⠀⣾⡏
⠀⠀⠀⠈⢿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠸⠁⠀⠀⠀⠀⠀⣼⡟⠀
⠀⠀⠀⠀⠀⣹⣿⣶⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠁⠀⠐⢧⡀⠀⢀⣾⠟⠀⠀
⠀⠀⢀⣰⣾⠟⠉⠀⠀⠉⠉⠀⠐⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣶⡟⠋⠀⠀⠀
⣠⣶⡿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠈⣿⡆⠀⠀⠀⠀
⢻⣧⣄⠀⠀⠀⢰⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀
⠀⠉⠛⠿⣷⣶⣾⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣤⣾⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⣷⣦⡀⠀⢀⣀⠀⠀⠀⣠⣴⣿⣿⣿⣿⣷⠀⠀⠀⠀
⠀⠀⠀⠻⢿⣿⣿⣿⣿⠿⠿⠿⠿⠿⠿⠿⠿⣿⣿⣿⠿⠟⠁⠀
      `}
              </pre>
              <h3 className="font-semibold text-lg mb-2">Snowlo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Donty Ambassador
              </p>
            </div>

            {/* CENTER (CheungWanYin) */}
            <div className="p-4 bg-white dark:bg-zinc-800 rounded shadow w-full max-w-xs text-center">
              <Image
                src="/cat.jpg"
                alt="Team Member 1"
                width={120}
                height={120}
                className="mx-auto rounded-full mb-4"
              />

              {/* Clickable name linking to LinkedIn */}
              <a
                href="https://www.linkedin.com/in/wanyin-cheung-6916152ba/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h3 className="font-semibold text-lg text-blue-500 hover:underline">
                  CheungWanYin
                </h3>
              </a>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Polyu infoSecurity
              </p>
            </div>

            {/* RIGHT ASCII ART Card */}
            <div className="p-4 bg-white dark:bg-zinc-800 rounded shadow w-full max-w-sm text-center">
              <pre className="font-mono text-sm leading-tight text-gray-900 dark:text-gray-100 whitespace-pre">
      {`
⠀⠀⠀⠀    ⢀⣠⠤⠤⣀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⣚⣥⣤⠀⠀⢀⡷⠔⠒⠒⠲⠦⡀
    ⠀⠀⠀⠀⠀⠀⠀⠀⢀⢎⣾⣿⠟⠁⡠⠖⣡⣶⣶⣶⠀⠀⠀⡇
    ⠀⠀⠀⠀⠀⠀⠀⡔⣱⣿⠟⠁⡠⠊⣠⣾⣿⡿⠟⠁⠀⢀⠌
    ⠀⠀⠀⠀⢀⠔⠉⠀⠀⠀⠀⠉⠀⠘⠛⠛⠁⠀⣀⠤⠚⠁
⠀⠀⠀⡔⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢯⠁
⠀⠀⡸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢱ 
⠀⣰⠁⠀⣤⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹ 
⢰⠃⠀⠀⠛⠁⠐⠂⠀⣿⡗⠀⠀⠀⠀⠀⠀⠀⢹
⠈⢧⣠⣾⣷⣦⣠⣶⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⡇
⠒⠒⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⡰
⠀ ⠈⢿⣿⣿⣿⣿⣯⡉⠉⠉⠒⠲⢤⡔⠁
 ⢀⠔⠁⠈⠻⣿⣿⡿⡋⠉⠓⠦⡄⠀⠀⠉⢫⠉⡆
⠀⠀⠀⠀⠀⡐⠀⠀⠀⠈⢢⠤⠤⠜⠀⠀⠀⠀⡗⠁
⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⢇⡀⡖⠒⠒⠤⣀
      `}
              </pre>
              <h3 className="font-semibold text-lg mb-2">Floppy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Donty Ambassador
              </p>
            </div>
          </div>
        </div>
      </motion.section>


      {/* ECOSYSTEMS SECTION (Marquee) */}
      <motion.section
        id="ecosystems"
        className="py-16 overflow-hidden"
        variants={fadeInUpVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container max-w-screen-xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Ecosystems</h2>

          <div
            className="relative w-full overflow-hidden"
            onMouseEnter={handleMarqueeMouseEnter}
            onMouseLeave={handleMarqueeMouseLeave}
          >
            {/* The entire marquee uses marqueeControls for animation */}
            <motion.div
              className="flex gap-8 items-center"
              animate={marqueeControls}
            >
              {/* First set of ecosystem badges */}
              <EcosystemBadge name="Arbitrum" logoSrc="/Arbitrum.png" />
              <EcosystemBadge name="Base" logoSrc="/base.png" />
              <EcosystemBadge name="ETH" logoSrc="/eth.png" />
              <EcosystemBadge name="Mantle" logoSrc="/mantle.png" />
              <EcosystemBadge name="OKB" logoSrc="/okb.png" />
              <EcosystemBadge name="Ondo" logoSrc="/ondo.png" />
              <EcosystemBadge name="Optimism" logoSrc="/Optimism.png" />
              <EcosystemBadge name="Solana" logoSrc="/Solana.png" />
              <EcosystemBadge name="Sonic" logoSrc="/Sonic.png" />
              <EcosystemBadge name="zkSync" logoSrc="/Zksync.png" />

              {/* Duplicate set for seamless looping */}
              <EcosystemBadge name="Arbitrum" logoSrc="/Arbitrum.png" />
              <EcosystemBadge name="Base" logoSrc="/base.png" />
              <EcosystemBadge name="ETH" logoSrc="/eth.png" />
              <EcosystemBadge name="Mantle" logoSrc="/mantle.png" />
              <EcosystemBadge name="OKB" logoSrc="/okb.png" />
              <EcosystemBadge name="Ondo" logoSrc="/ondo.png" />
              <EcosystemBadge name="Optimism" logoSrc="/Optimism.png" />
              <EcosystemBadge name="Solana" logoSrc="/Solana.png" />
              <EcosystemBadge name="Sonic" logoSrc="/Sonic.png" />
              <EcosystemBadge name="zkSync" logoSrc="/Zksync.png" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ SECTION */}
      <motion.section
        id="faq"
        className="py-16"
        variants={fadeInUpVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container max-w-screen-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <FAQCarousel />
        </div>
      </motion.section>




      {/* FOOTER SECTION */}
      <footer className="w-full py-6 bg-gray-100 dark:bg-zinc-900 mt-auto">
        <div className="container max-w-screen-lg mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Footer Text */}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            &copy; {new Date().getFullYear()} CheungWanYin FYP Website. All rights reserved.
          </p>

          {/* Footer Navigation Links */}
          <div className="flex space-x-4 text-sm">
            <a href="#features" className="hover:underline">
              Features
            </a>
            <a href="#content" className="hover:underline">
              Content
            </a>
            <a href="#team" className="hover:underline">
              Team
            </a>
            <a href="#faq" className="hover:underline">
              FAQ
            </a>
          </div>

          {/* Footer Buttons */}
          <div className="flex space-x-4">
            {/* Launch App Button */}
            <Link href="/main">
              <button
                className="px-4 py-2 text-sm font-semibold 
                          border border-pink-400 text-pink-400 rounded 
                          hover:bg-pink-400 hover:text-white transition"
              >
                Launch App
              </button>
            </Link>

            {/* Documentation Button */}
            <a
              href="https://wanyins-organization.gitbook.io/donty-docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                className="px-4 py-2 text-sm font-semibold 
                          border border-green-400 text-green-400 rounded 
                          hover:bg-green-400 hover:text-white transition"
              >
                View Docs
              </button>
            </a>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle Dark Mode"
            >
              <img
                src={isDarkMode ? '/sun.svg' : '/moon.svg'}
                alt="Theme Toggle"
                className="h-6 w-6 theme-icon"
              />
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
