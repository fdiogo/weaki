import Command from './command';
import weaki from '../../app.js';

/**
 * Opens the git commit component on the main panel.
 *
 * @class OpenGitCommitCommand
 */
class OpenGitCommitCommand extends Command {
    constructor () {
        super(openOnMainPanel.bind(null), null);
    }
}

/**
 * Sends the route '/git/commit' to the main window via the channel 'application:open-on-main-panel'.
 */
function openOnMainPanel () {
    weaki.mainWindow.webContents.send('application:open-on-main-panel', '/git/commit');
}

export default OpenGitCommitCommand;
