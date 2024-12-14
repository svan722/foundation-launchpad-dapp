import { formatUnits, parseUnits } from "viem";
import TOKEN_ABI from "../contract-abis/erc20Abi.json";
import { readContract, prepareWriteContract, writeContract } from "wagmi/actions";

function contractReader(contractAddress, functionName, args = []) {
  return readContract({
    abi: TOKEN_ABI,
    address: contractAddress,
    functionName,
    args,
  });
}

async function contractWriter(contractAddress, functionName, args = [], value = "0") {
  const { request } = await prepareWriteContract({
    abi: TOKEN_ABI,
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

export async function approve(contractAddress, spender, amount, tokenDecimals) {
  amount = parseUnits(amount, tokenDecimals);
  return contractWriter(contractAddress, "approve", [spender, amount]);
}

///////////////////////////
// READ FUNCTIONS
/////////////////////////

export async function verifyToken(contractAddress) {
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contractReader(contractAddress, "name"),
    contractReader(contractAddress, "symbol"),
    contractReader(contractAddress, "decimals"),
    contractReader(contractAddress, "totalSupply"),
  ]);

  return { name, symbol, decimals, totalSupply: formatUnits(totalSupply || "0", decimals) };
}

export async function allowance(contractAddress, owner, spender, tokenDecimals) {
  return formatUnits(
    await contractReader(contractAddress, "allowance", [owner, spender]),
    tokenDecimals
  );
}

export async function balanceOf(contractAddress, account, tokenDecimals) {
  return formatUnits(await contractReader(contractAddress, "balanceOf", [account]), tokenDecimals);
}
