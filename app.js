const {app, BrowserWindow, dialog, globalShortcut} = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');
const bluebird = require('bluebird');
const src = path.join(__dirname, 'src');

const CommandRegistry = require(path.join(src, 'command-registry'));
const EventRegistry = require(path.join(src, 'event-registry'));

const commandRegistry = new CommandRegistry();
const eventRegistry = new EventRegistry();

app.on('ready', () => {
    const mainWindow = new BrowserWindow({title: 'Weaki'});

    mainWindow.loadURL(url.format({
        pathname: path.join(src, 'application.html'),
        protocol: 'file',
        slashes: true
    }));

    registerCommands();
    registerEvents();
    registerShortcuts();
});

/**
 * This function must be adapted for plugin support
 */
function registerCommands () {
    commandRegistry.register('editor:open-file', openFile);
}

function registerEvents () {
    eventRegistry.on('command-triggered', (descriptor) => {
        const command = commandRegistry.get(descriptor.selector);
        if (command)
            command.execute(descriptor.arguments);
    });
}

function registerShortcuts () {
    globalShortcut.register('CommandOrControl+O', () => triggerCommand('editor:open-file', null));
}

function triggerCommand (selector, args) {
    eventRegistry.fire('command-triggered', {
        selector: selector,
        arguments: args
    });
}

function openFile () {
    const openDialog = bluebird.promisify(dialog.showOpenDialog);

    openDialog({
        title: 'Open File',
        multiSelections: false,
        defaultPath: app.getPath('desktop')
    }).then((files) => {
        if (files === undefined || files.length !== 1)
            return;

        const filePath = files[0];
        const readFile = bluebird.promisify(fs.readFile);
        return readFile(filePath);
    }).then((fileContents) => {
        console.log(fileContents);
    });
}
