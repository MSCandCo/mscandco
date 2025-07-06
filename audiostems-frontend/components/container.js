import classNames from "classnames";
import React from "react";

function Container({ children, className, fluid }) {
  return (
    <div
      className={classNames(
        "px-3 md:px-4 lg:px-6 m-auto",
        fluid ? "max-w-full" : "max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Container;
