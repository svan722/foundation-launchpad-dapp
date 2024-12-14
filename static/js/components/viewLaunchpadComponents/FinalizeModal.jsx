import { useState } from "react";
import supportedChains from "../../config/supportedChains.json";
import Modal from "../common/Modal";
import { updateWhitelist } from "../../contract-hooks/launchpad";
import { toastError, toastSuccess } from "../../utils/toastWrapper";
import Button from "../common/Button";
import { truncateStr } from "../../utils/truncate";
import CopyToClipboard from "react-copy-to-clipboard";

const FinalizeModal = ({
  waitFinalize,
  handleModalClose,
  handleFinalize,
  modalOpen,
  launchpad,
  goalReached,
  poolAddress,
}) => {
  const renderContent = () => {
    if (goalReached) {
      return (
        <ul>
          <li>Users will be able to claim their tokens</li>
          {launchpad.autoDexListing ? (
            <li>Your Token will be listed on {launchpad.dexName}</li>
          ) : null}
          <li>
            Unsold Tokens will be {launchpad.refundUnsoldTokens ? "refunded to you" : "burned"}
          </li>
          <li>You will get the amount raised from this Launchpad</li>
        </ul>
      );
    } else {
      return (
        <ul>
          <li>You will get back all your tokens - as the launchpad has failed</li>
        </ul>
      );
    }
  };

  const modalBody = () => {
    return (
      <div className="col-12 mb-3">
        {renderContent()}
        {<div style={{ color: "red" }}>{}</div>}

        {launchpad.autoDexListing && goalReached && (
          <div className="d-flex lblE">
            <p>
              Please Exclude Dexlister address{" "}
              <bold className="colorYellow">
                {truncateStr(supportedChains[launchpad.chainId].dexListerAddress, 21)}
              </bold>{" "}
              <CopyToClipboard text={supportedChains[launchpad.chainId].dexListerAddress}>
                <img
                  style={{ cursor: "pointer", marginTop: "-2px", marginRight: "10px" }}
                  src="/images/copy.svg"
                  alt=""
                />
              </CopyToClipboard>
              from tx fees, rewards, max tx amount to Finalize & Listing on {launchpad.dexName}
            </p>
          </div>
        )}

        <Button
          loading={waitFinalize}
          onClick={handleFinalize}
          className="btn btnYellow mt-2"
          btnLabel={"Finalize Launchpad"}
          disableBtn={waitFinalize}
        />
      </div>
    );
  };

  return (
    <Modal
      handleModalClose={handleModalClose}
      modalOpen={modalOpen}
      modalTitle={"Finalizing Launchpad"}
      modalBody={modalBody()}
    />
  );
};

export default FinalizeModal;
