'use client';
import { client } from "@/app/client";
import Link from "next/link";
import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";
import { useEffect, useState } from "react";
import Image from 'next/image';


// Define Categories Mapping
const categories = [
    { id: 0, name: "NonProfit" },
    { id: 1, name: "AnimalCharities" },
    { id: 2, name: "UnderprivilegedGroup" },
    { id: 3, name: "PolyU" },
    { id: 4, name: "EIE" },
    { id: 5, name: "COMP" },
];

type EventProps = {
    eventAddress: string;
};

export const EventCard: React.FC<EventProps> = ({ eventAddress }) => {
    const [balancePercentage, setBalancePercentage] = useState<number>(0);
    const [categoryName, setCategoryName] = useState<string>("Loading...");


    const contract = getContract({
        client,
        chain: baseSepolia,
        address: eventAddress,
    });

    const { data: eventTitle, isLoading: isLoadingTitle } = useReadContract({
        contract,
        method: "function title() view returns (string)",
        params: [],
    });

    const { data: eventNarratives, isLoading: isLoadingNarratives } = useReadContract({
        contract,
        method: "function narratives() view returns (string)",
        params: [],
    });

    const { data: categoryId, isLoading: isLoadingCategory } = useReadContract({
        contract,
        method: "function getCategory() view returns (uint8)",
        params: [],
    });

    const { data: eventImageUrl, isLoading: isLoadingImageUrl } = useReadContract({
        contract,
        method: "function getImageUrl() view returns (string)",
        params: [],
    });

    const { data: balance, isLoading: isLoadingBalance } = useReadContract({
        contract,
        method: "function getContractBalance() view returns (uint256)",
        params: [],
    });

    const { data: target, isLoading: isLoadingTarget } = useReadContract({
        contract,
        method: "function target() view returns (uint256)",
        params: [],
    });

    // Map categoryId to a readable string
    useEffect(() => {
        if (categoryId !== undefined) {
            const category = categories.find((cat) => cat.id === Number(categoryId));
            setCategoryName(category ? category.name : "Unknown");
        }
    }, [categoryId]);

    useEffect(() => {
        if (balance && target) {
            const balanceNum = parseInt(balance?.toString() || "0", 10);
            const targetNum = parseInt(target?.toString() || "1", 10);
            let percentage = (balanceNum / targetNum) * 100;
            if (percentage > 100) percentage = 100;
            setBalancePercentage(percentage);
        }
    }, [balance, target]);

    const isLoading =
        isLoadingTitle ||
        isLoadingNarratives ||
        isLoadingCategory ||
        isLoadingImageUrl ||
        isLoadingBalance ||
        isLoadingTarget;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-80 w-72 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <p>Loading event data...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-between w-72 h-96 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden transition-colors duration-300">
            {/* Event Image */}
            {eventImageUrl ? (
                <Image
                    src={eventImageUrl}
                    alt="Event"
                    width={72}  // corresponds roughly to your container width (w-72)
                    height={48} // corresponds roughly to your container height (h-48)
                    className="object-cover rounded-t-lg"
                />
            ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-zinc-700 rounded-t-lg"></div>
            )}

            {/* Event Details */}
            <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                    <h5 className="mb-2 text-xl font-semibold text-gray-900 dark:text-neutral-100">
                        {eventTitle || "No Title"}
                    </h5>

                    <p className="mb-3 text-sm text-gray-600 dark:text-neutral-400">
                        <strong>Category:</strong> {categoryName || "Unknown"}
                    </p>
                </div>

                {/* Balance Progress */}
                <div className="mb-4">
                    <div className="relative w-full h-4 bg-gray-200 dark:bg-zinc-700 rounded-full">
                        <div
                            className="h-4 bg-blue-600 rounded-full text-right"
                            style={{ width: `${balancePercentage}%` }}
                        >
                            <p className="text-white text-xs p-0.5">
                                ${balance?.toString()}
                            </p>
                        </div>
                        <p className="absolute top-0 right-0 text-xs text-gray-700 dark:text-gray-300 p-0.5">
                            {balancePercentage >= 100 ? "100%" : `${balancePercentage.toFixed(0)}%`}
                        </p>
                    </div>
                </div>

                {/* View Event Button */}
                <Link 
                    href={`/event/${eventAddress}`} 
                    passHref={true}
                >
                    <p className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300">
                        View Event
                    </p>
                </Link>
            </div>
        </div>
    );
};
