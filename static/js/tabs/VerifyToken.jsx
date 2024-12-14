import React, { useEffect, useState } from "react";
import Input from "../components/common/input";
import RadioButton from "../components/common/RadioButton";
import {
  getLaunchpadCreationFee,
  getRaisedPercentageFee,
} from "../contract-hooks/launchpadFactory";
import CreateTokenModal from "../components/CreateTokenModal";
import Loader from "../components/common/Loader";
import { getTokenCreationFee } from "../contract-hooks/tokenFactory";
import { toastError } from "../utils/toastWrapper";

const VerifyToken = ({
  launchpadDetails,
  currencies,
  handleNext,
  handleTokenAddressChange,
  handleChange,
  supported,
  setCreatedToken,
  loadingToken,
}) => {
  const {
    tokenAddress,
    tokenName,
    tokenSymbol,
    tokenDecimals,
    currency,
    feeOption,
    autoDexListing,
    isSpecialToken,
  } = launchpadDetails;

  const [fees, setFees] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);

  const handleModalToggle = () => {
    modalOpen ? setModalOpen(false) : setModalOpen(true);
  };

  useEffect(() => {
    getFees();
  }, [supported]);

  const getFees = async () => {
    try {
      setLoadingFees(true);

      const [launchpadCreationFee, raisedPercentageFee, tokenCreationFee] = await Promise.all([
        getLaunchpadCreationFee(supported.factoryAddress),
        getRaisedPercentageFee(supported.factoryAddress),
        getTokenCreationFee(supported.tokenFactoryAddress),
      ]);
      setFees({ launchpadCreationFee, raisedPercentageFee, tokenCreationFee });

      setLoadingFees(false);
    } catch (error) {
      setLoadingFees(false);
    }
  };

  return fees.launchpadCreationFee && fees.raisedPercentageFee ? (
    <div
      className="tab-pane fade show active"
      id="nav-home"
      role="tabpanel"
      aria-labelledby="nav-home-tab"
    >
      <h3 className="tabTitle">
        <span>Verify Token: </span> Enter the token address and verify
      </h3>
      <button className="btn btnYellow mb-2" onClick={handleModalToggle}>
        Create a Token
      </button>
      <form>
        <div className="col-12 mb-3">
          <Input
            placeholder={"Ex: Moon Token"}
            name="tokenAddres"
            value={tokenAddress}
            error={!tokenName && "Invalid Token Address"}
            onChange={handleTokenAddressChange}
            label={"Token Address"}
            autoFocus={true}
            additionalInfo={`Launchpad Creation Fee: ${fees.launchpadCreationFee} ${currency}`}
          />
          <Loader loading={loadingToken} size={25} />
        </div>

        {tokenName && (
          <div className="col-12 mb-3">
            <ul className="token-details">
              <li>
                Token Name
                <span>{tokenName}</span>
              </li>
              <li>
                Token Symbol
                <span>{tokenSymbol}</span>
              </li>
              <li>
                Token Decimals <span>{tokenDecimals}</span>
              </li>
            </ul>
          </div>
        )}
        <div className="col-12 mb-3">
          <label className="lbl" htmlFor="staticEmail2">
            Currency
          </label>
          <div className="d-flex justify-con mFlex">
            {currencies.map((c, i) => (
              <RadioButton
                key={i}
                name={"currency"}
                value={c}
                label={c}
                id={c}
                checked={currency === c}
                onChange={handleChange}
              />
            ))}
          </div>
          <small>{`Users will pay with ${currency} for your token`}</small>
        </div>

        <div className="col-12 mb-3">
          <label className="lbl" htmlFor="staticEmail2">
            Fee Options
          </label>
          <div className="">
            <RadioButton
              name={"feeOption"}
              value={0}
              label={`${fees.raisedPercentageFee}% ${currency} raised only`}
              id={0}
              checked={feeOption === 0}
              onChange={handleChange}
            />
            <small>{`Applies only if the Launch is successful`}</small>
          </div>
        </div>

        <div className="col-12 mb-3">
          <label className="lbl" htmlFor="staticEmail2">
            Auto Dex Listing
          </label>
          <div className="">
            <RadioButton
              name={"autoDexListing"}
              id={"autoListing"}
              value={true}
              label={`Auto listing`}
              checked={autoDexListing}
              onChange={handleChange}
            />

            <RadioButton
              name={"autoDexListing"}
              id={"manualListing"}
              value={false}
              label={`Manual listing`}
              checked={!autoDexListing}
              onChange={handleChange}
            />
          </div>
        </div>

        {autoDexListing && (
          <div className="col-12 mb-3">
            <label className="lbl" htmlFor="staticEmail2">
              Does the Token have - Taxes / Burn / Rebase / or any other Special transfer function
            </label>
            <div className="">
              <RadioButton
                name={"isSpecialToken"}
                id={"false"}
                value={false}
                label={`Has None of them`}
                checked={!isSpecialToken}
                onChange={handleChange}
              />

              <RadioButton
                name={"isSpecialToken"}
                id={"true"}
                value={true}
                label={`Has atleast one of them`}
                checked={isSpecialToken}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
        <div className="col-12 d-flex lblE">
          <span>!</span>
          <p>
            {
              "Uniswap v3, Pancakeswap v3 & Sushiswap v3 doesn't support tokens with Taxes / Burns / Rebase. So Please choose v2 versions of the respective DEXes in the next Page"
            }
          </p>
        </div>
      </form>
      <div className="pagiNtion">
        {/* <a href="#">
        <img src="/images/circle-left-solid.svg" />
      </a> */}
        <button
          onClick={() => {
            handleNext();
          }}
          style={{ padding: "10px 30px" }}
          disabled={!tokenName}
          className={(tokenName && "btnYellow") || "btnYellow btn--disabled"}
        >
          Next
        </button>
      </div>
      <CreateTokenModal
        tokenFactoryAddress={supported.tokenFactoryAddress}
        setCreatedToken={setCreatedToken}
        modalOpen={modalOpen}
        handleModalClose={handleModalToggle}
        tokenCreationFee={fees.tokenCreationFee}
        nativeCurrency={currency}
      />
    </div>
  ) : (
    <Loader size={18} loading={loadingFees} />
  );
};

export default VerifyToken;
