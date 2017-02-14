const {app, BrowserWindow, globalShortcut} = require('electron');
const path = require('path');
const url = require('url');

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        title: 'Weaki'
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src', 'window.html'),
        protocol: 'file',
        slashes: true
    }));

    mainWindow.webContents.on('did-finish-load', () => {
    });

    globalShortcut.register('Control+D', () => {
        mainWindow.reload();
    });
});
