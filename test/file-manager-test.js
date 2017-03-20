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
        it('work recursively', function (done) {
            const instance = new FileManager();
            instance.readDirectory('root', true).should.be.fulfilled.then(files => {
                files.length.should.equal(4);
            }).should.notify(done);
        });
    });
});
