import { app } from 'electron';
import keymap from './keymaps';
import weaki from '../app.js';

class MenuTemplate {

    constructor () {
        this.value = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Open File...',
                        accelerator: keymap['application:open-file'],
                        click: weaki.executeCommand.bind(null, 'application:open-file', null)
                    },
                    {
                        label: 'Save',
                        accelerator: keymap['application:save-file'],
                        click: weaki.executeCommand.bind(null, 'application:save-file', null)
                    },
                    {
                        label: 'Close',
                        accelerator: keymap['application:close-file'],
                        click: weaki.executeCommand.bind(null, 'application:close-file', null)
                    },
                    {
                        role: 'quit',
                        accelerator: keymap['application:close-file']
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    {
                        role: 'undo'
                    },
                    {
                        role: 'redo'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Bold',
                        accelerator: keymap['editor:bold'],
                        click: weaki.executeCommand.bind(null, 'editor:bold', null)
                    },
                    {
                        label: 'Italic',
                        accelerator: keymap['editor:italic'],
                        click: weaki.executeCommand.bind(null, 'editor:italic', null)
                    },
                    {
                        label: 'Underline',
                        accelerator: keymap['editor:underline'],
                        click: weaki.executeCommand.bind(null, 'editor:underline', null)
                    },
                    {
                        label: 'Strike Through',
                        accelerator: keymap['editor:strike-through'],
                        click: weaki.executeCommand.bind(null, 'editor:strike-through', null)
                    },
                    {
                        label: 'Link',
                        accelerator: keymap['editor:link'],
                        click: weaki.executeCommand.bind(null, 'editor:link', null)
                    },
                    {
                        label: 'Header 1',
                        accelerator: keymap['editor:header'],
                        click: weaki.executeCommand.bind(null, 'editor:header', 1)
                    },
                    {
                        label: 'Unordered List',
                        accelerator: keymap['editor:unordered-list'],
                        click: weaki.executeCommand.bind(null, 'editor:unordered-list', null)
                    },
                    {
                        label: 'Ordered List',
                        accelerator: keymap['editor:ordered-list'],
                        click: weaki.executeCommand.bind(null, 'editor:ordered-list', null)
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'cut'
                    },
                    {
                        role: 'copy'
                    },
                    {
                        role: 'paste'
                    },
                    {
                        role: 'pasteandmatchstyle'
                    },
                    {
                        role: 'delete'
                    },
                    {
                        role: 'selectall'
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        role: 'reload'
                    },
                    {
                        role: 'toggledevtools'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'resetzoom'
                    },
                    {
                        role: 'zoomin'
                    },
                    {
                        role: 'zoomout'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'togglefullscreen'
                    }
                ]
            },
            {
                role: 'window',
                submenu: [
                    {
                        role: 'minimize'
                    },
                    {
                        role: 'close'
                    }
                ]
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'Learn More',
                        click () { require('electron').shell.openExternal('http://electron.atom.io'); }
                    }
                ]
            }
        ];

        if (process.platform === 'darwin') {
            this.value.unshift({
                label: app.getName(),
                submenu: [
                    {
                        role: 'about'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'services',
                        submenu: []
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'hide'
                    },
                    {
                        role: 'hideothers'
                    },
                    {
                        role: 'unhide'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'quit'
                    }
                ]
            });
            // Edit menu.
            this.value[1].submenu.push(
                {
                    type: 'separator'
                },
                {
                    label: 'Speech',
                    submenu: [
                        {
                            role: 'startspeaking'
                        },
                        {
                            role: 'stopspeaking'
                        }
                    ]
                }
            );
            // Window menu.
            this.value[3].submenu = [
                {
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                },
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                },
                {
                    label: 'Zoom',
                    role: 'zoom'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Bring All to Front',
                    role: 'front'
                }
            ];
        }
    }

}

export default MenuTemplate;
