import ConnectWalletBtn from "./headerComponents/ConnectWalletBtn";
import { Link, useNavigate } from "react-router-dom";
import NetworkSwitchingModal from "./headerComponents/NetworkSwitchingModal";
import { useEffect, useState } from "react";
import supportedChains from "../config/supportedChains.json";
import { useAccount, useNetwork } from "wagmi";

const Header = () => {
  const [supported, setSupported] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const { chain } = useNetwork();
  const { isConnected } = useAccount();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) return;

    if (supportedChains[chain.id]) {
      const supported = supportedChains[chain.id];
      setSupported(supported);
    } else {
      setSupported();
    }
  }, [chain, isConnected]);

  const handleModalToggle = () => {
    modalOpen ? setModalOpen(false) : setModalOpen(true);
  };

  return (
    <nav className="navbar bg-black px-md-5 px-3 topSticky">
      <div className="container-fluid px-0">
        <a style={{ cursor: "pointer" }} className="navbar-brand" onClick={() => navigate("/")}>
          <img src="/images/logo.png" className="deskTopOnly" />
          <img src="/images/logo_icon.png" className="mobileOnly" />
        </a>
        <Link to="/" style={{ margin: "0 auto" }} className="hideOnMobile nav__links">
          <a className="">View Launchpads</a>
        </Link>

        <div className="d-flex align-items-center">
          {isConnected && (
            <button
              onClick={handleModalToggle}
              className="btn btnYellowOutline mx-2 d-md-block d-none"
              role="button"
            >
              {supported?.name || "Switch to Supported Chain"}
            </button>
          )}
          {supported && (
            <button
              onClick={handleModalToggle}
              className="btn btnYellowOutline icon_btn mx-2 d-md-block "
              type="submit"
            >
              <img className="chain-logo--small" src={supported.logoUrl} />
            </button>
          )}
          <ConnectWalletBtn />
          <NetworkSwitchingModal modalOpen={modalOpen} handleModalClose={handleModalToggle} />
        </div>
      </div>
      <Link to="/" style={{ margin: "0 auto" }} className="hideOnDesk">
        <button className="btn btnYellowOutline">View Launchpads</button>
      </Link>
    </nav>
  );
};

export default Header;
