import React, { useEffect, useState } from "react";
import { allowance, approve } from "../contract-hooks/token";
import { toastError, toastSuccess } from "../utils/toastWrapper";
import { truncateStr } from "../utils/truncate";
import Button from "../components/common/Button";
import CopyToClipboard from "react-copy-to-clipboard";
import { waitForTransaction } from "wagmi/actions";
import { useAccount } from "wagmi";
import { retryOperation } from "../utils/retryOperation";

const Review = ({
  factoryAddress,
  handlePrev,
  handleCreateLaunchpad,
  launchpadDetails,
  supported,
  tokens,
  waitCreateLaunchpad,
}) => {
  const { tokensForSale, tokensForListing, tokensNeeded } = tokens;
  const [approved, setApproved] = useState(false);
  const [waitApproveTokens, setWaitApproveTokens] = useState(false);

  const {
    tokenAddress,
    tokenName,
    tokenSymbol,
    tokenDecimals,
    rate,
    whitelistEnabled,
    refundUnsoldTokens,
    softcap,
    hardcap,
    minBuy,
    maxBuy,
    // dexLiquidityLockupDays,
    startTime,
    endTime,
    currency,
    autoDexListing,
    dexName,
    dexListingRate,
    dexLiquidityPercentage,

    logo,
    website,
    description,
    facebook,
    twitter,
    telegram,
    discord,
    reddit,
    github,
    instagram,
  } = launchpadDetails;

  let { address } = useAccount();

  const filteredSocials = [
    { label: `Facebook`, url: facebook },
    { label: `Twitter`, url: twitter },
    { label: `Telegram`, url: telegram },
    { label: `Discord`, url: discord },
    { label: `Reddit`, url: reddit },
    { label: `Github`, url: github },
    { label: `Instagram`, url: instagram },
  ].filter((social) => social.url);

  useEffect(() => {
    checkTokenAllowance();
  }, [address]);

  const checkTokenAllowance = async () => {
    try {
      const tokensApproved = await allowance(tokenAddress, address, factoryAddress, tokenDecimals);

      setApproved(parseFloat(tokensApproved) >= parseFloat(tokensNeeded));
    } catch (error) {}
  };

  const handleApproveTokens = async () => {
    try {
      setWaitApproveTokens(true);
      const { hash } = await approve(tokenAddress, factoryAddress, tokensNeeded, tokenDecimals);
      if (hash) {
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });
        await checkTokenAllowance();

        setWaitApproveTokens(false);
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setWaitApproveTokens(false);
    }
  };

  return (
    <div
      className="tab-pane fade show active"
      id="nav-Finish"
      role="tabpanel"
      aria-labelledby="nav-Finish-tab"
    >
      <h3 className="tabTitle">
        <span>Finish : </span>Review your information
      </h3>
      <div className="row">
        <ul className="finishList">
          <li>
            Total token{" "}
            <span>
              {tokensNeeded} {tokenSymbol}
            </span>
          </li>
          <li>
            Token Address
            <span>{truncateStr(tokenAddress, 21)}</span>
          </li>
          <li>
            Token name <span>{tokenName}</span>
          </li>
          <li>
            Token symbol <span>{tokenSymbol}</span>
          </li>
          <li>
            Token decimals <span>{tokenDecimals}</span>
          </li>
          <li>
            Tokens for Sale
            <span>
              {tokensForSale} {tokenSymbol}
            </span>
          </li>
          <li>
            Sale rate <span>{`${rate} ${tokenSymbol}`}</span>
          </li>
          <li>
            Sale method <span>{whitelistEnabled ? "Whitelisted" : "Public"}</span>
          </li>
          <li>
            Unsold Token <span>{refundUnsoldTokens ? "Refund" : "Burn"}</span>
          </li>
          <li>
            Softcap
            <span>
              {softcap} {currency}
            </span>
          </li>
          <li>
            Hardcap{" "}
            <span>
              {hardcap} {currency}
            </span>
          </li>
          <li>
            Minimum buy{" "}
            <span>
              {minBuy} {currency}
            </span>
          </li>
          <li>
            Maximum buy{" "}
            <span>
              {maxBuy} {currency}
            </span>
          </li>
          {autoDexListing ? (
            <>
              <li>
                DEX listing on<span>{`${dexName}`}</span>
              </li>
              <li>
                Tokens for Listing
                <span>
                  {tokensForListing} {tokenSymbol}
                </span>
              </li>
              <li>
                Listing rate <span>{`${dexListingRate} ${tokenSymbol}`}</span>
              </li>
              <li>
                Liquidity <span>{dexLiquidityPercentage}%</span>
              </li>
              <li>
                Dex Liquidity lockUp <span>Forever</span>
              </li>
            </>
          ) : null}
          <li>
            Start time{" "}
            <span>{`${startTime.toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}`}</span>
          </li>
          <li>
            End time{" "}
            <span>{`${endTime.toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}`}</span>
          </li>
          <li>
            Website <span>{website}</span>
          </li>
          <li>
            Description
            <span>{description}</span>
          </li>
          {filteredSocials.map((social, i) => (
            <li key={i}>
              {social.label}
              <span>{truncateStr(social.url, 25)}</span>
            </li>
          ))}
          {/* <li>
            Using Team Vesting ? <span>No</span>
          </li> */}
        </ul>
      </div>

      <div className="col-12 d-flex lblE">
        <span>!</span>
        <p>
          If your token has any fees, rewards system or max Txn limits then Please exclude
          Foundation launchpad Factory Address{" "}
          <bold className="colorYellow">{truncateStr(supported.factoryAddress, 21)}</bold>{" "}
          <CopyToClipboard text={supported.factoryAddress}>
            <img
              style={{ cursor: "pointer", marginTop: "-2px", marginRight: "10px" }}
              src="/images/copy.svg"
              alt=""
            />
          </CopyToClipboard>
          from fees, rewards, max tx amount to start creating pools
        </p>
      </div>

      <div className="col-12 d-flex lblE">
        <span>!</span>
        <p>
          For tokens with burns, rebase or other special transfers please ensure that you have a way
          to whitelist multiple addresses or turn off the special transfer events (By setting fees
          to 0 for example for the duration of the presale)
        </p>
      </div>

      {!approved ? (
        <>
          <div className="col-12 d-flex justify-content-center mt-4">
            <Button
              loading={waitApproveTokens}
              onClick={handleApproveTokens}
              btnLabel={`Approve ${tokensNeeded} ${tokenSymbol}`}
              className={"btn btnYellow"}
              disableBtn={waitApproveTokens}
            />
          </div>
          <div className="col-12 text-center">
            <small>Please Approve Tokens for Launchpad</small>
          </div>
        </>
      ) : null}

      <div className="pagiNtion">
        <button onClick={handlePrev} style={{ padding: "10px 30px" }} className="btnYellow">
          Back
        </button>
        <Button
          loading={waitCreateLaunchpad}
          btnLabel={"Create Launchpad"}
          onClick={handleCreateLaunchpad}
          style={{ padding: "10px 30px" }}
          disableBtn={!approved || waitCreateLaunchpad}
          className={(approved && "btnYellow") || "btnYellow btn--disabled"}
        />
      </div>
    </div>
  );
};

export default Review;
