import React, { useEffect, useState } from "react";
import VerifyToken from "../tabs/VerifyToken";
import LaunchpadInfo from "../tabs/LaunchpadInfo";
import ProjectInfo from "../tabs/ProjectInfo";
import Review from "../tabs/Review";
import supportedChains from "../config/supportedChains.json";
import { createLaunchpad, getLaunchpadParams } from "../contract-hooks/launchpadFactory";
import { verifyToken } from "../contract-hooks/token";
import { validate, validateProperty } from "../utils/formValidation";
import { fetchStatus, getTokenPairs, saveLaunchpad } from "../api-services/launchpadServices";
import { useNavigate } from "react-router-dom";
import { getCurrentTime } from "../utils/getCurrentTime";
import { toastError, toastSuccess } from "../utils/toastWrapper";
import { useAccount, useNetwork } from "wagmi";
import { waitForTransaction } from "wagmi/actions";
import { retryOperation } from "../utils/retryOperation";

// Changes on production
const initialLaunchpadDetails = {
  launchpadCreationFee: "",
  raisedPercentageFee: "",
  type: "IDO",
  isSpecialToken: false,

  tokenAddress: "",
  tokenName: "",
  tokenSymbol: "",
  tokenDecimals: "",
  tokenTotalSupply: "",
  currency: "0",
  feeOption: 0,
  autoDexListing: true,

  rate: "",
  whitelistEnabled: false,
  softcap: "",
  hardcap: "",
  minBuy: "",
  maxBuy: "",
  refundUnsoldTokens: "",
  startTime: "",
  endTime: "",

  dexName: "",
  dexListingRate: "",
  dexLiquidityPercentage: "",

  logo: "",
  website: "",
  description: "",
  facebook: "",
  twitter: "",
  telegram: "",
  discord: "",
  reddit: "",
  github: "",
  instagram: "",
};

