import { formatEther, parseEther, parseUnits } from "viem";
import TOKEN_FACTORY_ABI from "../contract-abis/tokenFactoryAbi.json";
import { readContract, prepareWriteContract, writeContract } from "wagmi/actions";

function contractReader(contractAddress, functionName, args = []) {
  return readContract({
    abi: TOKEN_FACTORY_ABI,
    address: contractAddress,
    functionName,
    args,
  });
}

async function contractWriter(contractAddress, functionName, args = [], value = "0") {
  const { request } = await prepareWriteContract({
    abi: TOKEN_FACTORY_ABI,
    address: contractAddress,
    functionName,
    args,
    value,
  });
  return writeContract(request);
}

export async function collectFeesFromTokenFactory(contractAddress) {
  return contractWriter(contractAddress, "withdrawCollectedFees");
}

///////////////////////////
// WRITE FUNCTIONS
/////////////////////////

export async function createToken(contractAddress, token, tokenCreationFee) {
  return contractWriter(
    contractAddress,
    "createToken",
    [token.name, token.symbol, token.decimals, parseUnits(token.totalSupply, token.decimals)],
    parseEther(tokenCreationFee)
  );
}

export async function setTokenCreationFee(contractAddress, tokenCreationFee) {
  tokenCreationFee = parseEther(tokenCreationFee);
  return contractWriter(contractAddress, "setTokenCreationFee", [tokenCreationFee]);
}
///////////////////////////
// READ FUNCTIONS
/////////////////////////

export async function getTokenCreationFee(contractAddress) {
  return formatEther(await contractReader(contractAddress, "getTokenCreationFee"));
}
export async function getTokenFactoryOwner(contractAddress) {
  return contractReader(contractAddress, "owner");
}
export async function getTokenFactoryBalance(contractAddress) {
  return formatEther(await contractReader(contractAddress, "getCollectedFees"));
}
