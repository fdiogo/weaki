import {app, dialog} from 'electron';
import Command from './command';
import weaki from '../../app';

/**
 * Opens a git repository in the application.
 *
 * The command first opens a dialog window so the user can select a directory which must
 * be a git repository (checked with the existance of a .git folder).
 * When a valid repository is selected, the directory is loaded and a file tree is created.
 * Finally, this file tree is sent to the main window through the {@link application:directory-loaded} channel.
 *
 * @class OpenRepositoryCommand
 */
class OpenRepositoryCommand extends Command {
    constructor (directory) {
        super(openRepository.bind(null, directory), null);
    }
}

/**
 * Opens a git repository and sends the contents to the main window.
 * @param {string} [directory]  - The path of the repository.
 * @returns {Promise}           - A promise to the operation.
 */
function openRepository (directory) {
    let promise;
    if (!directory)
        promise = getDirectory().then(directory => weaki.openRepository(directory));
    else
        promise = weaki.openRepository(directory);

    return promise.catch(error => dialog.showErrorBox('Error', error));
}

/**
 *
 */
function getDirectory () {
    return new Promise(function (resolve, reject) {
        dialog.showOpenDialog(weaki.mainWindow, {
            title: 'Open Repository',
            defaultPath: app.getPath('desktop'),
            properties: ['openDirectory']
        }, function (directories) {
            if (!directories || directories.length === 0)
                reject('No directory selected!');
            else {
                const directory = directories[0];
                weaki.git.isRepository(directory)
                    .then(isRepository => {
                        if (isRepository) resolve(directory);
                        else reject(new Error(`${directory} is not git repository!`));
                    });
            }
        });
    });
}

export default OpenRepositoryCommand;
