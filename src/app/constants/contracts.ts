import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { client } from "@/app/client";
import { STAKING_CONTRACT_ABI } from "@/app/stakingContractABI";

export const DonationDrive_Factory = "0x6a0c1933863b7326b831108ae8a346fbca998247";

// Addresses
export const stakeTokenContractAddress = "0x22004F927e04DED23baFfd5bBAF074530135a972";
export const rewardsTokenContractAddress = "0x0c824483915167696a8FD1e4Be101dc28fA721EB";
export const stakingContractAddress = "0xC4ed9959A5CB89c8adE7AFB2C6804485309c6F00";

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