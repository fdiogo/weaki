import {app, BrowserWindow, Menu, ipcMain} from 'electron';
import path from 'path';
import url from 'url';

import Git from './src/git';
import CommandRegistry from './src/command-registry';
import OpenFileCommand from './src/commands/open-file-command';
import OpenRepositoryCommand from './src/commands/open-repository-command';
import SaveFileCommand from './src/commands/save-file-command';
import CloseFileCommand from './src/commands/close-file-command';
import BoldCommand from './src/commands/bold-command';
import ItalicCommand from './src/commands/italic-command';
import StrikeThroughCommand from './src/commands/strike-through-command';
import HeaderCommand from './src/commands/header-command';
import LinkCommand from './src/commands/link-command';
import UnorderedListCommand from './src/commands/unordered-list-command';
import OrderedListCommand from './src/commands/ordered-list-command';
import BlockquoteCommand from './src/commands/blockquote-command';
import TableCommand from './src/commands/table-command';
import CodeCommand from './src/commands/code-command';
import HorizontalRuleCommand from './src/commands/horizontal-rule-command';
import ImageCommand from './src/commands/image-command';
import GitFetchCommand from './src/commands/git-fetch-command';
import GitCheckoutCommand from './src/commands/git-checkout-command';
import MenuTemplate from './src/menu-template';

const commandRegistry = new CommandRegistry();

/**
 * The entry point to Weaki.
 * @class Weaki
 */
class Weaki {

    constructor () {
        app.on('ready', () => {
            registerCommands.call(this);
            createMenu.call(this);
            registerChannelListeners.call(this);
            const mainWindow = launchMainWindow.call(this);
            const gitInterface = new Git();

            Object.defineProperties(this, {
                mainWindow: {
                    value: mainWindow,
                    writable: false,
                    configurable: false
                },

                git: {
                    value: gitInterface,
                    writable: false,
                    configurable: false
                }
            });
        });
    }

    /**
     * Searches a command by selector, creates an instance with the provided arguments and executes it.
     *
     * @param {string} selector - The registered command selector.
     * @param {Object[]} commandArguments - The arguments to be supplied to the command.
     */
    executeCommand (selector, commandArguments) {
        const CommandClass = commandRegistry.get(selector);
        if (!CommandClass) {
            console.log(`The command '${selector}' does not exist!`);
            return;
        }

        try {
            const command = new CommandClass(commandArguments);
            command.execute();
            console.log(`Executed '${selector}' with arguments '${commandArguments}'`);
        } catch (error) {
            console.log(`Could not execute '${selector}'! Detailed error: ${error}`);
        }
    }
}

/**
 * Registers, by selector, the commands known by the application.
 */
function registerCommands () {
    commandRegistry.register('application:open-file', OpenFileCommand);
    commandRegistry.register('application:open-repository', OpenRepositoryCommand);
    commandRegistry.register('application:save-file', SaveFileCommand);
    commandRegistry.register('application:close-file', CloseFileCommand);
    commandRegistry.register('git:fetch', GitFetchCommand);
    commandRegistry.register('git:checkout', GitCheckoutCommand);
    commandRegistry.register('editor:bold', BoldCommand);
    commandRegistry.register('editor:italic', ItalicCommand);
    commandRegistry.register('editor:strike-through', StrikeThroughCommand);
    commandRegistry.register('editor:header', HeaderCommand);
    commandRegistry.register('editor:link', LinkCommand);
    commandRegistry.register('editor:unordered-list', UnorderedListCommand);
    commandRegistry.register('editor:ordered-list', OrderedListCommand);
    commandRegistry.register('editor:blockquote', BlockquoteCommand);
    commandRegistry.register('editor:table', TableCommand);
    commandRegistry.register('editor:code', CodeCommand);
    commandRegistry.register('editor:horizontal-rule', HorizontalRuleCommand);
    commandRegistry.register('editor:image', ImageCommand);
}

/**
 * Creates the menu with the template on {@link MenuTemplate}.
 */
function createMenu () {
    const template = new MenuTemplate();
    const menu = Menu.buildFromTemplate(template.value);
    Menu.setApplicationMenu(menu);
}

/**
 * Registers the actions by channel for each ipc message received.
 */
function registerChannelListeners () {
    ipcMain.on('execute-command', (event, selector, commandArgs) => this.executeCommand(selector, commandArgs));
}

/**
 * Launches the main window of the application.
 * @return {BrowserWindow} - The window that was just created.
 */
function launchMainWindow () {
    const mainWindow = new BrowserWindow({title: 'Weaki'});
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src', 'window.html'),
        protocol: 'file',
        slashes: true
    }));

    return mainWindow;
}

export default new Weaki();
export { Weaki };
