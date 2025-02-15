'use client';

import { getContract } from "thirdweb";
import { useEffect, useState } from "react";
import { client } from "@/app/client";
import { baseSepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";
import { DonationDrive_Factory } from "../constants/contracts";
import { EventCard } from "../components/EventCard";
import Navbar from "@/app/components/Navbar"; // <-- 1) Import your Navbar component


export default function ReferencePage() {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Navbar />
        <main className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Reference Page</h1>
          <p>This is the reference page where all footer and page links are redirected.</p>
        </main>
      </main>
    );
}
