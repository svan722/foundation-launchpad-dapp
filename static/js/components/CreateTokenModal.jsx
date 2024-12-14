import { useEffect, useState } from "react";
import Modal from "./common/Modal";
import Input from "./common/input";
import { boolean, date, number, object, string } from "yup"; // Import Yup for validation
import { validate, validateProperty } from "../utils/formValidation";
import { createToken, getTokenCreationFee } from "../contract-hooks/tokenFactory";
import { toastError, toastSuccess } from "../utils/toastWrapper";
import Button from "./common/Button";
import { waitForTransaction } from "wagmi/actions";
import { retryOperation } from "../utils/retryOperation";

const CreateTokenModal = ({
  handleModalClose,
  modalOpen,
  setCreatedToken,
  tokenFactoryAddress,
  tokenCreationFee,
  nativeCurrency,
}) => {
  const [token, setToken] = useState({});
  const [errors, setErrors] = useState({});
  const [waitCreateToken, setWaitCreateToken] = useState(false);

  let createTokenSchema = object({
    name: string().required(),
    symbol: string().required(),
    decimals: number().typeError("${path} is required").required().positive(),
    totalSupply: number().typeError("${path} is required").required().positive(),
  });

  const handleCreateToken = async () => {
    try {
      const errors = await validate(token, createTokenSchema);
      setErrors(errors || {});
      if (errors) return;

      setWaitCreateToken(true);
      const { hash } = await createToken(tokenFactoryAddress, token, tokenCreationFee);

      if (hash) {
        const receipt = await retryOperation(waitForTransaction, { hash, confirmations: 1 });
        setCreatedToken(receipt.logs[0].address);

        toastSuccess("Created a standard ERC20 Token");
        handleModalClose();
        setToken({});

        setWaitCreateToken(false);
      }
    } catch (error) {
      error.shortMessage && toastError(error.shortMessage);
      setWaitCreateToken(false);
    }
  };

  const handleChange = async (e) => {
    const { currentTarget: input } = e;
    let tokenDetails = { ...token };

    let inputValue = input.value;

    const tErrors = errors;
    const error = await validateProperty(input, createTokenSchema);
    tErrors[input.name] = error;
    setErrors(tErrors);

    tokenDetails[input.name] = inputValue;
    setToken(tokenDetails);
  };

  const modalBody = () => {
    return (
      <>
        <div className="mb-2">
          <small>(*) is required field</small>
        </div>
        {[
          { label: `Name*`, name: "name", placeholder: "Shiba Inu", autoFocus: true },
          { label: `Symbol*`, name: "symbol", placeholder: "SHIB" },
          { label: `Decimals*`, name: "decimals", placeholder: "18", type: "number" },
          { label: `Total Supply*`, name: "totalSupply", placeholder: "1000000", type: "number" },
        ].map(({ label, name, placeholder, type, autoFocus }) => (
          <Input
            name={name}
            type={type}
            label={label}
            placeholder={placeholder}
            value={token[name]}
            onChange={handleChange}
            autoFocus={autoFocus}
            error={errors[name]}
            additionalInfo=""
            disabled=""
          />
        ))}
        <div className="mt-2">
          <small>
            Token Creation Fee: {tokenCreationFee} {nativeCurrency}
          </small>
        </div>
        <Button
          disableBtn={waitCreateToken}
          btnLabel={waitCreateToken ? "Creating Token" : "Create Token"}
          className={"btn btnYellow mt-3"}
          onClick={handleCreateToken}
          loading={waitCreateToken}
        />
      </>
    );
  };

  return (
    <Modal
      modalBody={modalBody()}
      modalTitle={"Create a Token"}
      handleModalClose={handleModalClose}
      modalOpen={modalOpen}
    />
  );
};

export default CreateTokenModal;
