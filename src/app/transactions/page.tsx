"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import axios from "axios";
import dynamic from "next/dynamic";
import { CustomScroll } from "react-custom-scroll";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image"; // for arrows
import Footer from "../components/Footer";

// Lazy load ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/** The main contract address from your original code */
const CONTRACT_ADDRESS = "0x6a0c1933863b7326b831108ae8a346fbca998247";

/** The 5 NFT addresses you want to track */
const NFT_ADDRESSES = [
  "0x79dc3441FB8d05BeA4Edf372c0BF1c36be4ae8C8", // Slowlo
  "0x93c8EF9F13C2c00223c51Eca6fC91A77b1174E6c", // Floppy
  "0xe1Fd326E6325e923F3C6278d9cF82665CB6735B6", // Original Rose
  "0xe89c861642e1Bf24121840234880e89fE28DeefC", // Colur Rose
  "0xa13492E9aC4d4Bed1742aB69AdCE56455961f10b", // Dark Rose
];

/** The stake contract address you want to track */
const STAKE_CONTRACT_ADDRESS = "0xB26FDC09DbD2eBCe7E04b81520cabAB39E0B4c0b";

/** A mapping of NFT addresses to friendly names (use lowercase for easy comparison). */
const NFT_ADDRESS_MAP: Record<string, string> = {
  "0x79dc3441fb8d05bea4edf372c0bf1c36be4ae8c8": "Slowlo",
  "0x93c8ef9f13c2c00223c51eca6fc91a77b1174e6c": "Floppy",
  "0xe1fd326e6325e923f3c6278d9cf82665cb6735b6": "Original Rose",
  "0xe89c861642e1bf24121840234880e89fe28deefc": "Colur Rose",
  "0xa13492e9ac4d4bed1742ab69adce56455961f10b": "Dark Rose",
};

// ** API ENDPOINTS **
const TRANSACTIONS_API = `https://base-sepolia.blockscout.com/api?module=account&action=txlist&address=${CONTRACT_ADDRESS}`;
const STAKE_CONTRACT_API = `https://base-sepolia.blockscout.com/api?module=account&action=txlist&address=${STAKE_CONTRACT_ADDRESS}`;

/** Transaction type for convenience */
type Transaction = {
  hash: string;
  blockNumber: string;
  gasUsed: string;
  timeStamp: string;
  from: string;
  to?: string;
  value: string;
  isError: string;
  input?: string; // We'll keep the raw input to decode method name
};

