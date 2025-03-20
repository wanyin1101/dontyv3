"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { TransactionButton, useActiveAccount, useSendTransaction, useReadContract } from "thirdweb/react";
import { balanceOf, approve, claimTo } from "thirdweb/extensions/erc20";
import { defineChain, getContract, prepareContractCall } from "thirdweb";
import { toast } from "react-toastify";
import { parseUnits, formatUnits } from "ethers/lib/utils";
import {
  stakeTokenContractAddress,
  rewardsTokenContractAddress,
  stakingContractAddress,
  STAKE_TOKEN_CONTRACT,
  REWARD_TOKEN_CONTRACT,
  STAKING_CONTRACT,
} from "@/app/constants/contracts";
import { baseSepolia } from "thirdweb/chains";
import { client } from "../client";

/** Converts a bigint on-chain value to a decimal string (e.g., "800.0"). */
function toEther(value: bigint, decimals = 18): string {
  return formatUnits(value, decimals);
}

/** Converts a decimal string (e.g. "1.5") into a BigInt for on-chain calls. */
function toWei(value: string, decimals = 18): bigint {
  return parseUnits(value || "0", decimals).toBigInt();
}

/** Converts a bigint to a floating number for clamping/comparison. */
function toFloat(value: bigint): number {
  return parseFloat(toEther(value || 0n));
}

