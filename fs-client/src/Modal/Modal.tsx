import { motion as m } from "framer-motion";
import Backdrop from "./Backdrop";
import "./modal.css";
import { ReactNode } from "react";

interface Props {
  handleClose: any;
  title: string;
  para1: string;
  para2: string;
  para3: string;
  modalOpen: any;
  children: ReactNode;
}

const dropIn = {
  hidden: {
    y: "-100vh",
    opacity: 0,
  },
  visible: {
    y: "0",
    opacity: 1,
    transition: {
      duration: 0.1,
      type: "spring",
      damping: 25,
      stiffness: 500,
    },
  },
  exit: {
    y: "100vh",
    opacity: 0,
  },
};

const Modal = ({
  handleClose,
  title,
  para1,
  para2,
  para3,
  children,
}: Props) => {
  return (
    <Backdrop onClick={handleClose}>
      <m.div
        onClick={(e) => e.stopPropagation()}
        className="modal"
        variants={dropIn}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <h1>{title}</h1>
        <p>{para1}</p>
        <p>{para2}</p>
        <p>{para3}</p>
        <button onClick={handleClose}>X</button>
        {children}
      </m.div>
    </Backdrop>
  );
};

export default Modal;
