import Command from './command';
import weaki from '../../app.js';

/**
 * Pushes the local changes to a remote repository.
 *
 * @class GitPushCommand
 */
class GitFetchCommand extends Command {
    constructor () {
        super(delegateToApplication.bind(null), null);
    }
}

/**
 * Delegates the action of pushing the local changes to the application.
 * @returns {Promise.<Object, Error>}
 */
function delegateToApplication () {
    return weaki.git.push();
}

export default GitFetchCommand;
