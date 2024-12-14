import React, { Component } from "react";

const RadioButton = ({ name, checked, onChange, value, label, id }) => {
  return (
    <>
      <div className="form-check">
        <label className="form-check-label" htmlFor={id}>
          <input
            className="form-check-input"
            type="radio"
            name={name}
            id={id}
            onChange={onChange}
            value={value}
            checked={checked}
          />
          {label}
        </label>
      </div>
    </>
  );
};

export default RadioButton;
