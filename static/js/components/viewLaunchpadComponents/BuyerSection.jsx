import supportedChains from "../../config/supportedChains.json";
import { useEffect, useState } from "react";
import { networkSwitcher } from "../../utils/networkSwitcher";
import {
  buyTokens,
  claimRefund,
  claimTokens,
  getIsWhitelisted,
  getTotalContributors,
  getTotalRaised,
  getUserContributions,
  getUserTokens,
} from "../../contract-hooks/launchpad";
import { validateProperty } from "../../utils/formValidation";
import { boolean, number, object, string } from "yup";
import Countdown from "react-countdown";
import { updateUserLaunchpads } from "../../api-services/launchpadServices";
import ProgressBar from "../common/ProgressBar";
import { toastError, toastSuccess } from "../../utils/toastWrapper";
import Button from "../common/Button";
import Loader from "../common/Loader";
import { formatNumber } from "../../utils/formatNumber";
import { useAccount, useConnect, useNetwork } from "wagmi";
import { switchNetwork, waitForTransaction } from "wagmi/actions";
import { InjectedConnector } from "wagmi/connectors/injected";
import { retryOperation } from "../../utils/retryOperation";

const bn = require("bignumber.js");

const BuyerSection = ({
  launchpad,
  totalRaised,
  isFinalized,
  status,
  updateStatus,
  updateTotalRaised,
  updateTotalContributors,
  goalReached,
  whitelistEnabled,
  hasAirdropped,
  isCancelled,
}) => {
  const [supported, setSupported] = useState(false);
  const [userContributions, setUserContributions] = useState();
  const [isWhitelisted, setIsWhitelisted] = useState();
  const [userTokens, setUserTokens] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingContributions, setLoadingContributions] = useState(true);

  const { chain } = useNetwork();
  const { isConnected, address } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const purchaseAmountSchema = object({
    purchaseAmount: number()
      .typeError("Purchase amount must be a valid number")
      .min(launchpad.minBuy)
      .max(
        formatNumber(
          Math.min(launchpad.hardcap - totalRaised, launchpad.maxBuy - userContributions),
          5
        )
      ),
  });

  useEffect(() => {
    if (isConnected && launchpad.chainId === chain.id) {
      setSupported(true);
    } else {
      setSupported(false);
    }
  }, [isConnected, chain]);

  useEffect(() => {
    if (!supported) return;

    setLoading(false);
    getUserTokensAndContributions();
  }, [supported, address, hasAirdropped]);

  useEffect(() => {
    if (!supported) return;

    if (whitelistEnabled) {
      gettingIsWhitelisted();
    }
  }, [address, whitelistEnabled]);

  async function getUserTokensAndContributions() {
    try {
      setLoadingContributions(true);

      const [contributions, tokens] = await Promise.all([
        getUserContributions(launchpad.address, address),
        getUserTokens(launchpad.address, address, launchpad.tokenDecimals),
      ]);

      setLoadingContributions(false);
      setUserContributions(contributions);
      setUserTokens(tokens);
    } catch (e) {
      toastError("Fetch User Contributions Failed");
      setLoadingContributions(false);
    }
  }

  const gettingIsWhitelisted = async () => {
    const whitelisted = await getIsWhitelisted(launchpad.address, address);
    setIsWhitelisted(whitelisted);
  };

  const handlePurchaseAmountChange = async (e) => {
    const input = e.target;
    setPurchaseAmount(input.value);

    const error = await validateProperty(input, purchaseAmountSchema);
    setError(error);
  };

  const handleNetworkSwitch = async () => {
    try {
      await switchNetwork({ chainId: launchpad.chainId });
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
    }
  };

  const connectToWallet = async () => {
    try {
      connect();
      localStorage.setItem("walletConnected", true);
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
    }
  };

  const handleBuyTokens = async () => {
    try {
      setLoading(true);

      const { hash } = await buyTokens(launchpad.address, purchaseAmount);

      if (hash) {
        try {
          updateUserLaunchpads(launchpad._id, address);
        } catch (e) {}
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });
        const [totalRaised, totalContri, res] = await Promise.all([
          getTotalRaised(launchpad.chainId, launchpad.address),
          getTotalContributors(launchpad.chainId, launchpad.address),
          getUserTokensAndContributions(),
        ]);

        updateTotalRaised(totalRaised);
        updateTotalContributors(totalContri);
        toastSuccess(`Purchased Tokens Successfully`);

        setLoading(false);
        setPurchaseAmount("");
      }
    } catch (error) {
      console.dir(error);
      error.shortMessage && toastError(error.shortMessage);
      setLoading(false);
    }
  };
  const handleClaimTokens = async () => {
    try {
      setLoading(true);
      const { hash } = await claimTokens(launchpad.address);
      if (hash) {
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });
        toastSuccess(
          `Successfully Claimed ${formatNumber(userTokens, 3)} ${launchpad.tokenSymbol}`
        );
        await getUserTokensAndContributions();
        setLoading(false);
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setLoading(false);
    }
  };
  const handleClaimRefund = async () => {
    try {
      setLoading(true);
      const { hash } = await claimRefund(launchpad.address);
      if (hash) {
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });
        toastSuccess(
          `Successfully Claimed ${formatNumber(userContributions, 5)} ${launchpad.currency}`
        );
        await getUserTokensAndContributions();
        setLoading(false);
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setLoading(false);
    }
  };

  const renderBuyButton = () => {
    let onClick;
    let btnLabel;
    let additionalInfo;
    let hideBtn;
    let inputHide = true;
    let disableBtn = true;
    let inputDisabled = true;
    let showGetTokens;

    if (!isConnected) {
      // Connect Wallet

      disableBtn = false;
      onClick = connectToWallet;
      btnLabel = `Connect Wallet`;
      if (status === "ended") additionalInfo = "Connect Wallet To see Contributions";
      if (status === "live") additionalInfo = `Connect Wallet to Purchase ${launchpad.tokenName} `;
    } else if (launchpad.chainId !== chain.id) {
      // Switch to supported Network

      disableBtn = false;
      onClick = handleNetworkSwitch;
      btnLabel = `Switch to ${supportedChains[launchpad.chainId].name} to Proceed`;
    } else if (!isCancelled && status !== "ended") {
      // Buy Tokens

      onClick = handleBuyTokens;
      inputHide = false;
      showGetTokens = true;

      if (!whitelistEnabled || (whitelistEnabled && isWhitelisted)) {
        btnLabel = `Buy ${launchpad.tokenName}`;
        additionalInfo = `min: ${launchpad.minBuy} ${launchpad.currency}  |  max: ${launchpad.maxBuy} ${launchpad.currency}`;

        if (status !== "upcoming" && parseFloat(userContributions) < parseFloat(launchpad.maxBuy)) {
          inputDisabled = false;
          if (!error) {
            disableBtn = false;
          }
        } else {
          additionalInfo = status === "upcoming" ? null : `Your have reached the Max Buy`;
        }
      } else {
        btnLabel = "Not Whitelisted";
        additionalInfo = "Your Wallet Address isn't whitelisted for this Launchpad";
      }
    } else {
      if (!isCancelled && goalReached && parseFloat(userTokens)) {
        // Claim Tokens

        onClick = handleClaimTokens;
        btnLabel = `Claim ${formatNumber(userTokens, 3)} ${launchpad.tokenSymbol}`;
        disableBtn = !isFinalized;
        additionalInfo = !isFinalized ? "Please wait for the sale to be finalized" : "";
      } else if (
        (isCancelled && parseFloat(userContributions)) ||
        (!goalReached && parseFloat(userContributions))
      ) {
        // Claim Refund

        onClick = handleClaimRefund;
        btnLabel = "Claim Refund";
        disableBtn = false;
        additionalInfo = isCancelled
          ? "As the Launchpad was Cancelled"
          : "As the softcap wasn't reached";
      } else {
        hideBtn = true;
      }
    }

    return (
      <>
        {!inputHide && (
          <input
            disabled={inputDisabled}
            name="purchaseAmount"
            onChange={handlePurchaseAmountChange}
            value={purchaseAmount}
            type="number"
            className="form-control text-center themeInput"
            placeholder={`1 ${launchpad.currency} = ${launchpad.rate} ${launchpad.tokenSymbol}`}
          />
        )}
        <div>{error && <div style={{ color: "red" }}>{error}</div>}</div>
        {showGetTokens && purchaseAmount && !error ? (
          <div className="mt-2">
            You get:{" "}
            <span className="text-yellow">
              {`${new bn(String(launchpad.rate)).multipliedBy(new bn(purchaseAmount)).toString()} ${
                launchpad.tokenSymbol
              }`}
            </span>
          </div>
        ) : null}
        <div>
          <Button
            hideBtn={hideBtn}
            disableBtn={disableBtn || loading}
            onClick={onClick}
            className="input-group-text btn btnYellow"
            btnLabel={btnLabel}
            loading={loading}
          />
        </div>
        <div className="">
          <small>{additionalInfo}</small>
        </div>
      </>
    );
  };

  return (
    <div className=" wdBOx">
      <div className="bg-yellow rotateText">
        {!isCancelled ? (
          status !== "ended" ? (
            status === "upcoming" ? (
              <Countdown
                onComplete={() => updateStatus("live")}
                date={launchpad.startTime * 1000}
                renderer={({ days, hours, minutes, seconds }) => (
                  <p className="fontBase colorYellow text-uppercase">
                    Sale Starts In {days}:{hours}:{minutes}:{seconds}
                  </p>
                )}
              />
            ) : (
              <Countdown
                onComplete={() => updateStatus("ended")}
                date={launchpad.endTime * 1000}
                renderer={({ days, hours, minutes, seconds }) => (
                  <p className="fontBase colorYellow text-uppercase">
                    Sale Ends In {days}:{hours}:{minutes}:{seconds}
                  </p>
                )}
              />
            )
          ) : (
            <p className="fontBase colorYellow text-uppercase">Sale Has Ended</p>
          )
        ) : (
          <p className="fontBase colorYellow text-uppercase">Launchpad was Cancelled</p>
        )}
      </div>
      <div className="bg-offBlack p-4 inPt">
        <div className="progreBr mb-4 mt-4">
          <div className="col-sm-12 text-center d-flex justify-content-center flex-column align-items-center">
            <span className="text-center mb-3">
              Total Raised - {formatNumber(totalRaised, 5) || "0"} / {launchpad.hardcap}{" "}
              {launchpad.currency}
            </span>
            <ProgressBar
              percent={(parseFloat(totalRaised) / parseFloat(launchpad.hardcap)) * 100}
            />
          </div>
        </div>
        <div className="input-group">{renderBuyButton()}</div>
        {address && launchpad.chainId === chain.id && status !== "upcoming" && (
          <div className="emWi pt-4 pb-4 mt-4">
            {!loadingContributions ? (
              <div className="col-sm-12 d-flex justify-content-center text-center user-contri">
                <p>
                  Your Contribution Amount
                  <span style={{ textAlign: "center" }} className="fw-semibold">
                    {" "}
                    <span className="text-yellow">
                      {`${formatNumber(userContributions, 5)} ${launchpad.currency}`}
                    </span>
                  </span>
                </p>
                {!isCancelled && status === "live" && parseFloat(userContributions) ? (
                  <p className="mb-3 reserved-tokens">
                    Your Reserved Tokens
                    <span style={{ textAlign: "center" }} className="fw-semibold">
                      {" "}
                      <span className="text-yellow">{`${formatNumber(userTokens, 3)} ${
                        launchpad.tokenSymbol
                      }`}</span>{" "}
                      {}
                    </span>
                  </p>
                ) : null}
              </div>
            ) : (
              <Loader loading={loadingContributions} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerSection;
