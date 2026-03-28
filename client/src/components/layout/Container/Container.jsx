import React from "react";
import PropTypes from "prop-types";
import "./container.css";

const Container = ({ children, className = "", fluid = false }) => {
  return (
    <div className={`container ${fluid ? "fluid" : ""} ${className}`}>
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fluid: PropTypes.bool, // Full-width when true
};

export default Container;
