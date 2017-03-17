import Command from './command';
import weaki from '../../app.js';

/**
 * Checkouts a collection of files to a specific commit.
 *
 * @class GitCheckoutCommand
 */
class GitCheckoutCommand extends Command {
    /**
     * @param {string} commitHash - The hash of the wanted commit.
     * @param {string[]} fileGlobs - The file globs for the command.
     */
    constructor (commitHash, fileGlobs) {
        super(delegateToApplication.bind(null, commitHash, fileGlobs), null);
    }
}

/**
 * Delegates the action of resetting changes to the application.
 * @returns {Promise.<Object, Error>}
 */
function delegateToApplication (commitHash, fileGlobs) {
    return weaki.git.checkout(commitHash, fileGlobs);
}

export default GitCheckoutCommand;
