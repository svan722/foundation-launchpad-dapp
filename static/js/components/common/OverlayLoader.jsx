import ClipLoader from "react-spinners/ClipLoader";

const OverlayLoader = ({ cssOverride, size, color, loading }) => {
  return (
    loading && (
      <div
        className="modal fade SmartchainPopUp bg-black show"
        style={{ display: "block", backgroundColor: "rgba(33, 37, 41, 0.8)" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <ClipLoader
            color={color || "#fbd77a"}
            loading={loading || false}
            cssOverride={
              cssOverride || {
                display: "block",
                margin: "0 auto",
                borderColor: "fbd77a",
              }
            }
            size={size || 18}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </div>
    )
  );
};

export default OverlayLoader;

{
  /* <div className="modal-content">
  <div className="modal-header">
    <h5 className="modal-title" id="exampleModalToggleLabel">
      {modalTitle}
    </h5>
    <button type="button" onClick={handleModalClose} className="btn-close"></button>
  </div>
  <div className="modal-body">
    <div className="ant-modal-body">{modalBody}</div>
  </div>
</div>; */
}
