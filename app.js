import {app, BrowserWindow, Menu} from 'electron';
import path from 'path';
import url from 'url';

import CommandRegistry from './src/command-registry';
import OpenFileCommand from './src/commands/open-file-command';
import SaveFileCommand from './src/commands/save-file-command';
import MenuTemplate from './src/menu-template';

const commandRegistry = new CommandRegistry();
const commandStack = [];

app.on('ready', () => {
    const mainWindow = new BrowserWindow({title: 'Weaki'});

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
    commandRegistry.register('editor:open-file', new OpenFileCommand());
    commandRegistry.register('editor:save-file', new SaveFileCommand());
}

function createMenu () {
    const template = new MenuTemplate();
    const menu = Menu.buildFromTemplate(template.value);
    Menu.setApplicationMenu(menu);
}

function executeCommand (selector) {
    const command = commandRegistry.get(selector);
    try {
        command.execute();
        commandStack.push(command);
    } catch (error) {
        console.log(`Could not execute '${selector}'! Detailed error: ${error}`);
    }
}

export default {
    executeCommand: executeCommand
};
