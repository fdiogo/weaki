import {app, BrowserWindow, globalShortcut, Menu} from 'electron';
import path from 'path';
import url from 'url';

import CommandRegistry from './src/command-registry';
import EventRegistry from './src/event-registry';
import OpenFileCommand from './src/commands/open-file-command';
import KeyMaps from './src/keymaps';
import MenuTemplate from './src/menu-template';

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
    createMenu();
    registerEvents();
});

function registerCommands () {
    commandRegistry.register('editor:open-file', new OpenFileCommand());
}

function registerShortcuts () {
    globalShortcut.register(KeyMaps['editor:open-file'], triggerCommand.bind(null, 'editor:open-file', null));
}

function createMenu () {
    const menu = Menu.buildFromTemplate(MenuTemplate);
    Menu.setApplicationMenu(menu);
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

export default {
    triggerCommand: triggerCommand
};
