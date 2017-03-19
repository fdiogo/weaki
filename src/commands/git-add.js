import Command from './command';
import weaki from '../../app.js';

/**
 * Adds files to the staging area.
 *
 * @class GitAddCommand
 */
class GitAddCommand extends Command {
    /**
     * @param {string|string[]} [files=[]] - The files to add.
     */
    constructor (files = []) {
        super(delegateToApplication.bind(null, files), null);
    }
}

/**
 * Delegates the action of adding the files to the application.
 * @returns {Promise.<, Error>} - A promise to the operation.
 */
function delegateToApplication (files) {
    return weaki.git.add(files);
}

export default GitAddCommand;
