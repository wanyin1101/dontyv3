"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import axios from "axios";
import dynamic from "next/dynamic";
import { CustomScroll } from "react-custom-scroll";

// Lazy load ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CONTRACT_ADDRESS = "0x773e7C88B93955b14AbceB1A05918888C22d555D";

// ** API ENDPOINTS **
const TRANSACTIONS_API = `https://base-sepolia.blockscout.com/api?module=account&action=txlist&address=${CONTRACT_ADDRESS}`;
const TOTAL_ACCOUNTS_API = `https://base-sepolia.blockscout.com/api?module=stats&action=totalaccounts`;
const ACTIVE_ACCOUNTS_API = `https://base-sepolia.blockscout.com/api?module=stats&action=dailyactiveusers`;
const AVG_TRANSACTION_FEE_API = `https://base-sepolia.blockscout.com/api?module=stats&action=avgtransactionfee`;

type Transaction = {
  hash: string;
  blockNumber: string;
  gasUsed: string;
  timeStamp: string;
  from: string;
  to?: string;
  value: string;
  isError: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gasUsed, setGasUsed] = useState<number[]>([]);
  const [timeStamps, setTimeStamps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalAccounts, setTotalAccounts] = useState<number>(0);
  const [activeAccounts, setActiveAccounts] = useState<number>(0);
  const [avgTransactionFee, setAvgTransactionFee] = useState<number>(0);

  useEffect(() => {
    async function fetchTransactions() {
      try {
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
          }));

          setTransactions(formattedData);
          setGasUsed(formattedData.map((tx) => parseInt(tx.gasUsed)));
          setTimeStamps(formattedData.map((tx) => tx.timeStamp));
        }

        // Fetch additional statistics
        const totalAccountsRes = await axios.get(TOTAL_ACCOUNTS_API);
        setTotalAccounts(totalAccountsRes.data.result || 0);

        const activeAccountsRes = await axios.get(ACTIVE_ACCOUNTS_API);
        setActiveAccounts(activeAccountsRes.data.result || 0);

        const avgTxFeeRes = await axios.get(AVG_TRANSACTION_FEE_API);
        setAvgTransactionFee(avgTxFeeRes.data.result || 0);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-semibold mb-6">Transactions</h1>

        {/* Summary Stats - Adapts to Light/Dark Mode */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { label: "Total Transactions", value: transactions.length },
            { label: "Total Gas Used", value: gasUsed.reduce((a, b) => a + b, 0) },
            { label: "Total Accounts", value: totalAccounts },
            { label: "Active Accounts", value: activeAccounts },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-4 rounded-lg shadow transition-colors duration-300
                         bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <h2 className="text-xl font-semibold">{stat.label}</h2>
              <p className="text-2xl">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Transactions Table with Styled Scrollbar */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow">
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
                    className="border-b border-gray-700 
                               hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                  >
                    <td className="p-2">
                      <a 
                        href={`https://base-sepolia.blockscout.com/tx/${tx.hash}`} 
                        target="_blank" 
                        className="px-2 py-1 rounded text-xs transition-colors duration-300
                                   bg-gray-200 dark:bg-gray-700 
                                   text-blue-600 dark:text-blue-400 
                                   hover:text-blue-800 dark:hover:text-blue-300">
                        {`${tx.hash.substring(0, 4)}...${tx.hash.substring(tx.hash.length - 4)}`}
                      </a>
                    </td>
                    <td className="p-2">{tx.isError === "0" ? "✅ Success" : "❌ Failed"}</td>
                    <td className="p-2">{tx.blockNumber}</td>
                    <td className="p-2">
                      {`${tx.from.substring(0, 4)}...${tx.from.substring(tx.from.length - 4)}`} →
                      {tx.to ? `${tx.to.substring(0, 4)}...${tx.to.substring(tx.to.length - 4)}` : "Contract Creation"}
                    </td>
                    <td className="p-2">{(parseFloat(tx.value) / 1e18).toFixed(4)} ETH</td>
                    <td className="p-2">{tx.timeStamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CustomScroll>
        </div>
      </div>
    </main>
  );
}
