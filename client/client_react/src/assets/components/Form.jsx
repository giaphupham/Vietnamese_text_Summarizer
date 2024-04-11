import React from "react";

const Form = ({ formClass, children, ...rest }) => {
  return (
    <form
      {...rest}
      className={`border rounded-xl  ${formClass}`}
    >
      <div className="pt-10 px-14 pb-10">
        {children}
      </div>
    </form>
  );
};

export default Form;