import { useEffect, useState } from "react";
import "./BasicAlert.css";

interface Props {
  alert: BasicAlert | undefined;
  setAlert: Function;
}

interface BasicAlert {
  status: number;
  message: string;
  decayTime: number;
  visible: boolean;
  color: Colors;
}

export const enum Colors {
  Success = "#42f58d",
  Warning = "#f5d742",
  Error = "#f54242",
}

const BasicAlert = (props: Props) => {
  useEffect(() => {
    setTimeout(() => {
      if (props.alert !== undefined) {
        props.alert.visible = false;
        props.setAlert(undefined);
      }
    }, props.alert?.decayTime);
  }, [props.alert?.decayTime]);

  return (
    <>
      {props.alert?.visible ? (
        <div
          className="basic-alert"
          style={{ borderBottom: `3px solid ${props.alert.color}` }}
        >
          {props.alert.message}
        </div>
      ) : null}
    </>
  );
};

export default BasicAlert;
