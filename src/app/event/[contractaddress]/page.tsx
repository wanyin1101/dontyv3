// page.tsx
'use client';
import { client } from "@/app/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getContract, prepareContractCall, ThirdwebContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { lightTheme, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { TierCard } from "@/app/components/TierCard";
import Navbar from "@/app/components/Navbar"; 
import { toast } from "react-toastify";


// Category Mapping
const categories = [
  { id: 0, name: "NonProfit" },
  { id: 1, name: "AnimalCharities" },
  { id: 2, name: "UnderprivilegedGroup" },
  { id: 3, name: "PolyU" },
  { id: 4, name: "EIE" },
  { id: 5, name: "COMP" },
];

// State Mapping
const states = [
  { id: 0, name: "Active" },
  { id: 1, name: "Successful" },
  { id: 2, name: "Failed" },
];

// Wrapper Component: Retrieves eventAddress from URL parameters.
export default function EventPage() {
  const params = useParams();
  const rawAddress = params?.contractaddress;  // can be string | string[] | undefined

  // Convert to a single string if it's an array
  const eventAddress = Array.isArray(rawAddress) ? rawAddress[0] : rawAddress;

  if (!eventAddress) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">Error: Invalid or missing event address.</p>
      </div>
    );
  }

  // Now that eventAddress is a guaranteed string, render the main content.
  return <EventPageContent eventAddress={eventAddress} />;
}

type EventPageContentProps = {
  eventAddress: string;
};

function EventPageContent({ eventAddress }: EventPageContentProps) {
  const account = useActiveAccount();
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [balancePercentage, setBalancePercentage] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: eventAddress,
  });

  // Fetch contract data using useReadContract hooks
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

  const { data: eventCategory, isLoading: isLoadingCategory } = useReadContract({
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

  const { data: deadline, isLoading: isLoadingDeadline } = useReadContract({
    contract,
    method: "function deadline() view returns (uint256)",
    params: [],
  });

  const deadlineDate = new Date(parseInt(deadline?.toString() || "0") * 1000);
  const deadlineDatePassed = deadlineDate < new Date();

  const { data: owner, isLoading: isLoadingOwner } = useReadContract({
    contract,
    method: "function owner() view returns (address)",
    params: [],
  });

  const { data: state, isLoading: isLoadingState } = useReadContract({
    contract,
    method: "function state() view returns (uint8)",
    params: [],
  });

  const { data: tiers, isLoading: isLoadingTiers } = useReadContract({
    contract,
    method: "function getTiers() view returns ((string title, uint256 amount, uint256 donors)[])",
    params: [],
  });

  const isLoading =
    isLoadingTitle ||
    isLoadingNarratives ||
    isLoadingCategory ||
    isLoadingImageUrl ||
    isLoadingBalance ||
    isLoadingTarget ||
    isLoadingDeadline ||
    isLoadingTiers ||
    isLoadingState ||
    isLoadingOwner;

  // Map category and state IDs to readable names
  const getCategoryName = (id: number) => categories.find((cat) => cat.id === id)?.name || "Unknown";
  const getStateName = (id: number) => states.find((st) => st.id === id)?.name || "Unknown";

  // Calculate Funding Progress Percentage
  useEffect(() => {
    if (balance && target) {
      const balanceNum = parseInt(balance?.toString() || "0", 10);
      const targetNum = parseInt(target?.toString() || "1", 10);
      let percentage = (balanceNum / targetNum) * 100;
      setBalancePercentage(percentage > 100 ? 100 : percentage);
    }
  }, [balance, target]);

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-lg rounded-md">
        {isLoading ? (
          <div className="text-center text-lg">Loading event details...</div>
        ) : (
          <>
            {/* Event Title with Edit Button */}
            <div className="flex flex-col items-center justify-center text-center mb-6 relative">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {eventTitle || "No Title"}
              </h1>
              {owner === account?.address && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                  {isEditing && (
                    <p className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md inline-block mr-2">
                      Status:{" "}
                      {Number(state) === 0
                        ? "Active"
                        : Number(state) === 1
                        ? "Successful"
                        : Number(state) === 2
                        ? "Failed"
                        : "Unknown"}
                    </p>
                  )}
                  <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Done" : "Edit"}
                  </button>
                </div>
              )}
            </div>

            {/* Event Image */}
            <div className="w-full h-[500px] max-w-full overflow-hidden rounded-md mb-6">
              <img
                src={eventImageUrl || "/placeholder.png"}
                alt="Event"
                className="w-full h-full object-contain rounded-md"
                loading="lazy"
              />
            </div>

            {/* Event Columns - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
              <InfoBox title="🎯 Target" value={`$${target?.toString() || "0"}`} />
              <InfoBox title="💰 Balance" value={`$${balance?.toString() || "0"}`} />
              <InfoBox title="📅 Deadline" value={deadlineDate.toLocaleString()} />
            </div>

            {/* Event Columns - Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <InfoBox title="🏷️ Category" value={getCategoryName(Number(eventCategory))} />
              <InfoBox title="⚙️ State" value={getStateName(Number(state))} />
              <InfoBox
                title="👤 Owner"
                value={
                  owner ? (
                    <a
                      href={`https://base-sepolia.blockscout.com/address/${owner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {`${owner.substring(0, 4)}...${owner.substring(owner.length - 4)}`}
                    </a>
                  ) : (
                    "N/A"
                  )
                }
              />
              <InfoBox
                title="🔗 About Contract"
                value={
                  <a
                    href={`https://base-sepolia.blockscout.com/address/${eventAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View on BlockScout
                  </a>
                }
              />
            </div>

            {/* Funding Progress */}
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-md mb-6 border">
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">📊 Funding Progress</h3>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-4 bg-blue-600" style={{ width: `${balancePercentage}%` }} />
              </div>
              <p className="text-sm mt-2">{balancePercentage.toFixed(0)}% funded</p>
            </div>

            {/* Narratives */}
            <NarrativeSection title="📝 Narratives" content={eventNarratives || "No details provided"} />

            {/* Tiers */}
            <TiersSection
              tiers={Array.from(tiers || [])}
              contract={contract}
              isEditing={isEditing}
              setIsModalOpen={setIsModalOpen}
            />
            {isModalOpen && (
              <CreateEventModal setIsModalOpen={setIsModalOpen} contract={contract} />
            )}
          </>
        )}
      </div>
    </main>
  );
}

