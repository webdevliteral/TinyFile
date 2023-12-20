import { useState } from "react";
import axios from "axios";
import "./uploadComponent.css";

interface Props {
  GetFileList: Function;
  fileList: any;
  setFileList: any;
  currentDirectory: string;
}

function UploadComponent(props: Props) {
  const [fileSelected, setFileSelected] = useState<File>();
  const [uploadPercent, setUploadPercent] = useState(0);

  //Function: handleFileInputChange()
  //Purpose: handles what happens to the file once the user has selected a file
  //Uses: To handle any state needed and to prepare it for upload
  const handleFileInputChange = (target: HTMLInputElement) => {
    const file: File = (target.files as FileList)[0];
    if (file === undefined) {
      alert("No file was selected for upload. Please try again!");
      return;
    }

    setFileSelected(file);
    uploadFileData(file);
  };

  //Function: uploadFileData()
  //Purpose: handles the formatting of our form data and file info to be passed to the server
  //Uses: To finalize the upload of a file from client to server
  const uploadFileData = (file: File) => {
    //set state of our upload percent for the progress bar, this way it's at 0 for every upload
    setUploadPercent(0);

    //init a new FormData object so we can append our file, path, and other pertinent information
    const formData = new FormData();

    formData.append("file", file);
    formData.append("path", props.currentDirectory);

    //define out post options. it's important to set the headers Content-Type to multipart/form-data so that our FormData object is properly sent to the server
    const postConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: function (ProgressEvent: any) {
        setUploadPercent((ProgressEvent.loaded / ProgressEvent.total) * 100);
      },
    };

    //send our file data to the server in the FormData we just configured
    axios
      .post("http://192.168.1.20:3001/upload/", formData, postConfig)
      .then((res) => {
        props.GetFileList(props.currentDirectory).then((data: any) => {
          if (data.length === 0) props.setFileList(undefined);
          else props.setFileList(data);
        });
      });
  };

  return (
    <>
      <div className="upload-wrapper">
        <ul>
          <li>
            <form method="POST" name="UploadForm" id="UploadForm">
              <label htmlFor="file">Upload A File</label>
              <input
                type="file"
                name="file"
                id="file"
                onChange={(e) => handleFileInputChange(e.target)}
              />
            </form>
            <p style={{ display: "block", textAlign: "center" }}>
              {Math.round(uploadPercent)}% Uploaded
            </p>
            <progress value={Math.round(uploadPercent)} max="100"></progress>
          </li>
        </ul>
      </div>
    </>
  );
}

export default UploadComponent;
