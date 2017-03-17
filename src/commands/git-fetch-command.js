import Command from './command';
import weaki from '../../app.js';

/**
 * Fetches the remote changes of the current git repository.
 *
 * @class GitFetchCommand
 */
class GitFetchCommand extends Command {
    constructor () {
        super(delegateToApplication.bind(null), null);
    }
}

/**
 * Delegates the action of fetching the remote changes to the application.
 * @returns {Promise.<Object, Error>}
 */
function delegateToApplication () {
    return weaki.git.fetchChanges();
}

export default GitFetchCommand;
