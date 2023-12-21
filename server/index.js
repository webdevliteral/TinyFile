import * as fs from 'node:fs'
import express from 'express'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import path from 'path'
import 'dotenv/config'

//Environment Variables
const ENV_PORT = process.env.PORT

//File Directories
const rootDir = './public/files/'

//initialize express
const app = express()

// to support JSON-encoded bodies
app.use(express.json());
// to support URL-encoded bodies     
app.use(express.urlencoded({ extended: true })); 

//allow CORS through middleware
app.use(cors())

//File Upload Config
app.use(fileUpload({
    useTempFiles: false,
    safeFileNames: true, //remove non-alphanumeric characters except dashes and underscores. can be customized with regex
    preserveExtension: true, //preserves the extension of a file, so that .mp4 doesnt become .jpg, or nothing for that matter
    tempFileDir: `${rootDir}/temp` //using a temp directory to alleviate RAM, useful for bigger files
}))

//functions
//Function: SendFileList(req, res, filePath = rootDir)
//Purpose: To establish what files, if any, inside of a specific directory can be sent back to the client
//Uses: Whenever you need to send the file contents of a directory.
//TODO: Merge SendFileList() and SendDirectoryList()
async function SendFileList(req, res, filePath = rootDir) {
    let fullPath;
    if(filePath === "root") 
        fullPath = rootDir;
    else
        fullPath = filePath + "/";

    fs.readdir(fullPath, async (err, files) => {
        //if the amount of files in a directory is 0 then send a 200 status with a condition alerting the client that there are no files, but not due to error.
        if(err && err.code === 'ENOENT') return res.json({status: 400, condition: "NO_DIR", alert: "That directory does not exist."})  
        if(files.length === 0) return res.json({status: 200, condition: "NO_FILE", alert: "There are no files in this directory."})

        //init empty list of all active files
        const fileInfoArray = [];

        //this doesnt feel like a scalable method, but for a lightweight filesystem that's intended to be run in personal use cases,
        //it should be fast enough using a 1 dimensional loop with promises. plus error handling with reject.
        await new Promise(async (resolve, reject) => {
            for (let i = 0; i < files.length; i++) {
                //get some basic file info
                let stats = fs.statSync(fullPath + files[i])

                //we dont want to return any directories, so continue through loop if file is a directory
                if(fs.existsSync(fullPath + files[i]) 
                && fs.lstatSync(fullPath + files[i]).isDirectory()) {
                    
                } else {
                    //extract the info we want into an object
                    const fileInfo = {
                        name: files[i],
                        size: stats.size,
                        extension: path.extname(files[i])
                    }

                    //add file info to array to be sent to client
                    fileInfoArray.push(fileInfo)
                }

                //after we've pushed each item into the array,
                //check that we aren't at the end of our array
                //if we are, resolve the promise so we can send a finalized response
                if(i === files.length - 1) {
                    resolve();
                }
            }
        })
        .then(() => {
            res.json({status: 200, files: fileInfoArray})
        });
              
    })
}

async function SendDirectoryList(req, res, path) {
    let fullPath;
    if(path === "root") 
        fullPath = rootDir;
    else
        fullPath = path + "/";

    fs.readdir(fullPath, async (err, files) => {
        if(err && err.code === 'ENOENT') return res.json({status: 400, condition: "NO_DIR", alert: "That directory does not exist."})  
        if(files.length === 0) return res.json({status: 400, condition: "NO_FILE", alert: "There are no files in your drive."})
        //init empty list of all active files
        const infoArray = [];
        await new Promise(async (resolve, reject) => {
            for (let i = 0; i < files.length; i++) {
                //we only want to return directories, so continue through loop if file is NOT a directory
                if(fs.existsSync(fullPath + files[i]) 
                && fs.lstatSync(fullPath + files[i]).isDirectory()) {
                    //extract the info we want into an object
                    const fileInfo = {
                        name: files[i],
                        path: fullPath + files[i]
                    }

                    //add file info to array to be sent to client
                    infoArray.push(fileInfo)
                } else {
                    
                }

                //after we've pushed each item into the array,
                //check that we aren't at the end of our array
                //if we are, resolve the promise so we can send a finalized response
                if(i === files.length - 1) {
                    resolve();
                }
            }
        })
        .then(() => {
            res.json({status: 200, files: infoArray})
        });
              
    })
}

function isEmptyString(string) {
    return (!string || string.trim() === "")
}

//Function: IsValidDirectoryName(name)
//Purpose: Checking whether or not a directory name contains blankspaces or illegal characters that would otherwise cause issues in the filesystem.
//Uses: Whenever you need to sanitize a directory name.
function IsValidDirectoryName(name) {
    if(isEmptyString(name)) return false;
    const illegal = ['<', '>', ':', '"', '/', '\\', '|', '?', '*']

    for(let i = 0; i < name.length; i++) {
        for(let j = 0; j < illegal.length; j++) {
            if(name.charAt(i) === illegal[j]) {
                return false;
            }  
        }
    }
    return true;
}


