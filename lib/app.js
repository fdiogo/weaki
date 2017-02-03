const {app, BrowserWindow} = require('electron');
const path = require('path');

const templatesDirectory = path.join(__dirname, '..', 'templates');
const mainWindowPath = path.join(templatesDirectory, 'window-main.jade');

app.on('ready', () => {
  const mainWindow = new BrowserWindow({ title: 'Weaki' });
  mainWindow.loadURL(`file:///${mainWindowPath}`);
  mainWindow.webContents.on('did-finish-load', () => {
    
  });
});
