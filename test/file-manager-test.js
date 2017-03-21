import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mockFs from 'mock-fs';
import FileManager from '../src/file-manager';

chai.use(chaiAsPromised);
chai.should();

describe('FileManager', function () {
    before(function () {
        mockFs({
            'root': {
                'directory': {
                    'subdirectory': {
                        'file.txt': 'content'
                    }
                },
                'root-file.txt': 'content'
            }
        });
    });

    after(function () {
        mockFs.restore();
    });

    describe('readDirectory', function () {
        it('work non-recursively by default', function (done) {
            const instance = new FileManager();
            instance.readDirectory('root', false).should.be.fulfilled.then(files => {
                files.length.should.equal(2);
                const paths = files.map(file => file.path);
                paths.should.include.members(['root/directory', 'root/root-file.txt']);
            }).should.notify(done);
        });

        it('work recursively when specified', function (done) {
            const instance = new FileManager();
            instance.readDirectory('root', true).should.be.fulfilled.then(files => {
                files.length.should.equal(4);
                const paths = files.map(file => file.path);
                paths.should.include.members(['root/directory',
                    'root/root-file.txt',
                    'root/directory/subdirectory',
                    'root/directory/subdirectory/file.txt']);
            }).should.notify(done);
        });
    });
});
