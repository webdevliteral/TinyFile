import { motion as m } from "framer-motion";
import React, { MouseEventHandler, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  onClick?: MouseEventHandler;
}

const Backdrop = ({ children, onClick }: Props) => {
  return (
    <m.div
      className="backdrop"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </m.div>
  );
};

export default Backdrop;
