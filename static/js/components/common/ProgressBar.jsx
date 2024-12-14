import React from "react";

const ProgressBar = ({ percent, currentValue, endValue }) => {
  const barStyle = {
    width: `${percent}%`,
  };

  return (
    <>
      <div className="progress mb-2">
        <div className="progress-bar" style={barStyle}></div>
      </div>
      <div className="progress-container">
        <span className="progress-left">{currentValue}</span>
        <span className="progress-right">{endValue}</span>
      </div>
    </>
  );
};

export default ProgressBar;
