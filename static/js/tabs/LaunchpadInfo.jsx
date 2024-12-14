import Input from "../components/common/input";
import { useEffect, useState } from "react";
import RadioButton from "../components/common/RadioButton";
import Select from "../components/common/select";
import { getTokensNeeded } from "../contract-hooks/launchpadFactory";
import { boolean, date, number, object, string } from "yup"; // Import Yup for validation
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { balanceOf } from "../contract-hooks/token";
import { getCurrentTime } from "../utils/getCurrentTime";
import { toastError } from "../utils/toastWrapper";
import { useAccount } from "wagmi";

const LaunchpadInfo = ({
  handleNext,
  handlePrev,
  supported,
  launchpadDetails,
  tokens,
  handleChange,
  setTokensNeeded,
  errors,
  handleTime,
  startTimeGap,
}) => {
  const { tokensNeeded } = tokens;

  const {
    whitelistEnabled,
    refundUnsoldTokens,
    rate,
    hardcap,
    autoDexListing,
    dexName,
    dexListingRate,
    dexLiquidityPercentage,
    currency,
    tokenDecimals,
    tokenAddress,
    tokenSymbol,
    maxBuy,
    startTime,
    endTime,
  } = launchpadDetails;

  // Schema
  const withAutoDexListing = {
    dexName: string().required(),
    dexListingRate: number()
      .typeError("${path} is required")
      .required()
      .positive()
      .max(launchpadDetails.rate),
    dexLiquidityPercentage: number()
      .typeError("${path} is required")
      .required()
      .positive()
      .integer("Cannot have decimals")
      .min(50)
      .max(100),
    // dexLiquidityLockupDays: number().typeError("${path} is required").required().min(30),
  };

  let launchpadInfoSchema = {
    rate: number().typeError("${path} is required").required().positive(),
    whitelistEnabled: boolean(),
    softcap: number()
      .typeError("${path} is required")
      .required()
      .positive()
      .min(hardcap * 0.25)
      .lessThan(hardcap),
    hardcap: number().typeError("${path} is required").required().positive(),
    minBuy: number().typeError("${path} is required").required().positive().max(maxBuy),
    maxBuy: number().typeError("${path} is required").required().positive().max(hardcap),
    startTime: date()
      .required()
      .typeError("${path} is required")
      .required()
      .test(
        "valid",
        `${"${path}"} must be atleast ${parseInt(startTimeGap / 60)} mins from now`,
        () => {
          try {
            console.log(Math.floor(startTime.getTime() / 1000) >= getCurrentTime() + startTimeGap);
            return Math.floor(startTime.getTime() / 1000) >= getCurrentTime() + startTimeGap;
          } catch (error) {}
        }
      ),
    endTime: date()
      .required()
      .typeError("${path} is required")
      .required()
      .test("valid", "${path} must be greater than Start Time", () => {
        return Math.floor(endTime.getTime() / 1000) > Math.floor(startTime.getTime() / 1000);
      }),
    refundUnsoldTokens: string().required("Refund type is a required field"),
  };

  launchpadInfoSchema = !autoDexListing
    ? object(launchpadInfoSchema)
    : object({ ...launchpadInfoSchema, ...withAutoDexListing });

  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [hasTokens, setHasToken] = useState(true);
  const [dexOptions, setDexOptions] = useState([]);

  const { address } = useAccount();

  useEffect(() => {
    if (!hardcap || !rate) return;

    fetchTokensNeeded();
  }, [rate, dexListingRate, hardcap, dexLiquidityPercentage]);

  useEffect(() => {
    if (!address) return;
    getUserTokenBalance();
  }, [address]);

  useEffect(() => {
    setHasToken(parseFloat(userTokenBalance) >= parseFloat(tokensNeeded));
  }, [tokensNeeded, userTokenBalance]);

  const fetchTokensNeeded = async () => {
    try {
      const { tokensNeeded, tokensForSale, tokensForListing } = await getTokensNeeded(
        supported.factoryAddress,
        rate,
        hardcap,
        autoDexListing,
        dexListingRate,
        parseInt(dexLiquidityPercentage),
        tokenDecimals
      );
      setTokensNeeded(tokensNeeded, tokensForSale, tokensForListing);
    } catch (error) {}
  };

  // Dex for taxTokens
  useEffect(() => {
    let dOptions;
    if (launchpadDetails.isSpecialToken) {
      dOptions = Object.keys(supported.dexOptions).filter((dex) => dex.includes("v2"));
    } else {
      dOptions = Object.keys(supported.dexOptions);
    }
    setDexOptions(["", ...dOptions]);
  }, []);

  const getUserTokenBalance = async () => {
    try {
      const balance = await balanceOf(tokenAddress, address, tokenDecimals);
      setUserTokenBalance(balance);
    } catch (error) {}
  };

  return (
    <div
      className="tab-pane fade show active"
      id="nav-profile"
      role="tabpanel"
      aria-labelledby="nav-profile-tab"
    >
      <h3 className="tabTitle">
        <span>DeFi Launchpad Info: </span>
        <br />
      </h3>
      <form className="row">
        <div className="col-12 mb-3">
          <Input
            type={"number"}
            name={"rate"}
            label={"Sale Rate*"}
            placeholder={1000}
            value={rate}
            onChange={(e) => handleChange(e, launchpadInfoSchema)}
            autoFocus={true}
            error={errors["rate"]}
            additionalInfo={`if I spend 1 ${currency} how many tokens will I recieve?`}
          />
        </div>

        <div className="col-12 mb-3">
          <label className="lbl" htmlFor="staticEmail2">
            Whitelist
          </label>
          <div className="d-flex justify-con">
            <RadioButton
              name={"whitelistEnabled"}
              value={false}
              label={"Disable"}
              checked={whitelistEnabled === false}
              onChange={(e) => handleChange(e, launchpadInfoSchema)}
            />
            <RadioButton
              name={"whitelistEnabled"}
              value={true}
              label={"Enable"}
              checked={whitelistEnabled === true}
              onChange={(e) => handleChange(e, launchpadInfoSchema)}
            />
          </div>
        </div>

        {[
          {
            label: `Softcap(${currency})*`,
            name: "softcap",
            additionalInfo: "must be >= 25% of hardcap",
          },
          { label: `HardCap (${currency})*`, name: "hardcap" },
          { label: `Minimum buy (${currency})*`, name: "minBuy" },
          {
            label: `Maximum buy (${currency})*`,
            name: "maxBuy",
          },
        ].map(({ label, name, additionalInfo, placeholder }, i) => (
          <div key={i} className="col-6 mb-3">
            <Input
              type={"number"}
              name={name}
              label={label}
              placeholder={placeholder || ""}
              value={launchpadDetails[name]}
              onChange={(e) => handleChange(e, launchpadInfoSchema)}
              error={errors[name]}
              additionalInfo={additionalInfo || ""}
            />
          </div>
        ))}
        <div className="col-12 mb-3">
          <Select
            onChange={(e) => handleChange(e, launchpadInfoSchema)}
            value={refundUnsoldTokens}
            name={"refundUnsoldTokens"}
            label={"Refund Type for Unsold Tokens"}
            options={["", "burn", "refund"]}
            error={errors["refundUnsoldTokens"]}
            additionalInfo={"Assuming launchpad was success"}
          />
        </div>

        {/* DEX LISTING INFO */}

        {autoDexListing && (
          <>
            <div className="col-12 mb-3">
              <Select
                onChange={(e) => handleChange(e, launchpadInfoSchema)}
                value={dexName}
                name={"dexName"}
                label={"Dex Name"}
                options={dexOptions}
                error={errors["dexName"]}
                additionalInfo={"Listing on v2 is gas efficient"}
              />
            </div>
            {[
              {
                label: `${dexName} Listing rate*`,
                name: "dexListingRate",
                placeholder: 800,
                additionalInfo: `Usually this
                amount is lower than sale rate to allow for a higher listing
                price on DEX`,
              },
              {
                label: `% of Raised Funds for listing`,
                name: "dexLiquidityPercentage",
                placeholder: "50",
                additionalInfo: `Percentage of raised funds that should be allocated for
                Liquidity on DEX (50% - 100%)`,
              },
            ].map(({ label, name, additionalInfo, placeholder }, i) => (
              <div className="col-6 mb-3" key={i}>
                <Input
                  type={"number"}
                  name={name}
                  label={label}
                  placeholder={placeholder || ""}
                  error={errors[name]}
                  value={launchpadDetails[name]}
                  onChange={(e) => handleChange(e, launchpadInfoSchema)}
                  additionalInfo={additionalInfo || ""}
                />
              </div>
            ))}
            <div className="col-12 mb-3">
              <Input
                disabled={true}
                // type={"number"}
                name={"dexLiquidityLockupDays"}
                label={"Dex Liquidity Lockup*"}
                placeholder={"Forever"}
                error={errors["dexLiquidityLockupDays"]}
                value={"Forever"}
                onChange={(e) => handleChange(e, launchpadInfoSchema)}
                additionalInfo={"To gain users/investors trust"}
              />
            </div>
          </>
        )}
        <div className="col-6 mb-3 column-on-mobile">
          {
            // Changes on production - 2 timeIntervals`
          }
          <div>
            <label className="lbl" htmlFor="staticEmail2">
              Start Time
            </label>
          </div>
          <DatePicker
            selectsStart
            showTimeSelect
            selected={startTime}
            onChange={(date) => handleTime("startTime", date)}
            timeIntervals={30} // inMinutes
            minDate={new Date()}
            className="form-control"
            dateFormat="MMMM d, yyyy h:mm aa"
          />
          {errors["startTime"] && <div style={{ color: "red" }}>{errors["startTime"]}</div>}
        </div>
        <div className="col-6 mb-3 column-on-mobile">
          <div>
            <label className="lbl" htmlFor="staticEmail2">
              End Time
            </label>
          </div>
          <DatePicker
            selectsEnd
            showTimeSelect={true}
            selected={endTime}
            minDate={new Date()}
            timeIntervals={30} // inMinutes
            onChange={(date) => handleTime("endTime", date)}
            className="form-control"
            dateFormat="MMMM d, yyyy h:mm aa"
          />
          {errors["endTime"] && <div style={{ color: "red" }}>{errors["endTime"]}</div>}
        </div>
      </form>

      {tokensNeeded && (
        <p className="text-center">
          Need{" "}
          <span style={{ color: "#ffd67b" }}>
            {tokensNeeded} {tokenSymbol}
          </span>{" "}
          to create Launchpad
        </p>
      )}
      {!hasTokens && (
        <p className="text-center" style={{ color: "red" }}>
          You don't have enough Tokens to proceed
        </p>
      )}

      <div className="pagiNtion">
        <button onClick={handlePrev} style={{ padding: "10px 30px" }} className="btnYellow">
          Back
        </button>
        <button
          disabled={!hasTokens}
          onClick={() => handleNext(launchpadInfoSchema)}
          style={{ padding: "10px 30px" }}
          className={(hasTokens && "btnYellow") || "btnYellow btn--disabled"}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LaunchpadInfo;
