import React, { useState, useEffect } from "react";
import { truncateStr } from "../../utils/truncate";
import { toastError } from "../../utils/toastWrapper";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

function ConnectWalletBtn() {
  const { address } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const wasWalletConnected = localStorage.getItem("walletConnected");
    if (wasWalletConnected === "true") {
      connectToWallet();
    }
  }, []);

  const connectToWallet = async () => {
    try {
      connect();
      localStorage.setItem("walletConnected", true);
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
    }
  };

  const disconnectWallet = async () => {
    try {
      disconnect();
      localStorage.setItem("walletConnected", false);
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
    }
  };

  return address ? (
    <button onClick={disconnectWallet} className="btn btnYellow mx-2" type="submit">
      <img style={{ marginRight: "10px" }} src="/images/wallet_icon.svg" />{" "}
      {`${truncateStr(address, 10)}`}
    </button>
  ) : (
    <button onClick={connectToWallet} className="btn btnYellow mx-2" type="submit">
      <img style={{ marginRight: "10px" }} src="/images/wallet_icon.svg" /> Connect Wallet
    </button>
  );
}
export default ConnectWalletBtn;
