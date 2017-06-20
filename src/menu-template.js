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
                        click: function () { weaki.executeCommand('application:open-file'); }
                    },
                    {
                        label: 'New File',
                        accelerator: keymap['application:new-file'],
                        click: function () { weaki.executeCommand('application:new-file'); }
                    },
                    {
                        label: 'Open Repository...',
                        accelerator: keymap['application:open-repository'],
                        click: function () { weaki.executeCommand('application:open-repository'); }
                    },
                    {
                        label: 'Save File',
                        accelerator: keymap['application:save-file'],
                        click: function () { weaki.executeCommand('application:save-file'); }
                    },
                    {
                        label: 'Close File',
                        accelerator: keymap['application:close-file'],
                        click: function () { weaki.executeCommand('application:close-file'); }
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
                                click: function () { weaki.executeCommand('editor:header', 1); }
                            },
                            {
                                label: 'Header 2',
                                accelerator: keymap['editor:header-2'],
                                click: function () { weaki.executeCommand('editor:header', 2); }
                            },
                            {
                                label: 'Header 3',
                                accelerator: keymap['editor:header-3'],
                                click: function () { weaki.executeCommand('editor:header', 3); }
                            },
                            {
                                label: 'Header 4',
                                accelerator: keymap['editor:header-4'],
                                click: function () { weaki.executeCommand('editor:header', 4); }
                            },
                            {
                                label: 'Header 5',
                                accelerator: keymap['editor:header-5'],
                                click: function () { weaki.executeCommand('editor:header', 5); }
                            },
                            {
                                label: 'Header 6',
                                accelerator: keymap['editor:header-6'],
                                click: function () { weaki.executeCommand('editor:header', 6); }
                            }
                        ]
                    },
                    {
                        label: 'Bold',
                        accelerator: keymap['editor:bold'],
                        click: function () { weaki.executeCommand('editor:bold'); }
                    },
                    {
                        label: 'Italic',
                        accelerator: keymap['editor:italic'],
                        click: function () { weaki.executeCommand('editor:italic'); }
                    },
                    {
                        label: 'Strike Through',
                        accelerator: keymap['editor:strike-through'],
                        click: function () { weaki.executeCommand('editor:strike-through'); }
                    },
                    {
                        label: 'Blockquote',
                        accelerator: keymap['editor:blockquote'],
                        click: function () { weaki.executeCommand('editor:blockquote'); }
                    },
                    {
                        label: 'Code',
                        accelerator: keymap['editor:code'],
                        click: function () { weaki.executeCommand('editor:code'); }
                    },
                    {
                        label: 'Horizontal Rule',
                        accelerator: keymap['editor:horizontal-rule'],
                        click: function () { weaki.executeCommand('editor:horizontal-rule'); }
                    },
                    {
                        label: 'Link',
                        accelerator: keymap['editor:link'],
                        click: function () { weaki.executeCommand('editor:link'); }
                    },
                    {
                        label: 'Image',
                        accelerator: keymap['editor:image'],
                        click: function () { weaki.executeCommand('editor:image'); }
                    },
                    {
                        label: 'Unordered List',
                        accelerator: keymap['editor:unordered-list'],
                        click: function () { weaki.executeCommand('editor:unordered-list'); }
                    },
                    {
                        label: 'Ordered List',
                        accelerator: keymap['editor:ordered-list'],
                        click: function () { weaki.executeCommand('editor:ordered-list'); }
                    },
                    {
                        label: 'Table',
                        accelerator: keymap['editor:table'],
                        click: function () { weaki.executeCommand('editor:table'); }
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
                        click: function () { weaki.executeCommand('git:push', 'origin', 'master'); }
                    },
                    {
                        label: 'Fetch Changes',
                        accelerator: keymap['git:fetch'],
                        click: function () { weaki.executeCommand('git:fetch'); }
                    },
                    {
                        label: 'Checkout All',
                        accelerator: keymap['git:checkout'],
                        click: function () { weaki.executeCommand('git:checkout', 'HEAD', ['.']); }
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Preview',
                        accelerator: keymap['view:preview'],
                        click: function () { weaki.executeCommand('application:open-on-right-sidebar', '/preview'); }
                    },
                    {
                        label: 'Commit',
                        accelerator: keymap['view:git-commit'],
                        click: function () { weaki.executeCommand('application:open-on-right-sidebar', '/git/commit'); }
                    },
                    {
                        label: 'File History',
                        accelerator: keymap['view:file-history'],
                        click: function () { weaki.executeCommand('application:open-on-right-sidebar', '/history'); }
                    },
                    {
                        label: 'Templates',
                        accelerator: keymap['view:templates'],
                        click: function () { weaki.executeCommand('application:open-on-right-sidebar', '/templates'); }
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
