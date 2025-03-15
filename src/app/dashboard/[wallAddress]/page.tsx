'use client';

import { client } from "@/app/client";
import { EventCard } from "@/app/components/EventCard";
import { DonationDrive_Factory } from "@/app/constants/contracts";
import { useState, useEffect } from "react";
import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { deployPublishedContract } from "thirdweb/deploys";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import Navbar from "@/app/components/Navbar"; // <-- 1) Import your Navbar component
import Link from "next/link";


// Constants
const EVENTS_PER_PAGE = 12;

// Define Categories
const categories = [
    { id: 0, name: "NonProfit" },
    { id: 1, name: "AnimalCharities" },
    { id: 2, name: "UnderprivilegedGroup" },
    { id: 3, name: "PolyU" },
    { id: 4, name: "EIE" },
    { id: 5, name: "COMP" },
];




export default function DashboardPage() {
    const account = useActiveAccount();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    // 🧠 State Management
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortOption, setSortOption] = useState<string>("Newest");
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    // 📦 Contract Initialization
    const contract = getContract({
        client: client,
        chain: baseSepolia,
        address: DonationDrive_Factory,
    });

    // 📊 Fetch User Events
    const { data: myEvents, isLoading: isLoadingMyEvents } = useReadContract({
        contract,
        method:
            "function getUserEvents(address _user) view returns ((address eventAddress, address owner, string title, uint256 creationTime, string imageUrl, uint8 category)[])",
        params: [account?.address as string],
    });

    // 🔄 Filtering, Sorting, and Pagination
    useEffect(() => {
        if (myEvents) {
            let mutableEvents = Array.from(myEvents);

            // ✅ Category Filtering
            if (selectedCategory !== null) {
                mutableEvents = mutableEvents.filter(event => event.category === selectedCategory);
            }

            // ✅ Search Filtering
            if (searchQuery) {
                mutableEvents = mutableEvents.filter(event =>
                    event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    categories[event.category]?.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // ✅ Sorting
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
            }

            setFilteredEvents(mutableEvents);
            setCurrentPage(1); // Reset to page 1 when filtering/sorting changes
        }
    }, [myEvents, selectedCategory, searchQuery, sortOption]);

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
      <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 mt-4 sm:px-6 lg:px-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">🎯 Dashboard</p>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={() => setIsModalOpen(true)}
                >Create Event</button>
            </div>

            {/* Search Bar and Sorting Dropdown */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center items-center">
          {/* Search Bar */}
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

            {/* 📦 Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center max-w-[1200px] mx-auto mb-6">
                {isLoadingMyEvents ? (
                    <p className="text-center col-span-full text-gray-500 dark:text-gray-400 animate-pulse">
                        Loading your events...
                    </p>
                ) : currentEvents.length > 0 ? (
                    currentEvents.map((event) => (
                        <div key={event.eventAddress} className="flex justify-center">
                            <EventCard eventAddress={event.eventAddress} />
                        </div>
                    ))
                ) : (
                    <p className="text-center col-span-full">
                        No events found.
                    </p>
                )}
            </div>


            <div className="flex justify-center items-center gap-4 mt-8 mb-12">
                <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentPage === 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
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
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    Next →
                </button>
            </div>
            {isModalOpen && (
                <CreateEventModal
                    setIsModalOpen={setIsModalOpen}       
                />
            )}
        </div>
        
                 {/* Footer Section */}
                 <footer className="w-full py-6 bg-gray-100 dark:bg-zinc-900 mt-auto">
            <div className="container max-w-screen-lg mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Footer Text */}
            <p className="text-sm text-gray-700 dark:text-gray-300">
                &copy; {new Date().getFullYear()} CheungWanYin FYP Website. All rights reserved.
            </p>

            {/* Footer Buttons */}
            <div className="flex space-x-4">
                {/* Back to Homepage Button */}
                <Link href="/">
                <button
                    className="px-4 py-2 text-sm font-semibold 
                                border border-pink-400 text-pink-400 rounded 
                                hover:bg-pink-400 hover:text-white transition"
                >
                    Back to Homepage
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
            </div>
            </div>
        </footer>
      </main>
      
    );
}

type CreateEventModalProps = {
    setIsModalOpen: (value: boolean) => void
};

