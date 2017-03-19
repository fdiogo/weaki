import { app } from 'electron';
import keymap from './keymaps';
import weaki from '../app.js';

/**
 * @class MenuTemplate
 **/
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
                        label: 'Open Repository...',
                        accelerator: keymap['application:open-repository'],
                        click: weaki.executeCommand.bind(null, 'application:open-repository', null)
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
                        label: 'Header',
                        submenu: [
                            {
                                label: 'Header 1',
                                accelerator: keymap['editor:header-1'],
                                click: weaki.executeCommand.bind(null, 'editor:header', 1)
                            },
                            {
                                label: 'Header 2',
                                accelerator: keymap['editor:header-2'],
                                click: weaki.executeCommand.bind(null, 'editor:header', 2)
                            },
                            {
                                label: 'Header 3',
                                accelerator: keymap['editor:header-3'],
                                click: weaki.executeCommand.bind(null, 'editor:header', 3)
                            },
                            {
                                label: 'Header 4',
                                accelerator: keymap['editor:header-4'],
                                click: weaki.executeCommand.bind(null, 'editor:header', 4)
                            },
                            {
                                label: 'Header 5',
                                accelerator: keymap['editor:header-5'],
                                click: weaki.executeCommand.bind(null, 'editor:header', 5)
                            },
                            {
                                label: 'Header 6',
                                accelerator: keymap['editor:header-6'],
                                click: weaki.executeCommand.bind(null, 'editor:header', 6)
                            }
                        ]
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
                        label: 'Strike Through',
                        accelerator: keymap['editor:strike-through'],
                        click: weaki.executeCommand.bind(null, 'editor:strike-through', null)
                    },
                    {
                        label: 'Blockquote',
                        accelerator: keymap['editor:blockquote'],
                        click: weaki.executeCommand.bind(null, 'editor:blockquote', null)
                    },
                    {
                        label: 'Code',
                        accelerator: keymap['editor:code'],
                        click: weaki.executeCommand.bind(null, 'editor:code', null)
                    },
                    {
                        label: 'Horizontal Rule',
                        accelerator: keymap['editor:horizontal-rule'],
                        click: weaki.executeCommand.bind(null, 'editor:horizontal-rule', null)
                    },
                    {
                        label: 'Link',
                        accelerator: keymap['editor:link'],
                        click: weaki.executeCommand.bind(null, 'editor:link', null)
                    },
                    {
                        label: 'Image',
                        accelerator: keymap['editor:image'],
                        click: weaki.executeCommand.bind(null, 'editor:image', null)
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
                        label: 'Table',
                        accelerator: keymap['editor:table'],
                        click: weaki.executeCommand.bind(null, 'editor:table', null)
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
                label: 'Git',
                submenu: [
                    {
                        label: 'Open Commit',
                        accelerator: keymap['git:open-commit'],
                        click: weaki.executeCommand.bind(null, 'git:open-commit')
                    },
                    {
                        label: 'Fetch',
                        accelerator: keymap['git:fetch'],
                        click: weaki.executeCommand.bind(null, 'git:fetch', null)
                    },
                    {
                        label: 'Checkout',
                        accelerator: keymap['git:checkout'],
                        click: weaki.executeCommand.bind(null, 'git:checkout', 'HEAD', ['.'])
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
