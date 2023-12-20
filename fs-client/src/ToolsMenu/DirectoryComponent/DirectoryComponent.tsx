import { AnimatePresence } from "framer-motion";
import Modal from "../../Modal/Modal";
import { useState } from "react";
import axios from "axios";
import BasicAlert, { Colors } from "../../Alerts/BasicAlert";

//use an interface to define what props (state) we're expecting to be passed to the tools menu
interface Props {
  GetDirectoryList: Function;
  setDirectoryList: any;
  currentDirectory: string;
  setAlert: Function;
}

function DirectoryComponent(props: Props) {
  //define state for our input to track what we've entered
  const [directoryName, setDirectoryName] = useState("");

  //define state for our modal which will serve us our form
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = () => setModalOpen(false);
  const openModal = () => setModalOpen(true);

  function isEmptyString(string: string) {
    return !string || string.trim() === "";
  }

  function IsValidDirectoryName(name: string) {
    if (isEmptyString(name)) return false;
    const illegal = ["<", ">", ":", '"', "/", "\\", "|", "?", "*"];

    for (let i = 0; i < name.length; i++) {
      for (let j = 0; j < illegal.length; j++) {
        if (name.charAt(i) === illegal[j]) {
          return false;
        }
      }
    }
    return true;
  }

  //Function: RequestNewDirectory()
  //Purpose: To pass the name defined in our directoryName state (set from the child form attached to our modal) to the server
  //Uses: To create a new directory on the server, assuming there doesn't already exist a directory at target location with desired name
  const RequestNewDirectory = () => {
    if (!IsValidDirectoryName(directoryName)) {
      return props.setAlert({
        status: 400,
        message: "Thats not a valid directory name!",
        decayTime: 10000,
        visible: true,
        color: Colors.Error,
      });
    }
    axios
      .post("http://192.168.1.20:3001/directory/new/" + directoryName, {
        path: props.currentDirectory,
      })
      .then((res) => {
        switch (res.data.status) {
          case 200: {
            props.setAlert({
              status: 200,
              message: res.data.alert,
              decayTime: 10000,
              visible: true,
              color: Colors.Success,
            });
            break;
          }
          case 400: {
            props.setAlert({
              status: 200,
              message: res.data.alert,
              decayTime: 10000,
              visible: true,
              color: Colors.Error,
            });
            break;
          }
        }
      })
      .finally(() => {
        closeModal();
        props
          .GetDirectoryList(props.currentDirectory)
          .then((data: any) => props.setDirectoryList(data));
      });
  };

  return (
    <>
      <div
        className="directory-management"
        style={{ height: "100%", padding: "1em" }}
      >
        <button
          onClick={openModal}
          style={{ display: "block", margin: "0 auto", padding: "10px" }}
        >
          New Directory
        </button>
      </div>

      <AnimatePresence initial={false} mode="wait" onExitComplete={() => null}>
        {modalOpen && (
          <Modal
            modalOpen={modalOpen}
            handleClose={closeModal}
            title="New Directory"
            para1="Please enter the name of your new directory."
            para2=""
            para3=""
            //children will except html to allow for customization of the modal. this form will collect info for our new directory request
            children={
              <div>
                <input
                  type="text"
                  name="directoryName"
                  onChange={(e) => setDirectoryName(e.target.value)}
                  style={{ width: "100%", padding: "3px", marginTop: "10px" }}
                />
                <input
                  type="submit"
                  value="Create"
                  onClick={() => RequestNewDirectory()}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "5px",
                    marginTop: "5px",
                    backgroundColor: "#349beb",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                />
              </div>
            }
          ></Modal>
        )}
      </AnimatePresence>
    </>
  );
}

export default DirectoryComponent;
