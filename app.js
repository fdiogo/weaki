const {app, BrowserWindow, globalShortcut} = require('electron');
const path = require('path');
const url = require('url');

const templatesDirectory = path.join(__dirname, 'templates');
const mainWindowPath = path.join(templatesDirectory, 'window.jade');

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        title: 'Weaki'
    });

    mainWindow.loadURL(url.format({
        pathname: mainWindowPath,
        protocol: 'file',
        slashes: true
    }));

    mainWindow.webContents.on('did-finish-load', () => {
    });

    globalShortcut.register('Control+D', () => {
        mainWindow.reload();
    });
});
