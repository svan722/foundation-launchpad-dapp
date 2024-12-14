import { truncateStr } from "../../utils/truncate";
import supportedChains from "../../config/supportedChains.json";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { formatNumber } from "../../utils/formatNumber";

const SaleDetails = ({ launchpad }) => {
  return (
    <div className="bg-offBlack p-4 mb-4 h-100">
      <p className="fontBase mb-4">Token Sale Details</p>
      <div className="row">
        {launchpad.autoDexListing && (
          <>
            <div className="col-6 mb-3">Listing On</div>
            <div className="col-6 mb-3">{launchpad.dexName}</div>
          </>
        )}
        <div className="col-6 mb-3">launchpad Address</div>
        <div className="col-6 mb-3">
          <a
            target="_blank"
            href={`${supportedChains[launchpad.chainId].blockExplorerUrl}/address/${
              launchpad.address
            }`}
            className="colorYellow"
          >
            {truncateStr(launchpad.address, 15)}
          </a>
        </div>
        <div className="col-6 mb-3">Token Address</div>
        <div className="col-6 mb-3">
          <a
            target="_blank"
            href={`${supportedChains[launchpad.chainId].blockExplorerUrl}/address/${
              launchpad.tokenAddress
            }`}
            className="colorYellow"
          >
            {truncateStr(launchpad.tokenAddress, 15)}
          </a>
        </div>

        <div className="col-6 mb-3">Sale Rate</div>
        <div className="col-6 mb-3">
          {formatNumber(launchpad.rate, 3)} {launchpad.tokenSymbol} per {launchpad.currency}
        </div>
        <div className="col-6 mb-3">Total Supply</div>
        <div className="col-6 mb-3 fw-semibold">
          {formatNumber(launchpad.tokenTotalSupply, 3)} {launchpad.tokenSymbol}
        </div>
        <div className="col-6 mb-3">Tokens For Sale</div>
        <div className="col-6 mb-3 fw-semibold">
          {formatNumber(launchpad.tokensForSale, 3)} {launchpad.tokenSymbol}
        </div>
        <div className="col-6 mb-3">Soft Cap</div>
        <div className="col-6 mb-3 fw-semibold">
          {formatNumber(launchpad.softcap, 5)} {launchpad.currency}
        </div>
        <div className="col-6 mb-3">Hard Cap</div>
        <div className="col-6 mb-3 fw-semibold">
          {formatNumber(launchpad.hardcap, 5)} {launchpad.currency}
        </div>
        {launchpad.autoDexListing && (
          <>
            <div className="col-6 mb-3">{launchpad.dexName} Listing Rate</div>
            <div className="col-6 mb-3">
              {formatNumber(launchpad.dexListingRate, 3)} {launchpad.tokenSymbol} per{" "}
              {launchpad.currency}
            </div>
            <div className="col-6 mb-3">Tokens For Listing</div>
            <div className="col-6 mb-3 fw-semibold">
              {formatNumber(launchpad.tokensForListing, 3)} {launchpad.tokenSymbol}
            </div>
          </>
        )}
        <div className="col-6 mb-3">Minimum Contribution</div>
        <div className="col-6 mb-3 fw-semibold">
          {formatNumber(launchpad.minBuy, 5)} {launchpad.currency}
        </div>
        <div className="col-6 mb-3">Maximum Contribution</div>
        <div className="col-6 mb-3 fw-semibold">
          {formatNumber(launchpad.maxBuy, 5)} {launchpad.currency}
        </div>
        <div className="col-6 mb-3">Unsold Tokens</div>
        <div className="col-6 mb-3 fw-semibold">
          {launchpad.refundUnsoldTokens ? "Refund" : "Burn"}
        </div>
        <div className="col-6 mb-3">IDO Start Time</div>
        <div className="col-6 mb-3 fw-semibold">{`${new Date(
          launchpad.startTime * 1000
        ).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })}`}</div>
        <div className="col-6 mb-3">IDO End Time</div>
        <div className="col-6 mb-3 fw-semibold">{`${new Date(
          launchpad.endTime * 1000
        ).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })}`}</div>
        {launchpad.autoDexListing && (
          <>
            <div className="col-6 mb-3">Dex Liquidity Locked</div>
            <div className="col-6 mb-3 fw-semibold">Forever</div>
          </>
        )}
      </div>
    </div>
  );
};

export default SaleDetails;
