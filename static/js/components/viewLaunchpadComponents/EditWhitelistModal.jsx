import { useEffect, useRef, useState } from "react";
import Modal from "../common/Modal";
import { updateWhitelist } from "../../contract-hooks/launchpad";
import { retryOperation } from "../../utils/retryOperation";
import { toastError, toastSuccess } from "../../utils/toastWrapper";
import Button from "../common/Button";
import { waitForTransaction } from "wagmi/actions";

const EditWhitelistModal = ({ handleModalClose, modalOpen, adding, launchpad }) => {
  const [whitelistInput, setWhitelistInput] = useState("");
  const [waitEditWhitelist, setWaitEditWhitelist] = useState("");
  const [cursor, setCursor] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const input = ref.current;
    if (input) input.setSelectionRange(cursor, cursor);
  }, [ref, cursor, whitelistInput]);

  const handleChange = (e) => {
    setCursor(e.target.selectionStart);
    setWhitelistInput(e.target.value);
  };

  const handleEditWhitelist = async () => {
    try {
      const addresses = whitelistInput.split(","); // Split by commas to get an array of addresses

      const validatedAddresses = [];

      const addressPattern = /^(0x)?[0-9a-fA-F]{40}$/;

      addresses.forEach((address) => {
        const trimmedAddress = address.trim();

        if (addressPattern.test(trimmedAddress)) {
          validatedAddresses.push(trimmedAddress);
        }

        if (!validatedAddresses.length) {
          return toastError("0 valid addresses");
        }
      });

      setWaitEditWhitelist(true);
      const { hash } = await updateWhitelist(launchpad.address, adding, validatedAddresses);

      if (hash) {
        toastSuccess(
          `${adding ? "Adding" : "Removing"} ${validatedAddresses.length} valid Addresses`
        );
        await retryOperation(waitForTransaction, { hash, confirmations: 1 });
        handleModalClose();
        toastSuccess(
          `Successfully ${adding ? "Added" : "Removed"} ${
            validatedAddresses.length
          } valid Addresses`
        );
        setWaitEditWhitelist(false);
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setWaitEditWhitelist(false);
    }
  };

  const modalBody = () => {
    return (
      <div className="col-12 mb-3">
        <label htmlFor="staticEmail2" className="lbl">
          Addresses* (separated by commas)
        </label>
        <textarea
          rows={10}
          type="text"
          className="form-control"
          id="staticEmail2"
          onChange={handleChange}
          value={whitelistInput}
          name="whitelistInput"
          placeholder="0x21f ... 781, 0xbc1 ... 92a"
          ref={ref}
        ></textarea>
        {<div style={{ color: "red" }}>{}</div>}
        <Button
          disableBtn={waitEditWhitelist}
          loading={waitEditWhitelist}
          onClick={handleEditWhitelist}
          className="btn btnYellowOutline mt-2"
          btnLabel={adding ? "Add" : "Remove"}
        />
      </div>
    );
  };

  return (
    <Modal
      handleModalClose={handleModalClose}
      modalOpen={modalOpen}
      modalTitle={adding ? "Adding to Whitelist" : "Removing from Whitelist"}
      modalBody={modalBody()}
    />
  );
};

export default EditWhitelistModal;
