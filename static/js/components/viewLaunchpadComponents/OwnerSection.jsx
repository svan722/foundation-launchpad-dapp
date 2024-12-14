import { airdrop, cancel, finalize, toggleWhitelisting } from "../../contract-hooks/launchpad";
import { toastError, toastSuccess } from "../../utils/toastWrapper";
import Button from "../common/Button";
import RadioButton from "../common/RadioButton";
import EditWhitelistModal from "./EditWhitelistModal";
import { useState } from "react";
import Loader from "../common/Loader";
import { contributorsDataLink } from "../../api-services/launchpadServices";
import FinalizeModal from "./FinalizeModal";
import { waitForTransaction } from "wagmi/actions";
import { retryOperation } from "../../utils/retryOperation";

const OwnerSection = ({
  launchpad,
  isFinalized,
  updateIsCancelled,
  updateIsFinalized,
  status,
  goalReached,
  updateHasAirdropped,
  hasAirdropped,
  isCancelled,
  totalRaised,
  whitelistEnabled,
  updateWhitelistEnabled,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [finalizeModal, setFinalizeModal] = useState(false);
  const [adding, setAdding] = useState(true);
  const [waitFinalize, setWaitFinalize] = useState(false);
  const [waitAirdrop, setWaitAirdrop] = useState(false);
  const [waitToggleWhitelisting, setWaitToggleWhitelisting] = useState(false);
  const [waitCancel, setWaitCancel] = useState(false);
  const [poolAddress, setPoolAddress] = useState("");

  const handleModalToggle = (adding) => {
    modalOpen ? setModalOpen(false) : setModalOpen(true);
    setAdding(adding);
  };

  const handleFinalizeModal = () => {
    finalizeModal ? setFinalizeModal(false) : setFinalizeModal(true);
  };

  const handleFinalize = async () => {
    try {
      setWaitFinalize(true);

      const { hash } = await finalize(
        launchpad.address,
        launchpad.dexListingRate,
        launchpad.tokenAddress,
        launchpad.tokenDecimals,
        launchpad.chainId
      );
      if (hash) {
        const receipt = await retryOperation(waitForTransaction, { hash, confirmations: 1 });

        // if (launchpad.autoDexListing && launchpad.goalReached) {
        //   if (launchpad.dexName.includes("v2")) {
        //     console.log("Pool Address", "0x" + receipt.events[1].data.slice(90)); // Needs to check
        //   } else {
        //     setPoolAddress(receipt.events[1].data.slice(90));
        //   }
        // }

        setWaitFinalize(false);
        updateIsFinalized();
        toastSuccess(`Launchpad Finalized Successfully`);
        setFinalizeModal(false);
      }
    } catch (error) {
      error.shortMessage && toastError(`${error.shortMessage}, Please Read Warnings Carefully`);

      setFinalizeModal(false);
      setWaitFinalize();
    }
  };

  const handleCancel = async () => {
    try {
      setWaitCancel(true);
      const { hash } = await cancel(launchpad.address);
      if (hash) {
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });
        updateIsCancelled();
        toastSuccess(`Launchpad has been Cancelled`);
        setWaitCancel(false);
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setWaitCancel(false);
    }
  };

  const handleAirdrop = async () => {
    try {
      setWaitAirdrop(true);
      const { hash } = await airdrop(launchpad.address);
      if (hash) {
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });
        updateHasAirdropped();
        toastSuccess(`Airdropped ${goalReached ? "Tokens" : "Refunds"} Successfully`);
        setWaitAirdrop(false);
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setWaitAirdrop(false);
    }
  };

  const handletoggleWhitelisting = async () => {
    try {
      setWaitToggleWhitelisting(true);
      const { hash } = await toggleWhitelisting(launchpad.address);
      if (hash) {
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });
        toastSuccess(`Launchpad is now ${whitelistEnabled ? "Public" : "Whitelisted"}`); // whitelistEnabled holds prev value
        updateWhitelistEnabled();
        setWaitToggleWhitelisting(false);
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setWaitToggleWhitelisting(false);
    }
  };

  const renderFinalizeBtn = () => {
    let disableBtn = true;

    if (status === "ended" && !isCancelled && !isFinalized) {
      disableBtn = false;
    }

    return (
      <Button
        className={"btn btnYellow my-2 w-Btn"}
        onClick={handleFinalizeModal}
        btnLabel={isFinalized ? "Finalized" : "Finalize"}
        disableBtn={disableBtn}
      />
    );
  };

  const renderCancelBtn = () => {
    let disableBtn = true;

    if (!isCancelled && !isFinalized) {
      disableBtn = false;
    }

    return (
      <Button
        loading={waitCancel}
        className={"btn offButton my-2 w-Btn"}
        onClick={handleCancel}
        btnLabel={isCancelled ? "Launchpad Cancelled" : "Cancel Launchpad"}
        disableBtn={disableBtn || waitCancel}
      />
    );
  };

  const renderAirdropBtn = () => {
    let additionalInfo = "";
    let btnLabel;
    let disableBtn = true;
    let hideBtn = true;

    if ((isFinalized && totalRaised) || (isCancelled && totalRaised)) {
      hideBtn = false;
      if (!hasAirdropped) {
        disableBtn = false;
        if (isFinalized && goalReached) {
          btnLabel = "Airdrop Tokens";
          additionalInfo = "Or let the user Claim Tokens from the launchpad dashboard";
        } else {
          btnLabel = "Airdrop Refund";
          additionalInfo = "Or let the user Claim Refund from the launchpad dashboard";
        }
      } else {
        btnLabel = isFinalized && goalReached ? "Airdropped Tokens" : "Airdropped Refund";
      }
    }

    return (
      <Button
        loading={waitAirdrop}
        className={"btn btnYellow w-Btn"}
        onClick={handleAirdrop}
        btnLabel={btnLabel}
        additionalInfo={additionalInfo}
        hideBtn={hideBtn}
        disableBtn={disableBtn || waitAirdrop}
      />
    );
  };

  const renderContributorsListBtn = () => {
    return totalRaised ? (
      <button className="btn btnYellowOutline w-Btn">
        <a href={contributorsDataLink(launchpad.address, launchpad.chainId)} target="_blank">
          Download Contributors List
        </a>
      </button>
    ) : null;
  };

  return (
    <div className="mb-4 mt-4 wdBOx">
      <div className="bg-yellow rotateText">
        <h6 className="mt-1">Owner Actions</h6>
      </div>
      {!isCancelled && status !== "ended" && (
        <div className="p-2">
          <label className="lbl" htmlFor="staticEmail2">
            Launchpad Type
          </label>
          <div className="">
            <RadioButton
              name={"launchpadType"}
              label={"Public"}
              checked={whitelistEnabled === false}
              onChange={handletoggleWhitelisting}
            />
            <RadioButton
              name={"launchpadType"}
              label={"Whitelisted"}
              checked={whitelistEnabled === true}
              onChange={handletoggleWhitelisting}
            />
            <Loader
              loading={waitToggleWhitelisting}
              cssOverride={{ display: "block", margin: "", borderColor: "fbd77a" }}
            />
          </div>
        </div>
      )}
      {!isCancelled && status !== "ended" && whitelistEnabled && (
        <div className="mx-2 d-flex align-items-center">
          Edit Whitelist:
          <button onClick={() => handleModalToggle(false)} className="btn btnYellowOutline m-2">
            Remove Addresses
          </button>
          <button onClick={() => handleModalToggle(true)} className="btn btnYellowOutline m-2">
            Add Addresses
          </button>
        </div>
      )}
      <div className="mt-4 mb-4 col-sm-12 text-center d-flex justify-content-center flex-column align-items-center">
        {renderFinalizeBtn()}
        {renderAirdropBtn()}
        {renderCancelBtn()}
        {renderContributorsListBtn()}
      </div>
      <EditWhitelistModal
        launchpad={launchpad}
        modalOpen={modalOpen}
        handleModalClose={handleModalToggle}
        adding={adding}
      />
      <FinalizeModal
        launchpad={launchpad}
        modalOpen={finalizeModal}
        handleModalClose={handleFinalizeModal}
        waitFinalize={waitFinalize}
        handleFinalize={handleFinalize}
        goalReached={goalReached}
        poolAddress={poolAddress}
      />
    </div>
  );
};

export default OwnerSection;
