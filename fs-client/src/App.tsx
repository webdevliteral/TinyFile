import React, { useState } from "react";
import FileBrowser from "./FileBrowser/FileBrowser";
import ToolsMenu from "./ToolsMenu/ToolsMenu";
import axios from "axios";

import "./App.css";
import BasicAlert from "./Alerts/BasicAlert";

export const server_hostname = "http://localhost";
export const server_port = 3001;

function App() {
  //global states go here
  const [fileList, setFileList] = useState<Array<any>>();
  const [directoryList, setDirectoryList] = useState<Array<any>>();
  const [currentDirectory, setCurrentDirectory] = useState("root");
  const [previousDirectory, setPreviousDirectory] = useState("");
  const [alert, setAlert] = useState<BasicAlert>();

  const GetFileList: any = async (directoryPath: string) => {
    //init an empty array to clone a list of files into
    let data: any = [];

    //make a post request and send the directory to retrieve a file list from
    await axios
      .post(`${server_hostname}:${server_port}/files/list`, {
        path: directoryPath,
      })
      .then((res) => {
        const { status, files, condition } = res.data;
        //if there aren't any files, return an undefined array
        if (condition == "NO_FILE") {
          return [];
        }
        //if we've made it here, there were files and we can copy the array inside our server response
        if (status === 200 && files) data = files;
      });
    return data;
  };

  const GetDirectoryList: any = async (directoryPath: string) => {
    //init an empty array to clone a list of files into
    let data: any = [];

    //make a post request and send the directory to retrieve a file list from
    await axios
      .post(`${server_hostname}:${server_port}/directory/navigate`, {
        path: directoryPath,
      })
      .then((res) => {
        const { status, files, condition } = res.data;
        //if there aren't any files, return an undefined array
        if (condition == "NO_FILE") {
          return [];
        }
        //if we've made it here, there were files and we can copy the array inside our server response
        if (status === 200 && files) data = files;
      });
    return data;
  };

  return (
    <>
      <BasicAlert alert={alert} setAlert={setAlert}></BasicAlert>
      <div className="viewport-wrapper">
        <ToolsMenu
          fileList={fileList}
          directoryList={directoryList}
          setFileList={setFileList}
          setDirectoryList={setDirectoryList}
          GetFileList={GetFileList}
          GetDirectoryList={GetDirectoryList}
          currentDirectory={currentDirectory}
          setAlert={setAlert}
        ></ToolsMenu>
        <FileBrowser
          fileList={fileList}
          directoryList={directoryList}
          setFileList={setFileList}
          setDirectoryList={setDirectoryList}
          GetFileList={GetFileList}
          GetDirectoryList={GetDirectoryList}
          currentDirectory={currentDirectory}
          setCurrentDirectory={setCurrentDirectory}
          previousDirectory={previousDirectory}
          setPreviousDirectory={setPreviousDirectory}
          setAlert={setAlert}
        ></FileBrowser>
      </div>
    </>
  );
}

export default App;
