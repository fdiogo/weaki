import Command from './command';
import weaki from '../../app.js';

/**
 * Pushes the local changes to a remote repository.
 *
 * @class GitPushCommand
 */
class GitFetchCommand extends Command {
    constructor (remote, origin) {
        super(delegateToApplication.bind(null, remote, origin), null);
    }
}

/**
 * Delegates the action of pushing the local changes to the application.
 * @returns {Promise.<Object, Error>}
 */
function delegateToApplication (remote, origin) {
    return weaki.git.push(remote, origin);
}

export default GitFetchCommand;
