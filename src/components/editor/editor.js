const fs = require('fs');
const remote = require('electron').remote;

const saveButton = document.getElementById('save');
const pageContent = document.getElementById('page-content');

function save () {
    console.log('someone pressed Save!');

    remote.dialog.showOpenDialog({
        title: 'Save..',
        multiSelections: false,
        defaultPath: remote.app.getPath('desktop')
    }, (files) => {
        if (files === undefined || files.length !== 1)
            return;

        let savePath = files[0];
        fs.writeFileSync(savePath, pageContent.value);
    });
}
