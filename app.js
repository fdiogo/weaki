import {app, BrowserWindow, Menu, ipcMain} from 'electron';
import path from 'path';
import url from 'url';
import Git from 'simple-git';

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
import MenuTemplate from './src/menu-template';

const commandRegistry = new CommandRegistry();
const commandStack = [];
let repository = Git();

app.on('ready', () => {
    const mainWindow = new BrowserWindow({title: 'Weaki'});
    ipcMain.on('execute-command', (event, selector, commandArgs) => executeCommand(selector, commandArgs));

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src', 'window.html'),
        protocol: 'file',
        slashes: true
    }));

    Object.defineProperty(global, 'mainWindow', { get: () => mainWindow });
    registerCommands();
    createMenu();
});

function registerCommands () {
    commandRegistry.register('application:open-file', OpenFileCommand);
    commandRegistry.register('application:open-repository', OpenRepositoryCommand);
    commandRegistry.register('application:save-file', SaveFileCommand);
    commandRegistry.register('application:close-file', CloseFileCommand);
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

function createMenu () {
    const template = new MenuTemplate();
    const menu = Menu.buildFromTemplate(template.value);
    Menu.setApplicationMenu(menu);
}

function executeCommand (selector, commandArguments) {
    const CommandClass = commandRegistry.get(selector);
    if (!CommandClass) {
        console.log(`The command '${selector}' does not exist!`);
        return;
    }

    try {
        const command = new CommandClass(commandArguments);
        command.execute();
        console.log(`Executed '${selector}' with arguments '${commandArguments}'`);
        commandStack.push(command);
    } catch (error) {
        console.log(`Could not execute '${selector}'! Detailed error: ${error}`);
    }
}

function openRepository (repositoryPath) {
    return new Promise(function (resolve, reject) {
        console.log(`Opening ${repositoryPath}`);
        const newRepo = repository.cwd(repositoryPath).status(function (err, data) {
            if (err) reject(err);
            else {
                repository = newRepo;
                resolve(data);
            }
        });
    });
}

export default {
    executeCommand: executeCommand,
    openRepository: openRepository
};

/**
 * A function with no parameters and no return value expected.
 * @callback action
 */

 /**
  * A type which describes a file.
  * @typedef FileDescriptor
  * @type {Object}
  * @property {string} filePath - The full path of the file.
  * @property {boolean} isDirectory - The flag indicating if it's a directory.
  */