/** Clamps a number between min and max. */
function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export default function StakingPage() {
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  // ----------------------------------
  // 1. Reading Balances & Stake Info
  // ----------------------------------
  const {
    data: stakingTokenBalance,
    isLoading: loadingStakeTokenBalance,
    refetch: refetchStakingTokenBalance,
  } = useReadContract(balanceOf, {
    contract: STAKE_TOKEN_CONTRACT,
    address: account?.address || "",
    queryOptions: {
      enabled: !!account,
    },
  });

  const {
    data: rewardTokenBalance,
    isLoading: loadingRewardTokenBalance,
    refetch: refetchRewardTokenBalance,
  } = useReadContract(balanceOf, {
    contract: REWARD_TOKEN_CONTRACT,
    address: account?.address || "",
    queryOptions: {
      enabled: !!account,
    },
  });

  // Typically getStakeInfo(address) => [stakedAmount, unclaimedRewards]
  const {
    data: stakeInfo,
    refetch: refetchStakeInfo,
  } = useReadContract({
    contract: STAKING_CONTRACT,
    method: "getStakeInfo",
    params: [account?.address || ""],
    queryOptions: {
      enabled: !!account,
    },
  });

  // Auto-refresh data every 10s
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchData();
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  function refetchData() {
    refetchStakeInfo();
    refetchStakingTokenBalance();
    refetchRewardTokenBalance();
  }

  // ----------------------------------
  // 2. Local State for Staking Flow
  // ----------------------------------
  const [stakeAmount, setStakeAmount] = useState("0");
  const [withdrawAmount, setWithdrawAmount] = useState("0");
  const [stakingState, setStakingState] = useState<"init" | "approved">("init");
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // ----------------------------------
  // 3. Input Handlers: Clamping Logic
  // ----------------------------------

  // Stake input: must be between 1 and user’s stakingTokenBalance
  function handleStakeAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    let inputValue = parseFloat(e.target.value);
    if (isNaN(inputValue)) inputValue = 1;

    // Convert user’s stakingTokenBalance to a float
    const userBalance = toFloat(stakingTokenBalance || 0n);
    // Clamp from 1 to userBalance
    const clampedValue = clamp(inputValue, 1, userBalance);
    setStakeAmount(clampedValue.toString());
  }

  // Withdraw input: must be between 1 and user’s staked amount
  function handleWithdrawAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    let inputValue = parseFloat(e.target.value);
    if (isNaN(inputValue)) inputValue = 1;

    // If stakeInfo is loaded, convert staked amount to float, else 0
    const staked = stakeInfo ? toFloat(BigInt(stakeInfo[0].toString()) || 0n) : 0;

    // If user staked 0, force withdraw amount to "0" and stop
    if (staked <= 0) {
      setWithdrawAmount("0");
      return;
    }

    // Otherwise clamp from 1 to staked
    const clampedValue = clamp(inputValue, 1, staked);
    setWithdrawAmount(clampedValue.toString());
  }

  // ----------------------------------
  // 4. Claim ERC-20 Drop
  // ----------------------------------
  function getClaimTokensTx() {
    return claimTo({
      contract: getContract({
        client,
        chain: defineChain(baseSepolia),
        address: stakeTokenContractAddress,
      }),
      to: account?.address || "",
      quantity: "100", // must be a string
    });
  }

  // ----------------------------------
  // 5. Approval + Stake
  // ----------------------------------
  function getApproveStakeTx() {
    const parsed = parseFloat(stakeAmount || "0");
    if (parsed <= 0) {
      throw new Error("Please enter a valid stake amount.");
    }
    return approve({
      contract: STAKE_TOKEN_CONTRACT,
      spender: STAKING_CONTRACT.address,
      amount: parsed,
    });
  }

  function getStakeTx() {
    const parsed = parseFloat(stakeAmount || "0");
    if (parsed <= 0) {
      throw new Error("Please enter a valid stake amount.");
    }
    const stakeAmountWei = toWei(stakeAmount);
    return prepareContractCall({
      contract: STAKING_CONTRACT,
      method: "stake",
      params: [stakeAmountWei],
    });
  }

  // ----------------------------------
  // 6. Withdraw
  // ----------------------------------
  function getWithdrawTx() {
    // Check if user staked anything
    const staked = stakeInfo ? toFloat(BigInt(stakeInfo[0].toString()) || 0n) : 0;
    if (staked <= 0) {
      throw new Error("You have 0 tokens staked, cannot withdraw.");
    }

    const parsed = parseFloat(withdrawAmount || "0");
    if (parsed <= 0) {
      throw new Error("Please enter a valid withdraw amount.");
    }

    const withdrawWei = toWei(withdrawAmount);
    return prepareContractCall({
      contract: STAKING_CONTRACT,
      method: "withdraw",
      params: [withdrawWei],
    });
  }

  // ----------------------------------
  // 7. Claim Rewards
  // ----------------------------------
  function getClaimRewardsTx() {
    return prepareContractCall({
      contract: STAKING_CONTRACT,
      method: "claimRewards",
      params: [],
    });
  }

  function formatInteger(value: bigint): string {
    // Convert to float, then truncate (floor) to remove any decimals.
    const raw = parseFloat(toEther(value));
    return String(Math.floor(raw)); // e.g. 344.888... => "344"
  }
  
  function formatTwoDecimals(value: bigint): string {
    // Convert to float, then format with 2 decimals.
    const raw = parseFloat(toEther(value));
    return raw.toFixed(2); // e.g. 872.888... => "872.89"
  }
  

  // ----------------------------------
  // 8. Render
  // ----------------------------------
  return (
    <main
      className={`
        min-h-screen
        flex flex-col
        bg-cover bg-center bg-no-repeat
        text-gray-900 dark:text-gray-100
        transition-colors duration-300
        bg-[url('/colur_webpage_v3.png')]
        dark:bg-[url('/bg_colur_webpage_v3.png')]
      `}
    >
      <Navbar />

      {!account && (
        <div className="flex flex-1 items-center justify-center">
          <p className="font-caveat text-4xl text-center mb-4">
            Please connect your wallet to access staking features.
          </p>
        </div>
      )}

      {account && (
        <div
          className="
            flex
            flex-1
            flex-col
            px-4
            w-full
            max-w-6xl
            items-start
            mt-8
            mx-auto
          "
        >
          {/* NEW COLUMN (Top-Left) */}
          <div
            className="
              bg-white/80 dark:bg-gray-900/80
              backdrop-blur-sm
              rounded-lg
              shadow-lg
              p-8
              w-full
              mb-8
              transition-colors
              duration-300
              text-left
            "
          >
            <p className="mb-2">
              <strong>Address:</strong> {account.address}
            </p>
            <p>
              <strong>Staking Token:</strong> {formatInteger(stakingTokenBalance || 0n)}
            </p>
            <p>
              <strong>Reward Token:</strong> {formatInteger(rewardTokenBalance || 0n)}
            </p>

            {stakeInfo && (
              <>
                <hr className="my-2 border-gray-300 dark:border-gray-700" />
                <p>
                  <strong>Balance Staked:</strong> {formatInteger(BigInt(stakeInfo[0].toString()) || 0n)}
                </p>
                <p>
                  <strong>Reward Balance:</strong> {formatTwoDecimals(BigInt(stakeInfo[1].toString()) || 0n)}
                </p>
              </>
            )}
          </div>

          {/* Two-column layout for Claim & Staking (Bigger) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Left Column - Claim Token */}
            <div
              className="
                bg-white/80 dark:bg-gray-900/80
                backdrop-blur-sm
                rounded-lg
                shadow-lg
                p-8
                transition-colors
                duration-300
              "
            >
              <h2 className="text-2xl font-semibold mb-4 text-center">Claim Tokens</h2>
              <p className="mb-4 text-center">
                Claim your ERC-20 tokens from the Token Drop.
              </p>

              {/* Center the "Claim Tokens" button */}
              <div className="flex justify-center">
                <TransactionButton
                  transaction={getClaimTokensTx}
                  onTransactionSent={() => toast.warning("Transaction pending...")}
                  onTransactionConfirmed={() => {
                    toast.success("Tokens claimed successfully!");
                    refetchStakingTokenBalance();
                  }}
                  onError={(error) => {
                    toast.error(`Failed to claim tokens: ${error.message}`);
                  }}
                  className="
                    px-4 py-2
                    bg-blue-500 hover:bg-blue-600
                    dark:bg-blue-600 dark:hover:bg-blue-700
                    text-white
                    font-medium
                    rounded-md
                    transition-colors
                    duration-300
                  "
                >
                  Claim Tokens
                </TransactionButton>
              </div>
            </div>

            {/* Right Column - Staking */}
            <div
              className="
                bg-white/80 dark:bg-gray-900/80
                backdrop-blur-sm
                rounded-lg
                shadow-lg
                p-8
                transition-colors
                duration-300
              "
            >
              <h2 className="text-2xl font-semibold mb-4 text-center">Stake & Rewards</h2>
              <p className="mb-4 text-center">
                Stake your tokens, withdraw, and claim rewards.
              </p>

              {/* Row: Stake + Withdraw side by side, both centered */}
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  onClick={() => {
                    setIsStaking(true);
                    setStakeAmount("0");
                    setStakingState("init");
                  }}
                  className="
                    w-36
                    px-4 py-2
                    bg-gray-200 hover:bg-blue-600
                    dark:bg-blue-600 dark:hover:bg-blue-700
                    text-black dark:text-black
                    font-medium
                    rounded-md
                    transition-colors
                    duration-300
                  "
                >
                  Stake
                </button>

                <button
                  onClick={() => {
                    setIsWithdrawing(true);
                    setWithdrawAmount("0");
                  }}
                  className="
                    w-36
                    px-4 py-2
                    bg-gray-200 hover:bg-blue-600
                    dark:bg-blue-600 dark:hover:bg-blue-700
                    text-black dark:text-black
                    font-medium
                    rounded-md
                    transition-colors
                    duration-300
                  "
                >
                  Withdraw
                </button>
              </div>

              {/* Row: Claim Rewards alone, centered */}
              <div className="flex justify-center">
                <TransactionButton
                  transaction={getClaimRewardsTx}
                  onTransactionSent={() => toast.warning("Claiming rewards...")}
                  onTransactionConfirmed={() => {
                    toast.success("Rewards claimed!");
                    refetchData();
                  }}
                  onError={(error) => {
                    toast.error(`Failed to claim rewards: ${error.message}`);
                  }}
                  className="
                    px-4 py-2
                    bg-blue-500 hover:bg-blue-600
                    dark:bg-blue-600 dark:hover:bg-blue-700
                    text-white
                    font-medium
                    rounded-md
                    transition-colors
                    duration-300
                  "
                >
                  Claim Rewards
                </TransactionButton>
              </div>
            </div>


          </div>
        </div>
      )}

      {/* ---------------- Stake Modal ---------------- */}
      {isStaking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="
              bg-white dark:bg-gray-800
              w-[100%] md:w-[100%]
              max-w-2xl
              rounded-lg
              p-8
              shadow-lg
              relative
              flex flex-col items-center
            "
          >
            {/* Title + Close */}
            <div className="w-full mb-4 relative">
              <h3 className="text-xl font-semibold text-center pr-10 w-full">
                Stake Tokens
              </h3>
              <button
                onClick={() => {
                  setIsStaking(false);
                  setStakeAmount("0");
                  setStakingState("init");
                }}
                className="
                  absolute
                  right-0
                  top-0
                  text-sm
                  bg-gray-300 hover:bg-gray-400
                  dark:bg-gray-700 dark:hover:bg-gray-600
                  px-2 py-1
                  rounded-md
                  transition-colors
                "
              >
                Close
              </button>
            </div>

            {/* Centered content below the title */}
            <p className="text-center mb-2">
              Your Staking Token Balance:{" "}
              <strong>{toEther(stakingTokenBalance || 0n)}</strong>
            </p>

            <input
              type="number"
              placeholder="0.0"
              value={stakeAmount}
              onChange={handleStakeAmountChange}
              className="
                w-full mb-4 p-2
                border border-gray-300
                rounded-md
                dark:bg-gray-700 dark:text-white
                text-center
              "
            />

            {stakingState === "init" ? (
              <TransactionButton
                transaction={getApproveStakeTx}
                onTransactionSent={() => toast.warning("Approval transaction pending...")}
                onTransactionConfirmed={() => {
                  toast.success("Tokens approved successfully!");
                  setStakingState("approved");
                }}
                onError={(error) => {
                  toast.error(`Approval failed: ${error.message}`);
                }}
                className="
                  px-4 py-2
                  bg-blue-500 hover:bg-blue-600
                  text-white
                  font-medium
                  rounded-md
                  transition-colors
                  mx-auto
                "
              >
                Set Approval
              </TransactionButton>
            ) : (
              <TransactionButton
                transaction={getStakeTx}
                onTransactionSent={() => toast.warning("Staking transaction pending...")}
                onTransactionConfirmed={() => {
                  toast.success(`Staked ${stakeAmount} tokens successfully!`);
                  setStakeAmount("0");
                  setStakingState("init");
                  setIsStaking(false);
                  refetchData();
                }}
                onError={(error) => {
                  toast.error(`Failed to stake: ${error.message}`);
                }}
                className="
                  px-4 py-2
                  bg-green-500 hover:bg-green-600
                  text-white
                  font-medium
                  rounded-md
                  transition-colors
                  mx-auto
                "
              >
                Stake
              </TransactionButton>
            )}
          </div>
        </div>
      )}

      {/* ---------------- Withdraw Modal ---------------- */}
      {isWithdrawing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="
              bg-white dark:bg-gray-800
              w-[100%] md:w-[100%]
              max-w-2xl
              rounded-lg
              p-8
              shadow-lg
              relative
              flex flex-col items-center
            "
          >
            <div className="w-full mb-4 relative">
              <h3 className="text-xl font-semibold text-center pr-10 w-full">
                Withdraw Tokens
              </h3>
              <button
                onClick={() => {
                  setIsWithdrawing(false);
                  setWithdrawAmount("0");
                }}
                className="
                  absolute
                  right-0
                  top-0
                  text-sm
                  bg-gray-300 hover:bg-gray-400
                  dark:bg-gray-700 dark:hover:bg-gray-600
                  px-2 py-1
                  rounded-md
                  transition-colors
                "
              >
                Close
              </button>
            </div>

            {/* Centered content below the title */}
            <p className="text-center mb-2">
              You have staked:{" "}
              <strong>
                {stakeInfo ? toEther(BigInt(stakeInfo[0].toString()) || 0n) : "0"}
              </strong>
            </p>

            <input
              type="number"
              placeholder="0.0"
              value={withdrawAmount}
              onChange={handleWithdrawAmountChange}
              className="
                w-full mb-4 p-2
                border border-gray-300
                rounded-md
                dark:bg-gray-700 dark:text-white
                text-center
              "
            />

            <TransactionButton
              transaction={getWithdrawTx}
              onTransactionSent={() => toast.warning("Withdraw transaction pending...")}
              onTransactionConfirmed={() => {
                toast.success(`Withdrew ${withdrawAmount} tokens successfully!`);
                setWithdrawAmount("0");
                setIsWithdrawing(false);
                refetchData();
              }}
              onError={(error) => {
                toast.error(`Failed to withdraw: ${error.message}`);
              }}
              className="
                px-4 py-2
                bg-yellow-500 hover:bg-yellow-600
                text-white
                font-medium
                rounded-md
                transition-colors
                mx-auto
              "
            >
              Confirm
            </TransactionButton>
          </div>
        </div>
      )}
    </main>
  );
}