/** A helper to display either a friendly NFT name or a shortened address. */
function getDisplayName(addr?: string): string {
  if (!addr) return "Contract Creation";
  const lower = addr.toLowerCase();

  if (NFT_ADDRESS_MAP[lower]) {
    // Return friendly name if address is in our map
    return NFT_ADDRESS_MAP[lower];
  }
  // Otherwise, return a short version: 0x1234...abcd
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

/** For the stake contract, decode the method from the first 10 hex chars of the input. */
const STAKE_METHOD_SIGS: Record<string, string> = {
  "0xa694fc3a": "stake",         // stake(uint256)
  "0x2e1a7d4d": "withdraw",      // withdraw(uint256)
  "0x372500ab": "claimRewards",  // claimRewards()
};

function decodeStakeMethod(txInput?: string): string {
  if (!txInput || txInput === "0x") return "unknown";
  const sig = txInput.slice(0, 10).toLowerCase();
  return STAKE_METHOD_SIGS[sig] || "unknown";
}

export default function TransactionsPage() {
  // 1) States
  const [transactions, setTransactions] = useState<Transaction[]>([]);      // Event create
  const [nftTransactions, setNftTransactions] = useState<Transaction[]>([]);// NFT
  const [stakeTransactions, setStakeTransactions] = useState<Transaction[]>([]); // Stake

  const [loading, setLoading] = useState(true);
  const [activeTableIndex, setActiveTableIndex] = useState(0);

  // 2) Table definitions
  const tableViews = [
    {
      name: "Transactions Table",
      component: <EventTable />,
    },
    {
      name: "NFT Transactions",
      component: <NftTable />,
    },
    {
      name: "Third Table",
      component: <StakeTable />,
    },
  ];

  // 2A) Components for each table
  function EventTable() {
    return (
      <div className="bg-gray-100/80 dark:bg-gray-900/80 p-4 rounded-lg shadow">
        <p className="text-center font-bold text-2xl">Event Create Transactions</p>
        <CustomScroll allowOuterScroll heightRelativeToParent="500px">
          <table className="w-full text-gray-900 dark:text-white">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="p-2">Txn Hash</th>
                <th className="p-2">Status</th>
                <th className="p-2">Block</th>
                <th className="p-2">From → To</th>
                <th className="p-2">Value (ETH)</th>
                <th className="p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.hash}
                  className="
                    border-b border-gray-700
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    transition-colors duration-300
                  "
                >
                  <td className="p-2">
                    <a
                      href={`https://base-sepolia.blockscout.com/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        px-2 py-1 rounded text-xs transition-colors duration-300
                        bg-gray-200 dark:bg-gray-700
                        text-blue-600 dark:text-blue-400
                        hover:text-blue-800 dark:hover:text-blue-300
                      "
                    >
                      {`${tx.hash.substring(0, 4)}...${tx.hash.substring(
                        tx.hash.length - 4
                      )}`}
                    </a>
                  </td>
                  <td className="p-2">
                    {tx.isError === "0" ? "✅ Success" : "❌ Failed"}
                  </td>
                  <td className="p-2">{tx.blockNumber}</td>
                  <td className="p-2">
                    {getDisplayName(tx.from)} → {getDisplayName(tx.to)}
                  </td>
                  <td className="p-2">
                    {(parseFloat(tx.value) / 1e18).toFixed(4)} ETH
                  </td>
                  <td className="p-2">{tx.timeStamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CustomScroll>
      </div>
    );
  }

  function NftTable() {
    return (
      <div className="bg-gray-100/80 dark:bg-gray-900/80 p-4 rounded-lg shadow">
        <p className="text-center font-bold text-2xl">NFT Transactions</p>
        <div className="flex flex-wrap justify-center gap-4 my-4">
          {NFT_ADDRESSES.map((nftAddr) => {
            const lower = nftAddr.toLowerCase();
            const name = NFT_ADDRESS_MAP[lower] || "Unknown NFT";
            const count = nftTransactions.filter(
              (tx) =>
                tx.from.toLowerCase() === lower ||
                tx.to?.toLowerCase() === lower
            ).length;
            return (
              <div
                key={nftAddr}
                className="
                  p-4
                  bg-white dark:bg-gray-800
                  rounded
                  shadow
                  text-center
                  min-w-[120px]
                "
              >
                <h2 className="font-bold">{name}</h2>
                <p>Total Claimed: {count}</p>
              </div>
            );
          })}
        </div>
        <CustomScroll allowOuterScroll heightRelativeToParent="500px">
          <table className="w-full text-gray-900 dark:text-white">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="p-2">Txn Hash</th>
                <th className="p-2">Status</th>
                <th className="p-2">Block</th>
                <th className="p-2">From → To</th>
                <th className="p-2">Value (ETH)</th>
                <th className="p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {nftTransactions.map((tx) => (
                <tr
                  key={tx.hash}
                  className="
                    border-b border-gray-700
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    transition-colors duration-300
                  "
                >
                  <td className="p-2">
                    <a
                      href={`https://base-sepolia.blockscout.com/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        px-2 py-1 rounded text-xs transition-colors duration-300
                        bg-gray-200 dark:bg-gray-700
                        text-blue-600 dark:text-blue-400
                        hover:text-blue-800 dark:hover:text-blue-300
                      "
                    >
                      {`${tx.hash.substring(0, 4)}...${tx.hash.substring(
                        tx.hash.length - 4
                      )}`}
                    </a>
                  </td>
                  <td className="p-2">
                    {tx.isError === "0" ? "✅ Success" : "❌ Failed"}
                  </td>
                  <td className="p-2">{tx.blockNumber}</td>
                  <td className="p-2">
                    {getDisplayName(tx.from)} → {getDisplayName(tx.to)}
                  </td>
                  <td className="p-2">
                    {(parseFloat(tx.value) / 1e18).toFixed(4)} ETH
                  </td>
                  <td className="p-2">{tx.timeStamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CustomScroll>
      </div>
    );
  }

  function StakeTable() {
    const parsedStakeTx = stakeTransactions.map((tx) => {
      const methodName = decodeStakeMethod(tx.input);
      return { ...tx, methodName };
    });
    const stakeCount = parsedStakeTx.filter((tx) => tx.methodName === "stake").length;
    const withdrawCount = parsedStakeTx.filter((tx) => tx.methodName === "withdraw").length;
    const claimCount = parsedStakeTx.filter((tx) => tx.methodName === "claimRewards").length;
    return (
      <div className="bg-gray-100/80 dark:bg-gray-900/80 p-4 rounded-lg shadow">
        <p className="text-center font-bold text-2xl mb-4">Stake Contract Transactions</p>
        <div className="flex flex-wrap justify-center gap-4 my-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center min-w-[120px]">
            <h2 className="font-bold">Stake</h2>
            <p>Tx Count: {stakeCount}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center min-w-[120px]">
            <h2 className="font-bold">Withdraw</h2>
            <p>Tx Count: {withdrawCount}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center min-w-[120px]">
            <h2 className="font-bold">ClaimRewards</h2>
            <p>Tx Count: {claimCount}</p>
          </div>
        </div>
        <CustomScroll allowOuterScroll heightRelativeToParent="500px">
          <table className="w-full text-gray-900 dark:text-white">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="p-2">Txn Hash</th>
                <th className="p-2">Status</th>
                <th className="p-2">Method</th>
                <th className="p-2">Block</th>
                <th className="p-2">From → To</th>
                <th className="p-2">Value (ETH)</th>
                <th className="p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {parsedStakeTx.map((tx) => (
                <tr
                  key={tx.hash}
                  className="
                    border-b border-gray-700
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    transition-colors duration-300
                  "
                >
                  <td className="p-2">
                    <a
                      href={`https://base-sepolia.blockscout.com/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        px-2 py-1 rounded text-xs transition-colors duration-300
                        bg-gray-200 dark:bg-gray-700
                        text-blue-600 dark:text-blue-400
                        hover:text-blue-800 dark:hover:text-blue-300
                      "
                    >
                      {`${tx.hash.substring(0, 4)}...${tx.hash.substring(
                        tx.hash.length - 4
                      )}`}
                    </a>
                  </td>
                  <td className="p-2">
                    {tx.isError === "0" ? "✅ Success" : "❌ Failed"}
                  </td>
                  <td className="p-2">{tx.methodName}</td>
                  <td className="p-2">{tx.blockNumber}</td>
                  <td className="p-2">
                    {getDisplayName(tx.from)} → {getDisplayName(tx.to)}
                  </td>
                  <td className="p-2">
                    {(parseFloat(tx.value) / 1e18).toFixed(4)} ETH
                  </td>
                  <td className="p-2">{tx.timeStamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CustomScroll>
      </div>
    );
  }

  // 4) Fetching Data
  useEffect(() => {
    async function fetchAllData() {
      try {
        await fetchMainContractTransactions();
        await fetchNftAddressesTransactions();
        await fetchStakeContractTransactions();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  async function fetchMainContractTransactions() {
    const headers = { "User-Agent": "my-app" };
    const response = await axios.get(TRANSACTIONS_API, { headers });
    if (response.data.result && Array.isArray(response.data.result)) {
      const formattedData: Transaction[] = response.data.result.map((tx: any) => ({
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed || "0",
        timeStamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        from: tx.from || "Unknown",
        to: tx.to || "Contract Creation",
        value: tx.value || "0",
        isError: tx.isError || "0",
        input: tx.input || "0x",
      }));
      setTransactions(formattedData);
    }
  }

  async function fetchNftAddressesTransactions() {
    const headers = { "User-Agent": "my-app" };
    let combinedNftTxs: Transaction[] = [];
    for (const nftAddress of NFT_ADDRESSES) {
      const api = `https://base-sepolia.blockscout.com/api?module=account&action=txlist&address=${nftAddress}`;
      const resp = await axios.get(api, { headers });
      if (resp.data.result && Array.isArray(resp.data.result)) {
        const formattedData: Transaction[] = resp.data.result.map((tx: any) => ({
          hash: tx.hash,
          blockNumber: tx.blockNumber,
          gasUsed: tx.gasUsed || "0",
          timeStamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
          from: tx.from || "Unknown",
          to: tx.to || "Contract Creation",
          value: tx.value || "0",
          isError: tx.isError || "0",
          input: tx.input || "0x",
        }));
        combinedNftTxs = combinedNftTxs.concat(formattedData);
      }
    }
    const uniqueMap: Record<string, Transaction> = {};
    for (const tx of combinedNftTxs) {
      uniqueMap[tx.hash] = tx;
    }
    const uniqueNftTxs = Object.values(uniqueMap);
    uniqueNftTxs.sort((a, b) => parseInt(b.blockNumber) - parseInt(a.blockNumber));
    setNftTransactions(uniqueNftTxs);
  }

  async function fetchStakeContractTransactions() {
    const headers = { "User-Agent": "my-app" };
    const response = await axios.get(STAKE_CONTRACT_API, { headers });
    if (response.data.result && Array.isArray(response.data.result)) {
      const formattedData: Transaction[] = response.data.result.map((tx: any) => ({
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed || "0",
        timeStamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        from: tx.from || "Unknown",
        to: tx.to || "Contract Creation",
        value: tx.value || "0",
        isError: tx.isError || "0",
        input: tx.input || "0x",
      }));
      setStakeTransactions(formattedData);
    }
  }

  const totalEventTx = transactions.length;
  const totalNftTx = nftTransactions.length;
  const totalStakeTx = stakeTransactions.length;
  const gasEvent = transactions.reduce((acc, tx) => acc + parseInt(tx.gasUsed), 0);
  const gasNft = nftTransactions.reduce((acc, tx) => acc + parseInt(tx.gasUsed), 0);
  const gasStake = stakeTransactions.reduce((acc, tx) => acc + parseInt(tx.gasUsed), 0);
  const totalGasUsedAll = gasEvent + gasNft + gasStake;

  return (
    <div className="flex flex-col min-h-screen">
      <main
        className={`
          min-h-screen
          bg-cover bg-center bg-no-repeat
          text-gray-900 dark:text-gray-100
          transition-colors duration-300
          bg-[url('/colur_webpage_v3.png')]
          dark:bg-[url('/bg_colur_webpage_v3.png')]
        `}
      >
        <Navbar />

        {/* Container with partial transparency & optional blur */}
        <div
          className="
            max-w-7xl mx-auto p-6
            backdrop-blur-xs
            rounded-md shadow-lg
            mt-6
          "
        >
          {/* Summary Stats */}
          <div className="grid grid-cols-1 text-center md:grid-cols-4 gap-6 mb-6">
            {[
              { label: "Total Event Transactions", value: totalEventTx },
              { label: "Total NFT Transactions", value: totalNftTx },
              { label: "Total Staking Transactions", value: totalStakeTx },
              { label: "Total Gas Used", value: totalGasUsedAll },
            ].map((stat, index) => (
              <div
                key={index}
                className="
                  p-4 rounded-lg shadow transition-colors duration-300
                  bg-gray-100/80 dark:bg-gray-800/80
                  text-gray-900 dark:text-white
                "
              >
                <h2 className="text-xl font-semibold">{stat.label}</h2>
                <p className="text-2xl">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Left & Right Arrows + AnimatePresence for multiple tables */}
          <div className="relative w-full mt-4">
            {/* Left Arrow */}
            <button
              onClick={() => {
                setActiveTableIndex((prev) => (prev + tableViews.length - 1) % tableViews.length);
              }}
              className="
                absolute
                left-0 top-1/2
                -translate-y-1/2
                transform
                p-4
                transition-transform
                z-10
                hover:scale-110
              "
            >
              <Image
                src="/Left.svg"
                alt="Left Arrow"
                width={24}
                height={24}
                className="object-contain dark:invert"
              />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => {
                setActiveTableIndex((prev) => (prev + 1) % tableViews.length);
              }}
              className="
                absolute
                right-0 top-1/2
                -translate-y-1/2
                transform
                p-4
                transition-transform
                z-10
                hover:scale-110
              "
            >
              <Image
                src="/right.svg"
                alt="Right Arrow"
                width={24}
                height={24}
                className="object-contain dark:invert"
              />
            </button>

            {/* AnimatePresence for smooth transitions of tables */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeTableIndex}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Render the current table */}
                {tableViews[activeTableIndex].component}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
