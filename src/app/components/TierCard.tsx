"use client";
import React from "react";
import { prepareContractCall, ThirdwebContract } from "thirdweb";
import { TransactionButton } from "thirdweb/react";
import { toast } from "react-toastify";

type Tier = {
  name: string;
  amount: bigint;
  backers: bigint;
};

type TierCardProps = {
  tier: Tier;
  index: number;
  contract: ThirdwebContract;
  isEditing: boolean;
};

export const TierCard: React.FC<TierCardProps> = ({
  tier,
  index,
  contract,
  isEditing,
}) => {
  return (
    <div
      className="
        max-w-sm flex flex-col justify-between p-6 border rounded-lg shadow-md 
        bg-white dark:bg-gray-800 
        border-gray-200 dark:border-gray-700 
        text-gray-900 dark:text-gray-100 
        transition-colors duration-300
      "
    >
      <div>
        <div className="flex flex-row justify-between items-center">
          <p className="text-2xl font-semibold">{tier.name}</p>
          <p className="text-2xl font-semibold">${tier.amount.toString()}</p>
        </div>
      </div>
      <div className="flex flex-row justify-between items-end">
        <p className="text-xs font-semibold">
          Total Backers: {tier.backers.toString()}
        </p>

        {/* FUND Button */}
        <TransactionButton
            transaction={() =>
                prepareContractCall({
                contract,
                method: "function fund(uint256 _tierIndex) payable",
                params: [BigInt(index)],
                value: tier.amount,
                })
            }
            onTransactionSent={() => {
                // Show a yellow toast for “pending”
                toast.warning("Transaction processing...");
            }}
            onError={(error) => {
                toast.error(`Error: ${error.message}`);
            }}
            onTransactionConfirmed={() => {
                toast.success("Funded successfully!");
            }}
            >
            Select
        </TransactionButton>
      </div>

      {/* REMOVE Tier Button (only if editing) */}
        {isEditing && (
        <TransactionButton
            transaction={() =>
            prepareContractCall({
                contract,
                method: "function removeTier(uint256 _index)",
                params: [BigInt(index)],
            })
            }
            onTransactionSent={() => {
            // Show a yellow toast for “pending”
            toast.warning("Removing tier in progress...");
            }}
            onError={(error) => {
            toast.error(`Error: ${error.message}`);
            }}
            onTransactionConfirmed={() => {
            toast.success("Removed successfully!");
            }}
            style={{
            marginTop: "1rem",
            backgroundColor: "red",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
            }}
        >
            Remove
        </TransactionButton>
        )}
    </div>
  );
};
