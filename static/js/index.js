import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { mainnet, bsc, bscTestnet, sepolia } from "wagmi/chains";
import { infuraProvider } from "wagmi/providers/infura";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet, bsc, bscTestnet, sepolia],
  [
    infuraProvider({ apiKey: "6eaf019193db4d7e93f04c174c0a1e83" }),
    jsonRpcProvider({
      rpc: (chain) => {
        return chain.id === 56
          ? { http: "https://bsc-dataseed1.ninicoin.io/" }
          : { http: "https://data-seed-prebsc-2-s1.binance.org:8545/" };
      },
    }),
  ]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <WagmiConfig config={config}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </WagmiConfig>
);
