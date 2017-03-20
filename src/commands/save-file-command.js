import { ipcMain } from 'electron';
import Command from './command';
import weaki from '../../app';

let fileRequests = 0;

/**
 * The command which saves a file. If no argument is provided the command communicates with the main window in
 * order to detect which file is currently being edited.
 * @extends Command
 */
class SaveFileCommand extends Command {

    /**
     * @param {Object} fileDescriptor - A descriptor of the file.
     * @param {string} fileDescriptor.path - The path of the file.
     * @param {string} fileDescriptor.contents - The contents of the file.
     */
    constructor (fileDescriptor) {
        super(SaveFileCommand.saveFile.bind(null, fileDescriptor), null);
    }

    /**
     * @param {Object} fileDescriptor - A descriptor of the file.
     * @param {string} fileDescriptor.path - The path of the file.
     * @param {string} fileDescriptor.contents - The contents of the file.
     * @return {Promise} - A promise to the save operation.
     */
    static saveFile (fileDescriptor) {
        if (!fileDescriptor)
            return SaveFileCommand.getFileDescriptor().then(SaveFileCommand.writeFile);

        return SaveFileCommand.writeFile(fileDescriptor);
    }

    /**
     * Asks for the file currently being edited in the main window by sending a message on the channel
     * 'application:current-file' and waiting for the response on single-use channel.
     * @return {Promise} - A promise to the file descriptor.
     */
    static getFileDescriptor () {
        return new Promise(function (resolve, reject) {
            const requestNumber = fileRequests++;
            const responseChannel = `application:current-file@${requestNumber}`;
            ipcMain.once(responseChannel, (event, fileDescriptor) => resolve(fileDescriptor));
            weaki.mainWindow.webContents.send('application:current-file', responseChannel);
        });
    }

    /**
     * Uses the module 'fs' to write a file asynchronously.
     * @param {Object} fileDescriptor - The arguments for fs.writeFile.
     * @param {string} fileDescriptor.path - The path of the file.
     * @param {string} fileDescriptor.contents - The contents of the file.
     * @return {Promise.<,Error>} - A promise to the operation.
     */
    static writeFile (fileDescriptor) {
        console.log(`Writing to file '${fileDescriptor.path}': '${fileDescriptor.contents}'`);
        return weaki.fileManager.writeFile(fileDescriptor.path, fileDescriptor.contents);
    }

}

export default SaveFileCommand;