const InfoBox = ({ title, value }: { title: string; value: React.ReactNode }) => (
  <div className="p-4 border rounded-md bg-gray-100 dark:bg-gray-800 shadow-md text-center">
    <strong>{title}</strong>
    <p>{value}</p>
  </div>
);

const NarrativeSection = ({ title, content }: { title: string; content: string }) => (
  <div className="p-4 border rounded-md mb-6 bg-gray-100 dark:bg-gray-800 shadow-md">
    <strong>{title}</strong>
    <p>{content}</p>
  </div>
);

const TiersSection = ({
  tiers,
  contract,
  isEditing,
  setIsModalOpen,
}: {
  tiers: { title: string; amount: bigint; donors: bigint }[];
  contract: any;
  isEditing: boolean;
  setIsModalOpen: (value: boolean) => void;
}) => {
  const sortedTiers = [...tiers].sort((a, b) => Number(a.amount) - Number(b.amount));

  return (
    <div className="mt-8">
      <div className="relative mb-6">
        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          🎖️ Tiers
        </h3>
        {isEditing && (
          <div className="absolute top-0 right-0">
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              onClick={() => setIsModalOpen(true)}
            >
              + Add Tier
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTiers.map((tier, index) => (
          <TierCard
            key={index}
            tier={{
              name: tier.title,
              amount: tier.amount,
              backers: tier.donors,
            }}
            index={index}
            contract={contract}
            isEditing={isEditing}
          />
        ))}
      </div>
    </div>
  );
};

type CreateTierModalProps = {
  setIsModalOpen: (value: boolean) => void;
  contract: ThirdwebContract;
};

const CreateEventModal = ({ setIsModalOpen, contract }: CreateTierModalProps) => {
  const [tierName, setTierName] = useState<string>("");
  const [tierAmount, setTierAmount] = useState<bigint>(1n);

  const MAX_TIER_NAME_LENGTH = 75;
  const MIN_TIER_AMOUNT = 1n;
  const MAX_TIER_AMOUNT = 1_000_000n;

  const handleTierNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.slice(0, MAX_TIER_NAME_LENGTH);
    setTierName(newName);
  };

  const handleTierAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = Number(MIN_TIER_AMOUNT);
    const clampedValue = BigInt(
      Math.max(Number(MIN_TIER_AMOUNT), Math.min(value, Number(MAX_TIER_AMOUNT)))
    );
    setTierAmount(clampedValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
      <div className="w-1/2 bg-slate-100 dark:bg-gray-800 p-6 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Create a Funding Tier
          </p>
          <button
            className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 dark:text-gray-300">Tier Name:</label>
          <input
            type="text"
            maxLength={MAX_TIER_NAME_LENGTH}
            value={tierName}
            onChange={handleTierNameChange}
            placeholder="Tier Name"
            className="mb-4 px-4 py-2 bg-slate-200 dark:bg-gray-700 rounded-md"
          />

          <label className="text-gray-700 dark:text-gray-300">Tier Cost:</label>
          <input
            type="number"
            min={MIN_TIER_AMOUNT.toString()}
            max={MAX_TIER_AMOUNT.toString()}
            value={parseInt(tierAmount.toString())}
            onChange={handleTierAmountChange}
            className="mb-4 px-4 py-2 bg-slate-200 dark:bg-gray-700 rounded-md"
          />

          <TransactionButton
            transaction={() =>
              prepareContractCall({
                contract: contract,
                method: "function addTier(string _name, uint256 _amount)",
                params: [tierName, tierAmount],
              })
            }
            onTransactionSent={() => {
              // Show a yellow toast while the transaction is pending
              toast.warning("Add tier pending...");
            }}
            onTransactionConfirmed={() => {
              // Show a green toast on success
              toast.success("Tier added successfully!");
              setIsModalOpen(false);
            }}
            onError={(error) => {
              // Show a red toast on error
              toast.error(`Error: ${error.message}`);
            }}
            theme={lightTheme()}
          >
            Add Tier
          </TransactionButton>
        </div>
      </div>
    </div>
  );
};
