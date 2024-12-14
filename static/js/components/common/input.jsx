import React, { Component, useEffect, useRef, useState } from "react";

const Input = ({
  type,
  name,
  label,
  placeholder,
  value,
  onChange,
  autoFocus,
  error,
  additionalInfo,
  disabled,
}) => {
  const [cursor, setCursor] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (type === "number") return;

    const input = ref.current;
    if (input) input.setSelectionRange(cursor, cursor);
  }, [ref, cursor, value]);

  const handleChange = (e) => {
    if (type === "number") return onChange && onChange(e);

    setCursor(e.target.selectionStart);
    onChange && onChange(e);
  };

  return (
    <>
      <label className="lbl" htmlFor={name}>
        {label}
      </label>
      <input
        disabled={disabled}
        type={type || "text"}
        name={name}
        placeholder={placeholder || ""}
        id={name}
        className="form-control"
        value={value}
        onChange={handleChange}
        autoFocus={autoFocus}
        ref={ref}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
      {additionalInfo && <small>{additionalInfo}</small>}
    </>
  );
};

export default Input;
