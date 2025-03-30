'use client';

import { getContract } from "thirdweb";
import { useEffect, useState } from "react";
import { client } from "@/app/client";
import { baseSepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";
import { DonationDrive_Factory } from "../constants/contracts";
import { EventCard } from "../components/EventCard";
import Navbar from "@/app/components/Navbar"; // Import Navbar component
import Footer from "../components/Footer"; // Import Footer component

// Define Categories
const categories = [
  { id: 0, name: "NonProfit" },
  { id: 1, name: "AnimalCharities" },
  { id: 2, name: "UnderprivilegedGroup" },
  { id: 3, name: "PolyU" },
  { id: 4, name: "EIE" },
  { id: 5, name: "COMP" },
];

// Events per page constant
const EVENTS_PER_PAGE = 12;

export default function MainPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for Search Query
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOption, setSortOption] = useState<string>("Trending"); // Sorting state
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false); // Dropdown toggle

  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: DonationDrive_Factory,
  });

  const { data: events, isLoading } = useReadContract({
    contract,
    method:
      "function getAllEvents() view returns ((address eventAddress, address owner, string title, uint256 creationTime, string imageUrl, uint8 category)[])",
    params: [],
  });

  // Filter Events based on Category, Search Query, and Sort Option
  useEffect(() => {
    if (events) {
      let mutableEvents = Array.from(events);

      // Filter by Category
      if (selectedCategory !== null) {
        mutableEvents = mutableEvents.filter(
          (event) => event.category === selectedCategory
        );
      }

      // Filter by Search Query
      if (searchQuery) {
        mutableEvents = mutableEvents.filter(
          (event) =>
            event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            categories[event.category]?.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }

      // Sort by Selected Option
      switch (sortOption) {
        case "Top":
          mutableEvents.sort((a, b) => (b.owner?.length || 0) - (a.owner?.length || 0));
          break;
        case "Newest":
          mutableEvents.sort((a, b) => Number(b.creationTime) - Number(a.creationTime));
          break;
        case "Oldest":
          mutableEvents.sort((a, b) => Number(a.creationTime) - Number(b.creationTime));
          break;
        default:
          break;
      }

      setFilteredEvents(mutableEvents);
      setCurrentPage(1); // Reset to page 1 when filtering or sorting
    }
  }, [events, selectedCategory, searchQuery, sortOption]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);

  // Get current page's events
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );

  // Handle page navigation
  const goToPreviousPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Navbar at the top */}
      <Navbar />

      {/* Main content that expands */}
      <main className="flex-grow p-6">
        {/* Search Bar and Sorting Dropdown */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center items-center">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-md border border-gray-300 bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />

          {/* Sorting Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            >
              <span>{sortOption}</span>
              <span>▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full mt-1 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10">
                <ul className="text-sm">
                  <li
                    onClick={() => {
                      setSortOption("Top");
                      setDropdownOpen(false);
                    }}
                    className="cursor-pointer px-4 py-2 hover:bg-blue-100 dark:hover:bg-gray-700"
                  >
                    🔝 Trending
                  </li>
                  <li
                    onClick={() => {
                      setSortOption("Newest");
                      setDropdownOpen(false);
                    }}
                    className="cursor-pointer px-4 py-2 hover:bg-blue-100 dark:hover:bg-gray-700"
                  >
                    🆕 Newest
                  </li>
                  <li
                    onClick={() => {
                      setSortOption("Oldest");
                      setDropdownOpen(false);
                    }}
                    className="cursor-pointer px-4 py-2 hover:bg-blue-100 dark:hover:bg-gray-700"
                  >
                    🕒 Oldest
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSortOption("Trending");
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedCategory === null && sortOption === "Trending"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            } hover:bg-blue-500 hover:text-white`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              } hover:bg-blue-500 hover:text-white`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center max-w-[1200px] mx-auto mb-6">
          {!isLoading && currentEvents.length > 0 ? (
            currentEvents.map((event) => (
              <div key={event.eventAddress} className="flex justify-center">
                <EventCard eventAddress={event.eventAddress} />
              </div>
            ))
          ) : (
            <p className="text-center col-span-full">
              {isLoading ? "Loading events..." : "No events found"}
            </p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            ← Previous
          </button>

          <span className="text-sm font-medium px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              currentPage === totalPages || totalPages === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next →
          </button>
        </div>
      </main>

      {/* Footer remains at the bottom */}
      <Footer />
    </div>
  );
}
