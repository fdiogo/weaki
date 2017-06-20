import { ipcMain, dialog } from 'electron';
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
     * @param {string} [path] - The path of the file.
     * @param {string} [content] - The content of the file.
     */
    constructor (path, content) {
        super(SaveFileCommand.saveFile.bind(null, path, content), null);
    }

    /**
     * @param {string} [path] - The path of the file.
     * @param {string} [content] - The content of the file.
     * @return {Promise.<void, Error>} - A promise to the save operation.
     */
    static saveFile (path, content) {
        if (!path || !content) {
            return SaveFileCommand.getCurrentFile()
                .then(descriptor => {
                    if (!descriptor.path) {
                        return SaveFileCommand.getSavePath().then(path => {
                            descriptor.path = path;
                            weaki.fileManager.onFileAdd(path);
                            return descriptor;
                        });
                    } else
                        return descriptor;
                })
                .then(descriptor => {
                    if (descriptor.path) {
                        weaki.fileManager.writeFile(descriptor.path, descriptor.content);
                        weaki.mainWindow.webContents.send(descriptor.responseChannel, descriptor.path);
                    }
                });
        }

        return weaki.fileManager.writeFile(path, content);
    }

    static getSavePath () {
        return new Promise(function (resolve, reject) {
            dialog.showSaveDialog(weaki.mainWindow, {
                title: 'Save As...',
                defaultPath: weaki.fileManager.workspace
            }, function (filePath) {
                resolve(filePath);
            });
        });
    }

    /**
     * Asks for the file currently being edited in the main window by sending a message on the channel
     * 'application:current-file' and waiting for the response on single-use channel.
     * @return {Promise} - A promise to the file descriptor.
     */
    static getCurrentFile () {
        return new Promise(function (resolve, reject) {
            const requestNumber = fileRequests++;
            const responseChannel = `application:save-request@${requestNumber}`;
            ipcMain.once(responseChannel, (event, path, content) => resolve({
                path: path,
                content: content,
                responseChannel: responseChannel
            }));
            weaki.mainWindow.webContents.send('application:save-request', responseChannel);
        });
    }

}

export default SaveFileCommand;
