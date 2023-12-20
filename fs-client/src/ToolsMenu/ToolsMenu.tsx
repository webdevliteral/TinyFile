import DirectoryComponent from "./DirectoryComponent/DirectoryComponent";
import UploadComponent from "./UploadComponent/UploadComponent";
import "./toolsmenu.css";

//use an interface to define what props (state) we're expecting to be passed to the tools menu
interface Props {
  GetFileList: Function;
  GetDirectoryList: Function;
  fileList: any;
  directoryList: any;
  setFileList: any;
  setDirectoryList: any;
  currentDirectory: string;
  setAlert: Function;
}

function ToolsMenu(props: Props) {
  return (
    <>
      <div className="tool-container">
        <span>
          <h2>Tools & Settings</h2>
        </span>
        <hr />
        <UploadComponent
          fileList={props.fileList}
          setFileList={props.setFileList}
          GetFileList={props.GetFileList}
          currentDirectory={props.currentDirectory}
        ></UploadComponent>
        <DirectoryComponent
          currentDirectory={props.currentDirectory}
          GetDirectoryList={props.GetDirectoryList}
          setDirectoryList={props.setDirectoryList}
          setAlert={props.setAlert}
        ></DirectoryComponent>
      </div>
    </>
  );
}

export default ToolsMenu;