const CreateLaunchpad = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [launchpadDetails, setLaunchpadDetails] = useState(initialLaunchpadDetails);
  const [supported, setSupported] = useState(false);
  const [tokens, setTokens] = useState({
    tokensNeeded: "0",
    tokensForSale: "0",
    tokensForListing: "0",
  });
  const [errors, setErrors] = useState({});
  const [loadingToken, setLoadingToken] = useState(false);
  const [waitCreateLaunchpad, setWaitCreateLaunchpad] = useState(false);
  const startTimeGap = 900; // inSeconds // changes on production

  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  // For setting supported and reverting back to tab-0 when the chainId changes
  useEffect(() => {
    if (!isConnected) return;

    setCurrentTab(0);

    if (supportedChains[chain.id]) {
      const supported = supportedChains[chain.id];
      initialLaunchpadDetails.currency = Object.keys(supported.currencies)[0];

      setSupported(supported);
      setLaunchpadDetails(initialLaunchpadDetails);
    } else {
      setSupported(false);
    }
  }, [isConnected, chain]);

  // For reverting back to tab-1 if account changes
  // (and check if the account has needed tokens before moving further)
  useEffect(() => {
    if (currentTab > 1) setCurrentTab(1);
  }, [address]);

  const handleTokenAddressChange = async (e) => {
    const tokenAddress = e.target.value;
    setLaunchpadDetails({ ...launchpadDetails, tokenAddress });
    verifyingToken(tokenAddress);
  };

  const verifyingToken = async (tokenAddress) => {
    try {
      let tokenName;
      let tokenSymbol;
      let tokenDecimals;
      let tokenTotalSupply;
      let type = "IDO";

      if (tokenAddress.length === 42) {
        setLoadingToken(true);
        const { name, symbol, decimals, totalSupply } = await verifyToken(tokenAddress);

        if (name) {
          tokenName = name;
          tokenSymbol = symbol;
          tokenDecimals = decimals;
          tokenTotalSupply = totalSupply;

          try {
            const { pair_count } = (await getTokenPairs(supported.apiSlug, tokenAddress)).data;
            if (pair_count) {
              type = "Sale";
            }
          } catch (error) {}
        }
      }

      setLaunchpadDetails({
        ...launchpadDetails,
        tokenAddress,
        tokenName,
        tokenSymbol,
        tokenDecimals,
        tokenTotalSupply,
        type,
      });
      setLoadingToken(false);
    } catch (error) {
      setLoadingToken(false);
    }
  };

  const handleChange = async (e, validationSchema) => {
    const { currentTarget: input } = e;
    let lDetails = { ...launchpadDetails };
    let inputValue = input.value;

    // To deal with -ve numbers
    if (input.type === "number" && parseInt(inputValue) < 0) return;

    // To set bool value
    if (inputValue === "true") inputValue = true;
    else if (inputValue === "false") inputValue = false;

    if (validationSchema) {
      if (
        (input.name === "softcap" && !launchpadDetails.hardcap) ||
        (input.name === "minBuy" && !launchpadDetails.maxBuy) ||
        (input.name === "dexListingRate" && !launchpadDetails.rate)
      ) {
        // Do nothing or don't validate
      } else {
        const tErrors = errors;
        const error = await validateProperty(input, validationSchema);
        tErrors[input.name] = error;
        setErrors(tErrors);
      }
    }

    lDetails[input.name] = inputValue;
    setLaunchpadDetails(lDetails);
  };

  // These 2 (logo image and time) cannot be handled in handleChange hence they have separate handler
  const setLogo = async (logo) => {
    let logoError;

    if (logo) {
      logoError = "";
    } else {
      logoError = "Please upload a logo";
    }

    setErrors({ ...errors, logo: logoError });
    setLaunchpadDetails({ ...launchpadDetails, logo });
  };

  const handleTime = (name, date) => {
    try {
      let lDetails = { ...launchpadDetails };
      let tErrors = { ...errors };

      const unixTime = Math.floor(date.getTime() / 1000);

      if (name === "startTime") {
        tErrors[name] =
          getCurrentTime() + startTimeGap > unixTime
            ? `must be atleast ${parseInt(startTimeGap / 60)} minutes from now`
            : "";
      } else {
        if (launchpadDetails.startTime) {
          tErrors[name] =
            unixTime <= Math.floor(launchpadDetails.startTime.getTime() / 1000)
              ? "must be greater than start time"
              : null;
        } else {
          tErrors[name] = "";
        }
      }

      lDetails[name] = date;

      setErrors(tErrors);
      setLaunchpadDetails(lDetails);
    } catch (e) {}
  };

  const setTokensNeeded = (tokensNeeded, tokensForSale, tokensForListing) => {
    setTokens({ tokensNeeded, tokensForSale, tokensForListing });
  };

  // If user creates standard token from launchpad dashboard
  const setCreatedToken = (tokenAddress) => {
    setLaunchpadDetails({ ...launchpadDetails, tokenAddress });
    verifyingToken(tokenAddress);
  };

  const handleNext = async (validationSchema) => {
    if (currentTab === 1) {
      const errors = await validate(launchpadDetails, validationSchema);
      setErrors(errors || {});
      if (errors) return;
    }
    if (currentTab < 2) {
      setCurrentTab(currentTab + 1);
    }
  };

  const handlePrev = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  const handleSubmit = async (validationSchema) => {
    let errors = await validate(launchpadDetails, validationSchema);

    setErrors(errors || {});
    if (errors) return;
    setCurrentTab(3);
  };

  const handleCreateLaunchpad = async () => {
    try {
      const launchpadParams = getLaunchpadParams(launchpadDetails, chain.id);

      const startTime = Math.floor(launchpadDetails.startTime.getTime() / 1000);
      const endTime = Math.floor(launchpadDetails.endTime.getTime() / 1000);

      if (startTime < getCurrentTime() + startTimeGap / 2) {
        toastError("Please reset the start Time");
        return setCurrentTab(1);
      }

      // Basic backend status checker
      setWaitCreateLaunchpad(true);
      await fetchStatus();

      const { hash } = await createLaunchpad(supported.factoryAddress, [launchpadParams]);

      if (hash) {
        const { data: launchpadAddress } = await saveLaunchpad(
          {
            ...launchpadDetails,
            refundUnsoldTokens: launchpadDetails.refundUnsoldTokens === "burn" ? false : true,
            startTime,
            endTime,
            tokensForSale: tokens.tokensForSale,
            tokensForListing: tokens.tokensForListing,
          },
          hash,
          chain.id
        );

        setWaitCreateLaunchpad(false);
        toastSuccess("Created Launchpad Successfully");
        navigate(`/launchpads/${launchpadAddress}`);
      }
    } catch (error) {
      if (error.shortMessage) {
        toastError(`${error.shortMessage}, Please Read Warnings Carefully`);
      } else {
        toastError("Something went wrong, Please try after sometime");
      }
      setWaitCreateLaunchpad(false);
    }
  };

  return isConnected && supported ? (
    <div className="px-md-5 px-3 mb-3 mt-5">
      <div className="row">
        <div className="col-md-12 col-sm-12">
          <nav className="stepsTab">
            <div className="nav nav-tabs" id="nav-tab" role="tablist">
              <button disabled={true} className={`nav-link ${currentTab === 0 && "active"}`}>
                Verify Token
              </button>
              <button disabled={true} className={`nav-link ${currentTab === 1 && "active"}`}>
                Launchpad Info
              </button>
              <button disabled={true} className={`nav-link ${currentTab === 2 && "active"}`}>
                Project Info
              </button>
              <button disabled={true} className={`nav-link ${currentTab === 3 && "active"}`}>
                Review & Create
              </button>
            </div>
          </nav>
          <div className="tab-content" id="nav-tabContent">
            {currentTab === 0 && (
              <VerifyToken
                setCreatedToken={setCreatedToken}
                handleTokenAddressChange={handleTokenAddressChange}
                handleChange={handleChange}
                launchpadDetails={launchpadDetails}
                currencies={Object.keys(supported.currencies)}
                handleNext={handleNext}
                supported={supported}
                loadingToken={loadingToken}
              />
            )}
            {currentTab === 1 && (
              <LaunchpadInfo
                startTimeGap={startTimeGap}
                errors={errors}
                setErrors={setErrors}
                launchpadDetails={launchpadDetails}
                handleChange={handleChange}
                handlePrev={handlePrev}
                handleNext={handleNext}
                tokens={tokens}
                supported={supported}
                setTokensNeeded={setTokensNeeded}
                handleTime={handleTime}
              />
            )}
            {currentTab === 2 && (
              <ProjectInfo
                handleChange={handleChange}
                handlePrev={handlePrev}
                launchpadDetails={launchpadDetails}
                handleSubmit={handleSubmit}
                errors={errors}
                setLogo={setLogo}
              />
            )}
            {currentTab === 3 && (
              <Review
                factoryAddress={supported.factoryAddress}
                launchpadDetails={launchpadDetails}
                handlePrev={handlePrev}
                handleCreateLaunchpad={handleCreateLaunchpad}
                supported={supported}
                tokens={tokens}
                waitCreateLaunchpad={waitCreateLaunchpad}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="">
      <h5 className="mt-5 text-center">Connect Wallet and Switch to a Supported Chain</h5>
    </div>
  );
};

export default CreateLaunchpad;
