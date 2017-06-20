import {app, BrowserWindow, Menu, ipcMain} from 'electron';
import path from 'path';
import url from 'url';

import Git from './src/git';
import FileManager from './src/file-manager';
import FileInterpreter from './src/file-interpreter';
import CommandRegistry from './src/command-registry';
import MenuTemplate from './src/menu-template';

import JavascriptInterpreter from './src/code-interpreters/javascript-interpreter';

// Commands
import NewFileCommand from './src/commands/new-file-command';
import OpenFileCommand from './src/commands/open-file-command';
import OpenRepositoryCommand from './src/commands/open-repository-command';
import OpenOnRightSidebarCommand from './src/commands/open-on-right-sidebar-command';
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
import GitPushCommand from './src/commands/git-push-command';

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
            this.git = new Git();
            this.fileManager = new FileManager();
            this.fileInterpreter = new FileInterpreter(this.fileManager, [JavascriptInterpreter]);
            this.mainWindow = launchMainWindow.call(this);
        });

        app.on('will-quit', () => this.fileManager.watcher.close());
    }

    openRepository (directory) {
        this.git.openRepository(directory)
            .then(() => {
                if (this.addListener)
                    this.fileManager.unwatchFileAdd(this.addListener);

                this.fileManager.setWorkspace(directory);
                this.addListener = this.fileManager.watchFileAdd(directory, filePath => {
                    this.mainWindow.webContents.send('application:file-created', filePath);
                });
                return this.fileManager.createDirectory('.weaki', false)
                    .then(() => this.mainWindow.webContents.send('application:workspace-changed', directory));
            })
            .then(() => this.fileManager.readDirectory(directory, true))
            .then(files => {
                files.forEach(file => file.isDirectory = file.isDirectory());
                this.mainWindow.webContents.send('application:directory-loaded', directory, files);
            });
    }

    /**
     * Searches a command by selector, creates an instance with the provided arguments and executes it.
     *
     * @param {string} selector - The registered command selector.
     * @param {Object[]} [...commandArgument] - One of the arguments for the command.
     * @returns {Promise.<*, Error>}
     */
    executeCommand (selector) {
        const CommandClass = commandRegistry.get(selector);
        if (!CommandClass) {
            console.log(`The command '${selector}' does not exist!`);
            return;
        }

        /**
         * Array.prototype.slice is not used here in order to allow engine optimization.
         * For more: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
         */
        const commandArguments = [];
        for (let i = 1; i < arguments.length; i++)
            commandArguments.push(arguments[i]);

        const command = new CommandClass(...commandArguments);
        return command.execute()
                .then(result => {
                    if (commandArguments.length === 0)
                        console.log(`Executed '${selector}' with no arguments!`);
                    else
                        console.log(`Executed '${selector}' with arguments ${commandArguments}`);

                    return result;
                }).catch(error => {
                    console.log(`Could not execute '${selector}'! Detailed error: ${error}`);
                });
    }
}

/**
 * Registers, by selector, the commands known by the application.
 */
function registerCommands () {
    commandRegistry.register('application:new-file', NewFileCommand);
    commandRegistry.register('application:open-file', OpenFileCommand);
    commandRegistry.register('application:open-repository', OpenRepositoryCommand);
    commandRegistry.register('application:save-file', SaveFileCommand);
    commandRegistry.register('application:close-file', CloseFileCommand);
    commandRegistry.register('application:open-on-right-sidebar', OpenOnRightSidebarCommand);
    commandRegistry.register('git:fetch', GitFetchCommand);
    commandRegistry.register('git:checkout', GitCheckoutCommand);
    commandRegistry.register('git:push', GitPushCommand);
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
    const mainWindow = new BrowserWindow({title: 'Weaki', show: false});

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src', 'window.html'),
        protocol: 'file',
        slashes: true
    }));

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
    });

    return mainWindow;
}

// function onFileAdd (filePath) {
//     this.mainWindow.webContents.send('application:file-created', filePath);
// }

const instance = new Weaki();
global.instance = instance;
export default instance;
export { Weaki };
