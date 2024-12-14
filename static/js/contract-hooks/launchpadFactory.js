import LAUNCHPAD_FACTORY_ABI from "../contract-abis/launchpadFactoryAbi.json";
import supportedChains from "../config/supportedChains.json";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { readContract, prepareWriteContract, writeContract } from "wagmi/actions";

function contractReader(contractAddress, functionName, args = []) {
  return readContract({
    abi: LAUNCHPAD_FACTORY_ABI,
    address: contractAddress,
    functionName,
    args,
  });
}

async function contractWriter(contractAddress, functionName, args = [], value = "0") {
  const { request } = await prepareWriteContract({
    abi: LAUNCHPAD_FACTORY_ABI,
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

export async function createLaunchpad(contractAddress, launchpadParams) {
  const launchpadCreationFee = await contractReader(contractAddress, "getLaunchpadCreationFee");

  return contractWriter(contractAddress, "createLaunchpad", launchpadParams, launchpadCreationFee);
}

export function getLaunchpadParams(launchpadDetails, chainId) {
  const { tokenDecimals } = launchpadDetails;

  return [
    launchpadDetails.tokenAddress,

    parseUnits(launchpadDetails.rate, tokenDecimals),
    parseEther(launchpadDetails.softcap),
    parseEther(launchpadDetails.hardcap),
    parseEther(launchpadDetails.minBuy),
    parseEther(launchpadDetails.maxBuy),
    Math.floor(launchpadDetails.startTime.getTime() / 1000),
    Math.floor(launchpadDetails.endTime.getTime() / 1000),
    launchpadDetails.whitelistEnabled,
    launchpadDetails.refundUnsoldTokens === "burn" ? false : true,

    launchpadDetails.autoDexListing,
    launchpadDetails.autoDexListing
      ? supportedChains[chainId].dexOptions[launchpadDetails.dexName]
      : "0x0000000000000000000000000000000000000000",
    launchpadDetails.autoDexListing
      ? parseUnits(launchpadDetails.dexListingRate, tokenDecimals)
      : "0",
    launchpadDetails.autoDexListing ? launchpadDetails.dexLiquidityPercentage : "0",
  ];
}

export async function collectFeesFromLaunchpadFactory(contractAddress) {
  return contractWriter(contractAddress, "withdrawCollectedFees");
}

export async function setRaisedPercentageFee(contractAddress, raisedPercentageFee) {
  return contractWriter(contractAddress, "setRaisedPercentageFee", [raisedPercentageFee]);
}

export async function setCreationFee(contractAddress, launchpadCreationFee) {
  launchpadCreationFee = parseEther(launchpadCreationFee);
  return contractWriter(contractAddress, "setCreationFee", [launchpadCreationFee]);
}

///////////////////////////
// READ FUNCTIONS
/////////////////////////

export async function getTokensNeeded(
  contractAddress,
  rate,
  hardcap,
  autoDexListing,
  dexListingRate,
  dexLiquidityPercentage,
  tokenDecimals
) {
  // Sanity checks
  rate = parseFloat(rate) > 0 ? rate : "0";
  hardcap = parseFloat(hardcap) > 0 ? hardcap : "0";
  dexListingRate = parseFloat(dexListingRate) > 0 ? dexListingRate : "0";
  dexLiquidityPercentage = parseFloat(dexLiquidityPercentage) > 0 ? dexLiquidityPercentage : "0";

  rate = parseUnits(rate, tokenDecimals);
  hardcap = parseEther(hardcap);
  dexListingRate = parseUnits(dexListingRate, tokenDecimals);

  const [tokensNeeded, tokensForSale, tokensForListing] = await Promise.all([
    contractReader(contractAddress, "getTokensNeeded", [
      rate,
      hardcap,
      autoDexListing,
      dexListingRate,
      dexLiquidityPercentage,
    ]),
    contractReader(contractAddress, "getTokensForSale", [rate, hardcap]),
    contractReader(contractAddress, "getTokensForListing", [
      dexListingRate,
      hardcap,
      dexLiquidityPercentage,
    ]),
  ]);

  return {
    tokensNeeded: formatUnits(tokensNeeded, tokenDecimals),
    tokensForSale: formatUnits(tokensForSale, tokenDecimals),
    tokensForListing: formatUnits(tokensForListing, tokenDecimals),
  };
}

export async function getLaunchpadCreationFee(contractAddress) {
  return formatEther(await contractReader(contractAddress, "getLaunchpadCreationFee"));
}
export async function getRaisedPercentageFee(contractAddress) {
  return formatUnits(await contractReader(contractAddress, "getRaisedPercentageFee"), 0);
}
export async function getLaunchpadFactoryOwner(contractAddress) {
  return contractReader(contractAddress, "owner");
}
export async function getLaunchpadFactoryBalance(contractAddress) {
  return formatEther(await contractReader(contractAddress, "getCollectedFees"));
}

// Not used - And can be done in the fronted as well
// export async function getTokenAmount(contractAddress, purchaseAmount) {
//   purchaseAmount = parseEther(purchaseAmount);
//   return contractWriter(contractAddress, "getTokenAmount", [ purchaseAmount ]);
// }
