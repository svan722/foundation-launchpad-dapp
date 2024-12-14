import LAUNCHPAD_ABI from "../contract-abis/launchpadAbi.json";
import { sqrtPriceX96Encoder } from "../utils/sqrtPriceX96Encoder";
import supportedChains from "../config/supportedChains.json";
import { readContract, prepareWriteContract, writeContract } from "wagmi/actions";
import { formatEther, formatUnits, parseEther } from "viem";

function contractReader(contractAddress, functionName, args = []) {
  return readContract({
    abi: LAUNCHPAD_ABI,
    address: contractAddress,
    functionName,
    args,
  });
}

async function contractWriter(contractAddress, functionName, args = [], value = "0") {
  const { request } = await prepareWriteContract({
    abi: LAUNCHPAD_ABI,
    address: contractAddress,
    functionName,
    args,
    value,
  });
  return writeContract(request);
}

///////////////////////////
// WRITE FUNCTIONS
/////////////////////////

export async function buyTokens(contractAddress, purchaseAmount) {
  // Convert to wei value
  purchaseAmount = parseEther(purchaseAmount);
  return contractWriter(contractAddress, "buyTokens", [], purchaseAmount);
}

export async function airdrop(contractAddress) {
  return contractWriter(contractAddress, "airdrop");
}
export async function claimRefund(contractAddress) {
  return contractWriter(contractAddress, "claimRefund");
}
export async function claimTokens(contractAddress) {
  return contractWriter(contractAddress, "claimTokens");
}
export async function finalize(
  contractAddress,
  dexListingRate,
  tokenAddress,
  tokenDecimals,
  chainId
) {
  const currencyTokenAddress = supportedChains[chainId].currencyTokenAddress;

  const ethDecimals = 18;
  let sqrtPriceX96;
  if (parseInt(tokenAddress, 16) < parseInt(currencyTokenAddress, 16)) {
    sqrtPriceX96 = sqrtPriceX96Encoder(1, dexListingRate, ethDecimals, tokenDecimals);
  } else {
    sqrtPriceX96 = sqrtPriceX96Encoder(dexListingRate, 1, tokenDecimals, ethDecimals);
  }

  return contractWriter(contractAddress, "finalize", [sqrtPriceX96]);
}
export async function cancel(contractAddress) {
  return contractWriter(contractAddress, "cancel");
}
export async function toggleWhitelisting(contractAddress) {
  return contractWriter(contractAddress, "toggleWhitelisting");
}
export async function updateWhitelist(contractAddress, adding, beneficiaries) {
  return contractWriter(contractAddress, "updateWhitelist", [adding, beneficiaries]);
}

///////////////////////////
// READ FUNCTIONS
/////////////////////////

export async function getUserContributions(contractAddress, beneficiary) {
  const userContributions = await contractReader(contractAddress, "getUserContributions", [
    beneficiary,
  ]);
  return formatEther(userContributions);
}
export async function getUserTokens(contractAddress, beneficiary, tokenDecimals) {
  const userTokens = await contractReader(contractAddress, "getUserTokens", [beneficiary]);
  return formatUnits(userTokens, tokenDecimals);
}
export async function getIsFinalized(contractAddress) {
  return contractReader(contractAddress, "isFinalized");
}
export async function getHasAirdropped(contractAddress) {
  return contractReader(contractAddress, "hasAirdropped");
}
export async function getIsWhitelisted(contractAddress, beneficiary) {
  return contractReader(contractAddress, "isWhitelisted", [beneficiary]);
}

// Need chain ID Functions

export async function getTotalRaised(chainId, contractAddress) {
  const totalRaised = await readContract({
    abi: LAUNCHPAD_ABI,
    address: contractAddress,
    functionName: "getTotalRaised",
    chainId,
  });
  return formatEther(totalRaised);
}
export async function getTotalContributors(chainId, contractAddress) {
  const totalContributors = await readContract({
    abi: LAUNCHPAD_ABI,
    address: contractAddress,
    functionName: "getTotalContributors",
    chainId,
  });
  return formatUnits(totalContributors, 0);
}
export async function getIsCancelled(chainId, contractAddress) {
  return readContract({
    abi: LAUNCHPAD_ABI,
    address: contractAddress,
    functionName: "isCancelled",
    chainId,
  });
}
export async function getIsWhitelistEnabled(chainId, contractAddress) {
  return readContract({
    abi: LAUNCHPAD_ABI,
    address: contractAddress,
    functionName: "isWhitelistEnabled",
    chainId,
  });
}
