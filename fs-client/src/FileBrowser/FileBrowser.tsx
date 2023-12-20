import "./fileBrowser.css";
import { useEffect, useState } from "react";

import DirectoryManager from "./Directory/DirectoryManager";
import FileManager from "./Files/FileManager";

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
  setAlert: Function;
}

function FileBrowser(props: Props) {
  //define state for our loader so we can enable/disable based on api responses or lack thereof
  const [loading, setLoading] = useState(false);

  //retrieve list of files on component render
  useEffect(() => {
    RefreshFileBrowser();
  }, []);

  //Function: RefreshFileBrowser()
  //Purpose: To ask the server fo the contents of the current working directory and update the file browser with those files
  //Uses: Whenever an operation is executed on the server and you need to reflect that on the client, or if you simply need to refresh the client data.
  const RefreshFileBrowser = (directory: string = props.currentDirectory) => {
    props
      .GetDirectoryList(directory, () => {
        //set state for our loader until we have a response from the server.
        setLoading(true);
      })
      .then((data: any) => {
        //if our list is empty from the server repsonse, just set our state to empty
        if (data.length === 0) props.setDirectoryList([]);
        //the server must have responded with data if we make it here, assign our list state to the server data
        else props.setDirectoryList(data);
      })
      .finally(() => {
        setLoading(false);
      });
    props
      .GetFileList(directory, () => {
        setLoading(true);
      })
      .then((data: any) => {
        if (data.length === 0) props.setFileList([]);
        else props.setFileList(data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="fileBrowser">
        {loading ? (
          <div className="loader">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : null}
        <DirectoryManager
          GetFileList={props.GetFileList}
          GetDirectoryList={props.GetDirectoryList}
          fileList={props.fileList}
          directoryList={props.directoryList}
          setFileList={props.setFileList}
          setDirectoryList={props.setDirectoryList}
          currentDirectory={props.currentDirectory}
          setCurrentDirectory={props.setCurrentDirectory}
          previousDirectory={props.previousDirectory}
          setPreviousDirectory={props.setPreviousDirectory}
          RefreshFileBrowser={RefreshFileBrowser}
          setAlert={props.setAlert}
        ></DirectoryManager>
        <FileManager
          GetFileList={props.GetFileList}
          GetDirectoryList={props.GetDirectoryList}
          fileList={props.fileList}
          directoryList={props.directoryList}
          setFileList={props.setFileList}
          setDirectoryList={props.setDirectoryList}
          currentDirectory={props.currentDirectory}
          setCurrentDirectory={props.setCurrentDirectory}
          previousDirectory={props.previousDirectory}
          setPreviousDirectory={props.setPreviousDirectory}
          RefreshFileBrowser={RefreshFileBrowser}
          setAlert={props.setAlert}
        ></FileManager>
      </div>
    </>
  );
}

export default FileBrowser;
