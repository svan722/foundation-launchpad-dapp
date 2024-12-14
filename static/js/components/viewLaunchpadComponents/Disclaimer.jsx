import { useState } from "react";

const Disclaimer = () => {
  const [open, setOpen] = useState(true);

  return (
    open && (
      <div className="bg-offBlack px-4 py-3 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <p className="fontBase">Disclaimer</p>
          <a style={{ cursor: " pointer" }} onClick={() => setOpen(false)}>
            <img src="/images/close.svg" />
          </a>
        </div>
        <p>
          This Luanchpad is a decentralized software tool. Anyone can create a Token Launchpad using
          custom tokens! Please take some time to research the project, if you are new to Foundation
          ask for help before you contribute or you may lose your funds! By using this Launchpad
          services you agree to our terms of service.
          {/* Needs to be added */}
          {/* <a href="#" className="colorYellow">
            {" "}
            Terms and Conditions
          </a> */}
        </p>
      </div>
    )
  );
};

export default Disclaimer;
