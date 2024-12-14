import { useEffect, useState } from "react";
import {
  collectFeesFromTokenFactory,
  getTokenCreationFee,
  getTokenFactoryBalance,
  getTokenFactoryOwner,
  setTokenCreationFee,
} from "../contract-hooks/tokenFactory";
import {
  collectFeesFromLaunchpadFactory,
  getLaunchpadCreationFee,
  getLaunchpadFactoryBalance,
  getLaunchpadFactoryOwner,
  getRaisedPercentageFee,
  setCreationFee,
  setRaisedPercentageFee,
} from "../contract-hooks/launchpadFactory";
import supportedChains from "../config/supportedChains.json";
import Button from "../components/common/Button";
import OverlayLoader from "../components/common/OverlayLoader";
import { useAccount, useNetwork, useWaitForTransaction } from "wagmi";
import { toastError } from "../utils/toastWrapper";
import { waitForTransaction } from "wagmi/actions";
import { validateProperty } from "../utils/formValidation";
import { Link } from "react-router-dom";
import Input from "../components/common/input";
import { boolean, date, number, object, string } from "yup"; // Import Yup for validation
import { retryOperation } from "../utils/retryOperation";

const Admin = () => {
  const [supported, setSupported] = useState(false);
  const [currency, setCurrency] = useState("");
  const [launchpadFactoryOwner, setLaunchpadFactoryOwner] = useState("");
  const [tokenFactoryOwner, setTokenFactoryOwner] = useState("");
  const [tokenFactoryBalance, setTokenFactoryBalance] = useState("");
  const [launchpadFactoryBalance, setLaunchpadFactoryBalance] = useState("");
  const [fees, setFees] = useState({});
  const [newFees, setNewFees] = useState({
    raisedPercentageFee: "",
    launchpadCreationFee: "",
    tokenCreationFee: "",
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const { chain } = useNetwork();
  const { isConnected, address } = useAccount();

  const newFeesSchema = object({
    launchpadCreationFee: number().positive().typeError("Not a valid Number"),
    raisedPercentageFee: number().min(0).max(25).typeError("Not a valid Number").integer(),
    tokenCreationFee: number().positive().typeError("Not a valid Number"),
  });

  useEffect(() => {
    if (!isConnected) return;

    if (supportedChains[chain.id]) {
      const supported = supportedChains[chain.id];
      setSupported(supported);
      setCurrency(Object.keys(supportedChains[chain.id].currencies)[0]);
    } else {
      setSupported();
    }
  }, [chain]);

  useEffect(() => {
    if (!supported) return;
    getFactoryOwnersAndBalance();
  }, [supported]);

  const getFactoryOwnersAndBalance = async () => {
    setLoading(true);
    const [lfOwner, lfBalance, tfOwner, tfBalance, lcFee, rpFee, tcFee] = await Promise.all([
      getLaunchpadFactoryOwner(supported.factoryAddress),
      getLaunchpadFactoryBalance(supported.factoryAddress),
      getTokenFactoryOwner(supported.tokenFactoryAddress),
      getTokenFactoryBalance(supported.tokenFactoryAddress),
      getLaunchpadCreationFee(supported.factoryAddress),
      getRaisedPercentageFee(supported.factoryAddress),
      getTokenCreationFee(supported.tokenFactoryAddress),
    ]);
    setLaunchpadFactoryOwner(lfOwner);
    setLaunchpadFactoryBalance(lfBalance);
    setTokenFactoryOwner(tfOwner);
    setTokenFactoryBalance(tfBalance);

    setFees({ launchpadCreationFee: lcFee, raisedPercentageFee: rpFee, tokenCreationFee: tcFee });

    setLoading(false);
  };

  const handleChange = async (e) => {
    const { currentTarget: input } = e;

    const nFees = { ...newFees };
    nFees[input.name] = input.value;
    setNewFees(nFees);

    const tErrors = { ...errors };
    const errorMessage = await validateProperty(input, newFeesSchema);
    tErrors[input.name] = errorMessage;
    setErrors(tErrors);
  };

  const handleCollectFeesFromLaunchpadFactory = async () => {
    try {
      setLoading(true);
      const { hash } = await collectFeesFromLaunchpadFactory(supported.factoryAddress);
      if (hash) {
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });
        setLaunchpadFactoryBalance("0");
        setLoading(false);
        setNewFees({});
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setLoading(false);
      setNewFees({});
    }
  };

  const handleCollectFeesFromTokenFactory = async () => {
    try {
      setLoading(true);
      const { hash } = await collectFeesFromTokenFactory(supported.tokenFactoryAddress);
      if (hash) {
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });
        setTokenFactoryBalance("0");
        setLoading(false);
        setNewFees({});
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setLoading(false);
      setNewFees({});
    }
  };
  const handleSetLaunchpadCreationFee = async () => {
    try {
      setLoading(true);
      const { hash } = await setCreationFee(supported.factoryAddress, newFees.launchpadCreationFee);
      if (hash) {
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });

        const newLaunchpadCreationFee = await getLaunchpadCreationFee(supported.factoryAddress);
        setFees({ ...fees, launchpadCreationFee: newLaunchpadCreationFee });

        setLoading(false);
        setNewFees({});
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setLoading(false);
      setNewFees({});
    }
  };
  const handleSetRaisedPercentageFee = async () => {
    try {
      setLoading(true);
      const { hash } = await setRaisedPercentageFee(
        supported.factoryAddress,
        newFees.raisedPercentageFee
      );
      if (hash) {
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });

        const newRaisedPercentageFee = await getRaisedPercentageFee(supported.factoryAddress);
        setFees({ ...fees, raisedPercentageFee: newRaisedPercentageFee });

        setLoading(false);
        setNewFees({});
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setLoading(false);
      setNewFees({});
    }
  };
  const handleSetTokenCreationFee = async () => {
    try {
      setLoading(true);
      const { hash } = await setTokenCreationFee(
        supported.tokenFactoryAddress,
        newFees.tokenCreationFee
      );
      if (hash) {
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });

        const newTokenCreationFee = await getTokenCreationFee(supported.tokenFactoryAddress);
        setFees({ ...fees, tokenCreationFee: newTokenCreationFee });

        setLoading(false);
        setNewFees({});
      }
    } catch (error) {
      console.dir(error);
      error.shortMessage && toastError(error.shortMessage);
      setLoading(false);
      setNewFees({});
    }
  };

  return isConnected && supported ? (
    !loading ? (
      address === launchpadFactoryOwner || address === tokenFactoryOwner ? (
        <div className="px-md-5 px-3 mb-3 mt-5 admin-panel">
          {launchpadFactoryOwner === address ? (
            <div className="my-2">
              <h3 className="text-yellow">Launchpad Factory</h3>
              <div className="mt-2">
                <small>
                  Launchpad Factory Balance:{" "}
                  <span className="text-yellow">
                    {launchpadFactoryBalance} {currency}
                  </span>
                </small>
              </div>
              <Button
                onClick={handleCollectFeesFromLaunchpadFactory}
                className={"btn btnYellow"}
                btnLabel={"Withdraw Collected Fees From Launchpad Factory"}
              />
              <div className="mt-2">
                <Input
                  value={newFees["launchpadCreationFee"]}
                  type={"number"}
                  onChange={handleChange}
                  name={"launchpadCreationFee"}
                  error={errors["launchpadCreationFee"]}
                  placeholder={`0.01 ${currency}`}
                  label={`Currently: ${fees.launchpadCreationFee} ${currency}`}
                />
                <Button
                  disableBtn={errors["launchpadCreationFee"]}
                  onClick={handleSetLaunchpadCreationFee}
                  className={"btn btnYellowOutline"}
                  btnLabel={"Set Launchpad Creation Fee"}
                />
              </div>
              <div className="mt-2">
                <Input
                  value={newFees["raisedPercentageFee"]}
                  type={"number"}
                  onChange={handleChange}
                  name={"raisedPercentageFee"}
                  error={errors["raisedPercentageFee"]}
                  placeholder={"12%"}
                  label={`Currently: ${fees.raisedPercentageFee}%`}
                />
                <div>
                  <Button
                    disableBtn={errors["raisedPercentageFee"]}
                    onClick={handleSetRaisedPercentageFee}
                    className={"btn btnYellowOutline"}
                    btnLabel={`Set Raised Percentage Fee`}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {tokenFactoryOwner === address ? (
            <div className="my-5">
              <h3 className="text-yellow">Token Factory</h3>
              <div>
                <small>
                  Token Factory Balance:{" "}
                  <span className="text-yellow">
                    {tokenFactoryBalance} {currency}
                  </span>
                </small>
              </div>
              <Button
                onClick={handleCollectFeesFromTokenFactory}
                className={"btn btnYellow"}
                btnLabel={"Withdraw Collected Fees From Token Factory"}
              />
              <div className="mt-2">
                <Input
                  value={newFees["tokenCreationFee"]}
                  type={"number"}
                  onChange={handleChange}
                  name={"tokenCreationFee"}
                  error={errors["tokenCreationFee"]}
                  placeholder={`0.01 ${currency}`}
                  label={`Currently: ${fees.tokenCreationFee} ${currency}`}
                />
                <Button
                  disableBtn={errors["tokenCreationFee"]}
                  onClick={handleSetTokenCreationFee}
                  onChange={handleChange}
                  className={"btn btnYellowOutline"}
                  btnLabel={"Set Token Creation Fee"}
                />
              </div>
            </div>
          ) : null}

          <OverlayLoader size={32} loading={loading} />
        </div>
      ) : (
        <div className="d-flex justify-content-center flex-column align-items-center">
          <h4 className="mt-5 text-center">404 - Page not Nound</h4>
          <Link to="/">
            <Button className={"btn btnYellow mt-2"} btnLabel={"Go Back"} />
          </Link>
        </div>
      )
    ) : (
      <OverlayLoader size={32} loading={loading} />
    )
  ) : (
    <div className="">
      <h5 className="mt-5 text-center">Connect Wallet and Switch to a Supported Chain</h5>
    </div>
  );
};

export default Admin;
