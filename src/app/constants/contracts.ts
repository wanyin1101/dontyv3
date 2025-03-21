import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { client } from "@/app/client";
import { STAKING_CONTRACT_ABI } from "@/app/stakingContractABI";

export const DonationDrive_Factory = "0x6a0c1933863b7326b831108ae8a346fbca998247";

// Addresses
export const stakeTokenContractAddress = "0x1F281d5989c9c843A73E586CC467D49302DEFAC0";
export const rewardsTokenContractAddress = "0x744Df9F6C8968Adb652FBc2b34ec1C95eBC62eC6";
export const stakingContractAddress = "0xB26FDC09DbD2eBCe7E04b81520cabAB39E0B4c0b";

// Pre-configured contract instances
export const STAKE_TOKEN_CONTRACT = getContract({
    client,
    chain: baseSepolia,
    address: stakeTokenContractAddress,
  });
  
  export const REWARD_TOKEN_CONTRACT = getContract({
    client,
    chain: baseSepolia,
    address: rewardsTokenContractAddress,
  });
  
  export const STAKING_CONTRACT = getContract({
    client,
    chain: baseSepolia,
    address: stakingContractAddress,
    abi: STAKING_CONTRACT_ABI,
  });