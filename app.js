import {app, BrowserWindow, globalShortcut} from 'electron';
import path from 'path';
import url from 'url';

import CommandRegistry from './src/command-registry';
import EventRegistry from './src/event-registry';
import OpenFileCommand from './src/commands/open-file-command';

const commandRegistry = new CommandRegistry();
const eventRegistry = new EventRegistry();

app.on('ready', () => {
    global.mainWindow = new BrowserWindow({title: 'Weaki'});

    global.mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src', 'window.html'),
        protocol: 'file',
        slashes: true
    }));

    registerCommands();
    registerShortcuts();
    registerEvents();
});

function registerCommands () {
    commandRegistry.register('editor:open-file', new OpenFileCommand());
}

function registerShortcuts () {
    globalShortcut.register('Control+O', () => triggerCommand('editor:open-file', null));
    globalShortcut.register('Control+H', () => global.mainWindow.webContents.send('editor:file-loaded', {
        filePath: '/usr/diogo/desktop/file.txt',
        contents: 'hmm'
    }));
}

function registerEvents () {
    eventRegistry.on('command-triggered', (descriptor) => {
        const command = commandRegistry.get(descriptor.selector);
        if (command)
            command.execute(descriptor.arguments);
    });
}

function triggerCommand (selector, args) {
    eventRegistry.fire('command-triggered', {
        selector: selector,
        arguments: args
    });
}
