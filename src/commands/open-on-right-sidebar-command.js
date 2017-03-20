import Command from './command';
import weaki from '../../app.js';

/**
 * Opens a component by route on the right sidebar.
 *
 * @class OpenGitCommitCommand
 */
class OpenOnRightSidebarCommand extends Command {
    constructor (route) {
        super(openOnRightSidebar.bind(null, route), null);
    }
}

/**
 * Sends the route to the main window via the channel 'application:open-on-right-sidebar'.
 * @param {string} route - The route of the component.
 */
function openOnRightSidebar (route) {
    weaki.mainWindow.webContents.send('application:open-on-right-sidebar', route);
}

export default OpenOnRightSidebarCommand;
