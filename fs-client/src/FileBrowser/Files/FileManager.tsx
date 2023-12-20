import axios from "axios";
import "../fileBrowser.css";
import { AnimatePresence, motion as m } from "framer-motion";
import { useState } from "react";
import Modal from "../../Modal/Modal";
import { Colors } from "../../Alerts/BasicAlert";

//use an interface to define what props (state) we're expecting to be passed to the tools menu
interface Props {
  GetFileList: Function;
  GetDirectoryList: Function;
  fileList: any;
  directoryList: any;
  setFileList: any;
  setDirectoryList: any;
  currentDirectory: string;
  setCurrentDirectory: Function;
  previousDirectory: string;
  setPreviousDirectory: Function;
  RefreshFileBrowser: Function;
  setAlert: Function;
}

//using interface like a rust trait here since we don't have the complex behaviors of a type and these are the basis of what we need, but we could have more
//we will always expect, at the very least, a file name, size, extension, and the path to the file.
interface fileObject {
  name: string;
  size: any;
  extension: string;
  path: string;
}

//Framer animation config
//NOTE: there are a lot of options and possibilities for animations.
//      If you want to look into more, look up Framer Motion animation variants.
const fadeX = {
  hidden: {
    x: "-10vw",
    opacity: 0,
  },
  visible: {
    x: "0",
    opacity: 1,
    transition: {
      duration: 2.0,
      type: "spring",
      damping: 25,
      stiffness: 500,
    },
  },
  exit: {
    x: "10vw",
    opacity: 0,
  },
};

function FileManager(props: Props) {
  const [oldFilename, setOldFilename] = useState("");
  const [newFilename, setNewFilename] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = () => setModalOpen(false);
  const openModal = () => setModalOpen(true);

  //Function: handleDeleteFile(fileToDelete: string)
  //Purpose: Sends a POST request to the server asking to delete the file
  //         @path which is provided in the body of the request, along with the filename to delete.
  //Uses: Whenever a file needs to be deleted.
  const handleDeleteFile = async (filename: string) => {
    await axios
      .post("http://192.168.1.20:3001/file/delete/", {
        path: props.currentDirectory,
        filename: filename,
      })
      .then((res) => {
        const { status } = res.data;
        console.log(status);
        //if no 200 status, send alert that we need to try again
        if (status !== 200) {
          return props.setAlert({
            status: 500,
            message: "Could not delete file. Please try again.",
            decayTime: 10000,
            visible: true,
            color: Colors.Error,
          });
        }

        //status was 200, we deleted the file succesfully
        //send an alert that we were successful
        props.setAlert({
          status: 200,
          message: "File successfully deleted.",
          decayTime: 10000,
          visible: true,
          color: Colors.Success,
        });

        //refresh the file browser to reflect changes
        props.RefreshFileBrowser();
      });
  };

  //Function: handleDownload(fileToDownload: string)
  //Purpose: Sends a POST request to the server asking to download the file
  //         @path which is provided in the body of the request, along with
  //         the filename we are looking to download.
  //Uses: Whenever a file needs to be downloaded.
  const handleDownload = async (filename: string) => {
    await axios
      .post(
        "http://192.168.1.20:3001/file/download/",
        {
          path: props.currentDirectory,
          filename: filename,
        },
        //define the responseType we're expecting for axios so that we receive our bytearray properly in the response
        { responseType: "blob" }
      )
      .then((res) => {
        //using createObjectURL() on the blob sent from the server,
        //we'll create a local url to access the file from
        //kinda hacky
        let url = window.URL.createObjectURL(res.data);
        let a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  };

  //Function: FormatFileSize(sizeInBytes: number)
  //Purpose: Format the size of our files into something readable instead of raw byte value
  //Uses: Whenever a file size needs to be converted from bytes to a prettier, more readable number.
  const FormatFileSize = (sizeInBytes: number): string => {
    let sizeToString: string;
    let size = sizeInBytes / 1024;
    sizeToString = Math.trunc(size) + " Kb";
    //if the size is greated than 999 kb, we move to mb
    if (size > 999) {
      size = size / 1024;
      sizeToString = Math.trunc(size) + " Mb";
    }
    return sizeToString;
  };

  //Function: handleEditFilename()
  //Purpose: Sends a POST request to the server, asking to update a file's name
  //Uses: Whenever a file needs to be renamed
  const handleEditFilename = async () => {
    await axios
      .post("http://192.168.1.20:3001/file/edit/", {
        filepath: props.currentDirectory,
        oldName: oldFilename,
        newName: newFilename,
      })
      .then((res) => {
        if (res.data.status === 400) {
          return props.setAlert({
            status: res.data.status,
            message: res.data.alert,
            decayTime: 10000,
            visible: true,
            color: Colors.Error,
          });
        }
        if (res.data.status === 200) {
          props.RefreshFileBrowser();
          return props.setAlert({
            status: res.data.status,
            message: res.data.alert,
            decayTime: 10000,
            visible: true,
            color: Colors.Success,
          });
        }
      })
      .finally(() => {
        closeModal();
      });
  };

  return (
    <>
      <AnimatePresence initial={false} mode="wait" onExitComplete={() => null}>
        {modalOpen && (
          <Modal
            modalOpen={modalOpen}
            handleClose={closeModal}
            title="Edit Filename"
            para1=""
            para2=""
            para3=""
            children={
              <div style={{ width: "100%", margin: "15px auto" }}>
                <p>Please enter a new name for your file:</p>
                <input
                  type="text"
                  onChange={(e) => setNewFilename(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    display: "block",
                    padding: "5px",
                    margin: "5px auto",
                  }}
                />
                <input
                  type="submit"
                  value="Done"
                  className="button"
                  onClick={handleEditFilename}
                  style={{
                    padding: "5px",
                    width: "100%",
                    textAlign: "center",
                  }}
                />
              </div>
            }
          ></Modal>
        )}
      </AnimatePresence>
      <ul className="fileList">
        {props.fileList ? (
          props.fileList.map((item: fileObject, index: any) => (
            <m.div
              onClick={(e) => e.stopPropagation()}
              variants={fadeX}
              initial="hidden"
              animate="visible"
              exit="exit"
              key={index}
            >
              <li>
                <div>
                  <h3>Filename: {item.name}</h3>
                  <button
                    style={{
                      padding: "4px",
                      maxHeight: "30px",
                      width: "90%",
                      position: "absolute",
                      top: 4,
                      left: 20,
                      margin: "0 auto",
                      borderBottomLeftRadius: "10px",
                      borderBottomRightRadius: "10px",
                    }}
                    onClick={() => {
                      setOldFilename(item.name);
                      openModal();
                    }}
                  >
                    Edit
                  </button>
                </div>

                <p>Filetype: {item.extension}</p>
                <p>Size: {FormatFileSize(item.size)}</p>
                <button onClick={() => handleDeleteFile(item.name)}>
                  Delete File
                </button>
                <button onClick={() => handleDownload(item.name)}>
                  Download File
                </button>
              </li>
            </m.div>
          ))
        ) : (
          <div className="loader">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}
      </ul>
    </>
  );
}

export default FileManager;
