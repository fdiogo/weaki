import explorer from './components/explorer/explorer';
import EventRegistry from 'event-registry';

const eventRegistry = new EventRegistry();

eventRegistry.on('editor:file-opened', fileDescriptor => {
    explorer.addFile(fileDescriptor.path);
});
