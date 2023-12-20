import axios from "axios";
import "../fileBrowser.css";
import { motion as m } from "framer-motion";
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

function DirectoryManager(props: Props) {
  //Function: handleDeleteDirectory(directoryToDelete: string)
  //Purpose: Sends a POST request to the server asking to delete the directory @path which is provided in the body of the request.
  //Uses: Whenever a directory needs to be deleted.
  const handleDeleteDirectory = async (directory: string) => {
    await axios
      .post("http://192.168.1.20:3001/directory/delete/", {
        path: directory,
      })
      .then((res) => {
        const { status, alert } = res.data;
        switch (status) {
          case 200: {
            props.setAlert({
              status: 200,
              message: alert,
              decayTime: 10000,
              visible: true,
              color: Colors.Success,
            });
            break;
          }
          case 400: {
            return props.setAlert({
              status: 400,
              message: alert,
              decayTime: 10000,
              visible: true,
              color: Colors.Error,
            });
          }
        }
        props.RefreshFileBrowser();
      });
  };

  //Function: NavigateToDirectory(desiredPath: string)
  //Purpose: Sends a POST request to the server asking for info on the contents of our desiredPath
  //Uses: Whenever you need to ask the server about the contents of a directory and to display them clientside
  const NavigateToDirectory = (directoryPath: string) => {
    if (props.currentDirectory === directoryPath) return;
    axios
      .post("http://192.168.1.20:3001/directory/navigate", {
        path: directoryPath,
      })
      .then((res) => {
        const { status, condition, alert } = res.data;

        if (status === 400 && condition === "NO_DIR") {
          return props.setAlert({
            status: 400,
            message: condition + " : " + alert,
            decayTime: 10000,
            visible: true,
            color: Colors.Error,
          });
        }

        props.RefreshFileBrowser(directoryPath);

        //after we've navigated and the server has responded with our filepath contents,
        //assign the state of our current and previous directory so we always know where we are
        props.setPreviousDirectory(props.currentDirectory);
        props.setCurrentDirectory(directoryPath);
      });
  };

  return (
    <>
      <div className="directoryNav">
        <div>
          <img
            src="/img/open-folder.png"
            style={{ display: "block", margin: "0 auto", maxWidth: "32px" }}
          />{" "}
          <h3 style={{ textAlign: "center" }}>{props.currentDirectory}</h3>
          <button
            onClick={() => {
              if (props.previousDirectory !== "")
                NavigateToDirectory(props.previousDirectory);
            }}
          >
            <img src="/img/back.png" alt="" />
          </button>
          <button onClick={() => NavigateToDirectory("root")}>
            <img src="/img/home.png" alt="" />
          </button>
        </div>
      </div>
      <ul className="directoryList">
        {props.directoryList
          ? props.directoryList.map((item: fileObject, index: any) => (
              <m.div
                onClick={(e) => e.stopPropagation()}
                variants={dropIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                key={"directory" + index}
              >
                <li>
                  <div
                    onClick={() => {
                      //when we click the directory, we want to open that directory
                      NavigateToDirectory(item.path);
                    }}
                  >
                    <img src="/img/open-folder.png" />
                    <h3>{item.name}</h3>
                  </div>

                  <button
                    onClick={() => handleDeleteDirectory(item.path)}
                    style={{ boxShadow: "none" }}
                  >
                    X
                  </button>
                </li>
              </m.div>
            ))
          : null}
      </ul>
    </>
  );
}

export default DirectoryManager;
