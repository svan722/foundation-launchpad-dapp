const Modal = ({ handleModalClose, modalOpen, modalTitle, modalBody }) => {
  return (
    modalOpen && (
      <div
        className="modal fade SmartchainPopUp bg-black show"
        style={{ display: "block", backgroundColor: "rgba(33, 37, 41, 0.8)" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalToggleLabel">
                {modalTitle}
              </h5>
              <button type="button" onClick={handleModalClose} className="btn-close"></button>
            </div>
            <div className="modal-body">
              <div className="ant-modal-body">{modalBody}</div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
