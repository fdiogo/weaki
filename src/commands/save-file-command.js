import { ipcMain } from 'electron';
import Command from './command';
import fs from 'fs';

let fileRequests = 0;

/**
 * The command which saves a file. If no argument is provided the command communicates with the main window in
 * order to detect which file is currently being edited.
 */
class SaveFileCommand extends Command {

    /**
     * @param {Object} fileDescriptor - A descriptor of the file {path, contents}
     */
    constructor (fileDescriptor) {
        super(saveFile.bind(null, fileDescriptor), null);
    }

}

/**
 * @param {Object} fileDescriptor - A descriptor of the file {path, contents}
 * @return {Promise} - A promise to the save operation
 */
function saveFile (fileDescriptor) {
    if (!fileDescriptor)
        return getFileDescriptor().then(writeFile);

    return writeFile(fileDescriptor);
}

/**
 * Asks for the file currently being edited in the main window by sending a message on the channel
 * 'editor:current-file-request' and waiting for the response on single-use channel.
 * @return {Promise} - A promise to the file descriptor
 */
function getFileDescriptor () {
    return new Promise(function (resolve, reject) {
        const requestNumber = fileRequests++;
        const responseChannel = `editor:current-file-request@${requestNumber}`;
        ipcMain.once(responseChannel, (event, fileDescriptor) => resolve(fileDescriptor));
        global.mainWindow.webContents.send('editor:current-file-request', responseChannel);
    });
}

/**
 * Uses the module 'fs' to write a file asynchronously.
 * @param {Object} fileDescriptor - The arguments for fs.writeFile
 * @return {Promise} - A promise to the write operation
 */
function writeFile (fileDescriptor) {
    console.log(`Writing to file '${fileDescriptor.path}': '${fileDescriptor.contents}'`);

    return new Promise(function (resolve, reject) {
        fs.writeFile(fileDescriptor.path, fileDescriptor.contents, error => {
            if (error) reject(error);
            else resolve();
        });
    });
}

export default SaveFileCommand;
