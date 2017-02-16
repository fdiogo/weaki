import Remote from 'electron';
import Command from 'command';

class OpenFileCommand extends Command {
}

function openFile () {
    Remote.dialog.showOpenDialog({
        title: 'Open File',
        multiSelections: false,
        defaultPath: Remote.app.getPath('desktop')
    },
}
