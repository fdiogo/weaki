import { app } from 'electron';
import weaki from '../app.js';
import path from 'path';
import fs from 'fs';

/**
 * @class MenuTemplate
 **/
class MenuTemplate {

    constructor () {
        const keymap = JSON.parse(fs.readFileSync(path.join('configs', 'keymaps.json'), 'utf8'));

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
                        label: 'Save File',
                        accelerator: keymap['application:save-file'],
                        click: weaki.executeCommand.bind(null, 'application:save-file', null, null)
                    },
                    {
                        label: 'Close File',
                        accelerator: keymap['application:close-file'],
                        click: weaki.executeCommand.bind(null, 'application:close-file', null)
                    },
                    {
                        role: 'quit',
                        accelerator: keymap['application:quit']
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    {
                        role: 'undo',
                        accelerator: keymap['edit:undo']
                    },
                    {
                        role: 'redo',
                        accelerator: keymap['edit:redo']
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
                        role: 'cut',
                        accelerator: keymap['edit:cut']
                    },
                    {
                        role: 'copy',
                        accelerator: keymap['edit:copy']
                    },
                    {
                        role: 'paste',
                        accelerator: keymap['edit:paste']
                    },
                    {
                        role: 'delete',
                        accelerator: keymap['edit:delete']
                    },
                    {
                        role: 'selectall',
                        accelerator: keymap['edit:select-all']
                    }
                ]
            },
            {
                label: 'Git',
                submenu: [
                    {
                        label: 'Push All',
                        accelerator: keymap['git:push'],
                        click: weaki.executeCommand.bind(null, 'git:push', 'origin', 'master')
                    },
                    {
                        label: 'Fetch Changes',
                        accelerator: keymap['git:fetch'],
                        click: weaki.executeCommand.bind(null, 'git:fetch', null)
                    },
                    {
                        label: 'Checkout All',
                        accelerator: keymap['git:checkout'],
                        click: weaki.executeCommand.bind(null, 'git:checkout', 'HEAD', ['.'])
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Preview',
                        accelerator: keymap['view:preview'],
                        click: weaki.executeCommand.bind(null, 'application:open-on-right-sidebar', '/preview')
                    },
                    {
                        label: 'Commit',
                        accelerator: keymap['view:git-commit'],
                        click: weaki.executeCommand.bind(null, 'application:open-on-right-sidebar', '/git/commit')
                    },
                    {
                        label: 'File History',
                        accelerator: keymap['view:file-history'],
                        click: weaki.executeCommand.bind(null, 'application:open-on-right-sidebar', '/history')
                    },
                    {
                        role: 'toggledevtools',
                        accelerator: keymap['view:toggle-dev-tools']
                    },
                    {
                        role: 'reload',
                        accelerator: keymap['view:reload']
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'resetzoom',
                        accelerator: keymap['view:reset-zoom']
                    },
                    {
                        role: 'zoomin',
                        accelerator: keymap['view:zoom-in']
                    },
                    {
                        role: 'zoomout',
                        accelerator: keymap['view:zoom-out']
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'togglefullscreen',
                        accelerator: keymap['view:fullscreen']
                    }
                ]
            }
            // {
            //     role: 'window',
            //     submenu: [
            //         {
            //             role: 'minimize'
            //         },
            //         {
            //             role: 'close'
            //         }
            //     ]
            // },
            // {
            //     role: 'help',
            //     submenu: [
            //         {
            //             label: 'Learn More',
            //             click () { require('electron').shell.openExternal('http://electron.atom.io'); }
            //         }
            //     ]
            // }
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
