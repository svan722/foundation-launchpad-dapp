import ClipLoader from "react-spinners/ClipLoader";

const Button = ({
  style,
  onClick,
  btnLabel,
  additionalInfo,
  hideBtn,
  disableBtn,
  className,
  loading,
}) => {
  return (
    !hideBtn && (
      <>
        <button
          style={style}
          role="button"
          disabled={disableBtn}
          className={className}
          onClick={onClick}
        >
          {btnLabel}
          <ClipLoader
            color="#fff"
            loading={loading || false}
            cssOverride={{
              margin: "auto 5px",
              borderColor: "fbd77a",
            }}
            size={18}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </button>
        {additionalInfo && (
          <div className="mb-4">
            <small>{additionalInfo}</small>
          </div>
        )}
      </>
    )
  );
};

export default Button;
