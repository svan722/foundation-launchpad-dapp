import React from "react";

const Select = ({ additionalInfo, name, label, options, error, onChange, value }) => {
  return (
    <>
      <label className="lbl" htmlFor={name}>
        {label}
      </label>
      <select className="form-control" onChange={onChange} value={value} name={name} id={name}>
        {options &&
          options.map((option, index) => {
            return (
              <option key={index} value={option}>
                {option}
              </option>
            );
          })}
      </select>
      {error && (
        <div className="" style={{ color: "red" }}>
          {error}
        </div>
      )}
      {additionalInfo && <small>{additionalInfo}</small>}
    </>
  );
};

export default Select;