//GET Routes
app.get('/directory/:folderName', async (req, res) => {
    const folderName = (req.params.folderName === "root") ? rootDir : `${rootDir}${req.params.folderName}`
    const filepath = folderName
    try {
        await fs.promises.access(filepath).then((err) => {
            if(err) return console.log(err)
            // The check succeeded, meaning that directory exists
            SendFileList(req, res, filepath + "/")
        });
    } catch (error) {
        // The check failed to find a directory with that name
        res.json({status: 404, alert: `Directory with name: ${req.params.folderName} does not exist.`})
    }
});

//POST routes
app.post('/upload/', (req, res) => {
    const file = req.files.file
    const name = file.name
    const md5 = file.md5
    const saveAs = `${md5}_${name}`
    const filepath = req.body.path === "root" ? `${rootDir}${saveAs}` : `${req.body.path}/${saveAs}`
    console.log(filepath)
    file.mv(filepath, (err) => {
        if(!err) return res.status(200).json({ fileStatus: "uploaded", name, saveAs});
    });
})

app.post('/directory/new/:name', async(req, res) => {
    //sanitize the new directory name to make sure it doesnt contain illegal characters
    if(!IsValidDirectoryName(req.params.name)) {
        res.json({status: 400, alert: `Directory with name: ${req.params.name} cannot be created due to illegal characters. Remove special characters and try again.`})
        return;
    }

    //the client will either send "root" or actual breadcrumbs, depending on the directory we're in.
    const filepath = req.body.path === "root" ? `${rootDir}${req.params.name}` : `${req.body.path}/${req.params.name}`

    try {
        await fs.promises.access(filepath);
        // The check succeeded, meaning that directory already exists
        res.json({status: 400, alert: `Directory with name: ${req.params.name} already exists.`})
    } catch (error) {
        // The check failed to find a directory with that name, create one
        fs.mkdirSync(filepath)
        res.json({status: 200, alert: `Directory with name: ${req.params.name} was created.`})
    }
})

app.post('/directory/navigate', (req, res) => {
    SendDirectoryList(req, res, req.body.path)
})

app.post('/file/edit/', (req, res) => {
    let {filepath, oldName, newName} = req.body;
    if(!IsValidDirectoryName(newName)) {
        res.json({status: 400, alert: `Cannot rename file due to illegal characters. Remove special characters and try again.`})
        return;
    }
    if(filepath === "root")
        filepath = rootDir;
    else
        filepath = filepath + "/"

    let extension = path.extname(`${filepath}${oldName}`)

    fs.rename(`${filepath}${oldName}`, `${filepath}${newName}${extension}`, (err) => {
        if(err) res.json({status: 500, alert: err})
        else
            res.json({status: 200, alert: "Successfully renamed file."})
    })
})

app.post('/files/list', (req, res) => {
    SendFileList(req, res, req.body.path)
})

app.post('/file/download/', (req, res) => {
    let filePath;
    if(req.body.path === "root") 
        filePath = rootDir + req.body.filename;
    else
        filePath = req.body.path + "/" + req.body.filename;

    //set the desired filepath
    //Node's fs.exists is deprecated, so we check the stats of the file to see if anything returns
    //  Note: fs.existsSync still works, but i dont want to block here
    fs.stat(filePath, (err, stats) => {
        if (!err) {
            res.setHeader('Content-Disposition', 'attachment; filename=' + `${req.params.file}`);
            res.download(filePath, `${req.params.file}`)
        } else {
            return console.error(err)
        }
    })
})

//DELETE routes
//TODO: can you send data with http DELETE, and if so why did I make this a post?
app.post('/file/delete', async (req, res) => {
    //set the desired filepath
    const filePath = (req.body.path === "root") ? `${rootDir}${req.body.filename}` : `${req.body.path}/${req.body.filename}`;
    console.log(filePath)
    //Node's fs.exists is deprecated, so we check the stats of the file to see if anything returns
    try {
        await fs.promises.access(filePath, fs.constants.R_OK)
        //if we make it here, the path can be accessed!
        fs.unlink(filePath, (err) => {
            if(!err) {
                SendFileList(req, res)
            } else console.log(err)
        })
    } catch(e) {
        return res.json({status: 400, condition: "NO_DIR", alert: "That directory does not exist."})
    }
});

app.post('/directory/delete/', (req, res) => {
    //set the desired filepath
    const filePath = `${req.body.path}`;

    if(fs.existsSync(filePath) 
    && fs.lstatSync(filePath).isDirectory()) {
        console.log(filePath + " is a directory! Deleting...")
        //extract the info we want into an object
        fs.rmSync(filePath, { recursive: true })
        return res.json({status: 200, alert: `Directory was successfully deleted.`})
    }

    res.json({status: 400, alert: `Directory with name: ${filePath} could not be deleted.`})
});


app.listen(ENV_PORT)
