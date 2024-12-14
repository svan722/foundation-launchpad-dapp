import supportedChains from "../../config/supportedChains.json";
import { networkSwitcher } from "../../utils/networkSwitcher";
import Modal from "../common/Modal";
import { toastError } from "../../utils/toastWrapper";
import { switchNetwork } from "wagmi/actions";

const NetworkSwitchingModal = ({ handleModalClose, modalOpen }) => {
  const handleNetworkSwitch = async (chainId) => {
    try {
      await switchNetwork({ chainId: parseInt(chainId) });
      handleModalClose();
    } catch (error) {
      handleModalClose();
      error.shortMessage && toastError(error.shortMessage);
    }
  };

  // Needs to add network

  const modalBody = () => {
    return (
      <>
        <div className="SwitchNetworkForm_chains__1fTaE">
          {Object.keys(supportedChains).map((chainId, index) => {
            return (
              <div
                key={index}
                onClick={async () => await handleNetworkSwitch(chainId)}
                className="SwitchNetworkItem_item__1gmeN"
              >
                <img
                  src={supportedChains[chainId].logoUrl}
                  alt={supportedChains[chainId].name}
                  className="SwitchNetworkItem_icon__1Lbfx"
                />
                <div className="SwitchNetworkItem_name__2pWLA">{supportedChains[chainId].name}</div>
              </div>
            );
          })}
        </div>
        {/* Changes on production - link and Test */}
        <a target="_blank" href="https://testnetlaunchpad.foundationtoken.io/">
          <div className="SwitchNetworkItem_item__1gmeN SwitchNetworkItem_item__1gmeN--full">
            <img src={"/images/website2.svg"} className="SwitchNetworkItem_icon__1Lbfx" />
            <div className="SwitchNetworkItem_name__2pWLA">Go to Testnet Website</div>
          </div>
        </a>
      </>
    );
  };

  return (
    <Modal
      modalBody={modalBody()}
      modalTitle={"Choose Network"}
      handleModalClose={handleModalClose}
      modalOpen={modalOpen}
    />
  );
};

export default NetworkSwitchingModal;
