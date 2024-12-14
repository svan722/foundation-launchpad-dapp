import SaleDetails from "../components/viewLaunchpadComponents/SaleDetails";
import { useParams } from "react-router-dom";
import TokenMetrics from "../components/viewLaunchpadComponents/TokenMetrics";
import BuyerSection from "../components/viewLaunchpadComponents/BuyerSection";
import { useEffect, useState } from "react";
import { fetchLaunchpad } from "../api-services/launchpadServices";
import supportedChains from "../config/supportedChains.json";
import OwnerSection from "../components/viewLaunchpadComponents/OwnerSection";
import Disclaimer from "../components/viewLaunchpadComponents/Disclaimer";
import { getCurrentTime } from "../utils/getCurrentTime";
import {
  getHasAirdropped,
  getIsCancelled,
  getIsFinalized,
  getIsWhitelistEnabled,
  getTotalContributors,
  getTotalRaised,
} from "../contract-hooks/launchpad";
import AboutProject from "../components/viewLaunchpadComponents/AboutProject";
import { toastError } from "../utils/toastWrapper";
import Loader from "../components/common/Loader";
import { useAccount, useNetwork } from "wagmi";
import { formatNumber } from "../utils/formatNumber";

const ViewLaunchpad = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [launchpad, setLaunchpad] = useState(false);
  const [status, setStatus] = useState("");
  const [totalRaised, setTotalRaised] = useState(0);
  const [totalContributors, setTotalContributors] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const [goalReached, setGoalReached] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [hasAirdropped, setHasAirdropped] = useState(false);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);
  const [loadingLaunchpad, setLoadingLaunchpad] = useState(false);

  const { address: launchpadAddress } = useParams();

  const { chain } = useNetwork();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    fetchingLaunchpad();
  }, []);

  useEffect(() => {
    if (!launchpad) return;

    fetchingLaunchpadData();
  }, [launchpad]);

  useEffect(() => {
    if (!launchpad) return;

    if (launchpad.ownerAddress === address) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [launchpad, address]);

  useEffect(() => {
    if (!launchpad) return;

    setGoalReached(parseFloat(totalRaised) >= parseFloat(launchpad.softcap));
  }, [totalRaised, launchpad]);

  useEffect(() => {
    if (!launchpad || chain?.id !== launchpad.chainId) return;
    gettingLaunchpadData();
  }, [chain, launchpad]);

  async function fetchingLaunchpad() {
    try {
      setLoadingLaunchpad(true);
      const { data: launchpadData } = await fetchLaunchpad(launchpadAddress);
      setLoadingLaunchpad(false);

      let currentStatus;
      if (launchpadData.startTime > getCurrentTime()) currentStatus = "upcoming";
      else if (launchpadData.endTime <= getCurrentTime()) currentStatus = "ended";
      else currentStatus = "live";

      setLaunchpad(launchpadData);
      setStatus(currentStatus);
    } catch (error) {
      toastError("Fetch Launchpad Failed");
      setLoadingLaunchpad(false);
    }
  }

  const fetchingLaunchpadData = async () => {
    try {
      const [tRaised, tContri, tWhitelistEnabled, tIsCancelled] = await Promise.all([
        getTotalRaised(launchpad.chainId, launchpad.address),
        getTotalContributors(launchpad.chainId, launchpad.address),
        getIsWhitelistEnabled(launchpad.chainId, launchpad.address),
        getIsCancelled(launchpad.chainId, launchpad.address),
      ]);

      setTotalRaised(tRaised);
      setTotalContributors(tContri);
      setWhitelistEnabled(tWhitelistEnabled);
      setIsCancelled(tIsCancelled);
    } catch (error) {}
  };

  const gettingLaunchpadData = async () => {
    try {
      let finalized;
      let airdopped;
      finalized = await getIsFinalized(launchpad.address);
      airdopped = await getHasAirdropped(launchpad.address);

      setIsFinalized(finalized);
      setHasAirdropped(airdopped);
    } catch (error) {}
  };

  const updateStatus = (currentStatus) => {
    setStatus(currentStatus);
  };
  const updateTotalRaised = (newTotalRaised) => {
    setTotalRaised(newTotalRaised);
  };
  const updateTotalContributors = (contributors) => {
    setTotalContributors(contributors);
  };

  const updateIsCancelled = () => {
    setIsCancelled(true);
  };
  const updateIsFinalized = () => {
    setIsFinalized(true);
  };
  const updateHasAirdropped = () => {
    setHasAirdropped(true);
  };
  const updateWhitelistEnabled = () => {
    const bool = whitelistEnabled ? false : true;
    setWhitelistEnabled(bool);
  };

  return !loadingLaunchpad ? (
    launchpad && (
      <div className="px-md-5 px-3 mt-5">
        <div className="row">
          <div className="col-xl-3 col-lg-4 col-md-12">
            <AboutProject launchpad={launchpad} />
            <div className="bg-offBlack p-4 mb-4">
              {/* <TokenMetrics /> */}
              <div className="w-100 Foundation-token-btn d-flex align-items-center justify-content-center my-5">
                <img className="w-42 me-2" src={launchpad.logo} />
                <h5 className="mt-2">{launchpad.tokenName}</h5>
              </div>
              <ul className="tokensSec">
                {[
                  {
                    url: `${supportedChains[launchpad.chainId].blockExplorerUrl}/address/${
                      launchpad.tokenAddress
                    }`,
                    label: "Token Address",
                  },
                ].map((link, index) => (
                  <li key={index} className={index === 0 ? "active" : null}>
                    <a index href={link.url}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              {launchpad.type === "IDO" && launchpad.autoDexListing && (
                <div className="marketCapAmount px-4 py-3 text-center mb-4">
                  <p className="mb-1">{`${formatNumber(launchpad.initialMarketcap, 2)} USD`}</p>
                  <span>Estimated Initial Marketcap</span>
                </div>
              )}

              <p className="size10 text-center">
                This Sale is a Decentralized Launchpad. Anyone can list a token at anytime.
                Sometimes owners may have malicious intent and as a user you must do your own
                research. The tools provided above can help you make a better decision but do not
                guarantee any level of safety!
              </p>
            </div>
          </div>

          <div className="col-xl-9 col-lg-8 col-md-12">
            <Disclaimer />
            <div className="row">
              <div className="col-xl-6 mb-md-0 mb-4">
                <SaleDetails launchpad={launchpad} />
              </div>

              <div className="col-xl-6">
                {/* <AboutProject launchpad={launchpad} /> */}
                <BuyerSection
                  launchpad={launchpad}
                  totalRaised={totalRaised}
                  isFinalized={isFinalized}
                  status={status}
                  updateTotalContributors={updateTotalContributors}
                  updateStatus={updateStatus}
                  updateTotalRaised={updateTotalRaised}
                  goalReached={goalReached}
                  whitelistEnabled={whitelistEnabled}
                  isCancelled={isCancelled}
                  hasAirdropped={hasAirdropped}
                  loadingLaunchpad={loadingLaunchpad}
                />
                <div className="bg-offBlack p-4 my-4 mx-4">
                  <div className="row">
                    <div className="col-6 mb-3">Contributors</div>
                    <div style={{ textAlign: "right" }} className="col-6 mb-3 colorYellow">
                      {totalContributors}
                    </div>
                    <div className="col-6 mb-3">Sale Type</div>
                    <div style={{ textAlign: "right" }} className="col-6 mb-3 colorYellow">
                      {whitelistEnabled ? "Whitelist Only" : "Public"}
                    </div>
                    <div className="col-6 mb-3">Sale Status</div>
                    <div style={{ textAlign: "right" }} className="col-6 mb-3 colorYellow">
                      {isCancelled ? "CANCELLED" : status.toUpperCase()}
                    </div>
                  </div>
                </div>
                {isOwner && launchpad.chainId === chain.id && (
                  <OwnerSection
                    whitelistEnabled={whitelistEnabled}
                    updateWhitelistEnabled={updateWhitelistEnabled}
                    updateIsCancelled={updateIsCancelled}
                    isFinalized={isFinalized}
                    isCancelled={isCancelled}
                    updateIsFinalized={updateIsFinalized}
                    hasAirdropped={hasAirdropped}
                    updateHasAirdropped={updateHasAirdropped}
                    status={status}
                    goalReached={goalReached}
                    launchpad={launchpad}
                    totalRaised={totalRaised}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  ) : (
    <Loader size={25} loading={loadingLaunchpad} />
  );
};

export default ViewLaunchpad;