const CreateEventModal = ({ setIsModalOpen}: CreateEventModalProps ) => {
    const account = useActiveAccount();
    const [isDeployingContract, setIsDeployingContract] = useState<boolean>(false);
    const [eventTitle, setEventTitle] = useState<string>("");
    const [eventNarratives, setEventNarratives] = useState<string>("");
    const [eventImageUrl, setEventImageUrl] = useState<string>("");
    const [eventTarget, setEventTarget] = useState<number>(1);
    const [eventDeadline, setEventDeadline] = useState<number>(1);
    const [eventCategory, setEventCategory] = useState<number>(0);

      // Constants for limits
    const MAX_EVENT_TITLE_LENGTH = 60;
    const MAX_EVENT_NARRATIVES_LENGTH = 1200;
    const MAX_TARGET = 100_000_000;
    const MAX_DURATION = 1000;


    
    // Deploy contract from DonationDriveFactory
    const handleDeployContract = async () => {
        setIsDeployingContract(true);
    
        // Validation
        if (
            !eventTitle ||
            !eventNarratives ||
            !eventImageUrl ||
            eventTarget <= 0 ||
            eventDeadline <= 0
        ) {
            alert("Please fill in all the required fields with valid values.");
            setIsDeployingContract(false);
            return;
        }
    
        try {
            console.log("Deploying contract...");
    
            const contractAddress = await deployPublishedContract({
                client: client,
                chain: baseSepolia,
                account: account!,
                contractId: "DonationDrive",
                contractParams: {
                    _title: eventTitle,
                    _narratives: eventNarratives,
                    _imageUrl: eventImageUrl,
                    _target: eventTarget,
                    _durationInDays: eventDeadline,
                    _category: eventCategory
                },
                publisher: "0x77A343c5267B2A58011A18134e292a7A6a87daFE",
                version: "1.0.2",
            });
    
            alert("Contract deployed successfully! Address: " + contractAddress);
        } catch (error) {
            console.error("Deployment failed:", error);
            alert("Failed to deploy contract. Check the console for details.");
        } finally {
            setIsDeployingContract(false);
            setIsModalOpen(false);
        }
    };

    // Clamping functions
    const handleEventTitleChange = (value: string) => {
        // Clamp to 60 characters
        setEventTitle(value.slice(0, MAX_EVENT_TITLE_LENGTH));
    };

    const handleEventNarrativesChange = (value: string) => {
        // Clamp to 1200 characters
        setEventNarratives(value.slice(0, MAX_EVENT_NARRATIVES_LENGTH));
    };

    const handleEventTarget = (value: number) => {
        if (value < 1) {
        setEventTarget(1);
        } else if (value > MAX_TARGET) {
        setEventTarget(MAX_TARGET);
        } else {
        setEventTarget(value);
        }
    };

    const handleEventDeadline = (value: number) => {
        if (value < 1) {
        setEventDeadline(1);
        } else if (value > MAX_DURATION) {
        setEventDeadline(MAX_DURATION);
        } else {
        setEventDeadline(value);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🎟️ Create Event</h2>
            <button
                className="text-sm px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                onClick={() => setIsModalOpen(false)}
            >
                Close
            </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
            {/* Event Title */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Event Title:</label>
                <input
                type="text"
                value={eventTitle}
                // The `maxLength` attribute helps in browsers that enforce it
                maxLength={MAX_EVENT_TITLE_LENGTH}
                onChange={(e) => handleEventTitleChange(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                />
            </div>

            {/* Narratives */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Narratives:</label>
                <textarea
                value={eventNarratives}
                // The `maxLength` attribute helps in browsers that enforce it
                maxLength={MAX_EVENT_NARRATIVES_LENGTH}
                onChange={(e) => handleEventNarrativesChange(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                />
            </div>

            {/* Image URL (no limit) */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Image URL:</label>
                <input
                type="text"
                value={eventImageUrl}
                onChange={(e) => setEventImageUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                />
            </div>

            {/* Target */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Target:</label>
                <input
                type="number"
                value={eventTarget}
                min={1}
                max={MAX_TARGET}
                onChange={(e) => handleEventTarget(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                Range: 1 – {MAX_TARGET}
                </p>
            </div>

            {/* Duration in Days */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Duration in Days:</label>
                <input
                type="number"
                value={eventDeadline}
                min={1}
                max={MAX_DURATION}
                onChange={(e) => handleEventDeadline(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                Range: 1 – {MAX_DURATION} days
                </p>
            </div>

            {/* Category Dropdown */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Category:</label>
                <select
                value={eventCategory}
                onChange={(e) => setEventCategory(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                >
                <option value="" disabled>
                    -- Select a Category --
                </option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                    {category.name}
                    </option>
                ))}
                </select>
            </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-4 mt-6 border-t pt-4">
            <button
                className={`px-4 py-2 rounded-md text-white ${
                isDeployingContract
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={handleDeployContract}
                disabled={isDeployingContract}
            >
                {isDeployingContract ? "Deploying..." : "Deploy Contract"}
            </button>
            </div>   
        </div>    
    </div>
    );
};