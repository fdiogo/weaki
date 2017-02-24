import {app, BrowserWindow, Menu, ipcMain} from 'electron';
import path from 'path';
import url from 'url';

import CommandRegistry from './src/command-registry';
import OpenFileCommand from './src/commands/open-file-command';
import SaveFileCommand from './src/commands/save-file-command';
import CloseFileCommand from './src/commands/close-file-command';
import MenuTemplate from './src/menu-template';

const commandRegistry = new CommandRegistry();
const commandStack = [];

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
    commandRegistry.register('editor:open-file', OpenFileCommand);
    commandRegistry.register('editor:save-file', SaveFileCommand);
    commandRegistry.register('editor:close-file', CloseFileCommand);
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

export default {
    executeCommand: executeCommand
};

/**
 * A function with no parameters and no return value expected.
 * @callback action
 */
