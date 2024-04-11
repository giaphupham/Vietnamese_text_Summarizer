import React from "react";
const Input = ({
  inputTheme = "",
  labelText,
  labelTheme = "",
  containerTheme = "",
  textColor = "",
  readonly,
  type = "text",
  ...rest
}) => {
  return (
    <div className={`flex flex-col ${containerTheme} text-${textColor}`}>
      {labelText && (
        <label
          className={`font-normal text-xl font-button mb-2 text-black ${labelTheme}`}
        >
          {labelText}
        </label>
      )}
      {readonly ? (
        <input
          {...rest}
          className={`border rounded-xl min-h-10 ${inputTheme} pl-4`}
          readOnly
        />
      ) : (
        <input
          {...rest}
          className={`border rounded-xl min-h-10 ${inputTheme} pl-4`}
          type={type}
        />
      )}
    </div>
  );
};

export default Input;