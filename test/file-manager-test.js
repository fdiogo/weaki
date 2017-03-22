import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mockFs from 'mock-fs';
import FileManager from '../src/file-manager';
import path from 'path';
import fs from 'fs';

chai.use(chaiAsPromised);
chai.should();
const expect = chai.expect;

describe('FileManager', function () {
    describe('#watchFileChange', function () {
        const rootInstance = new FileManager();
        const rootFileName = 'file.txt';
        let tmpDir;

        before(function () {
            return rootInstance.makeTemporaryDirectory(path.join('..', 'tmp'))
                .then(completeName => {
                    tmpDir = completeName;
                    rootInstance.createFile(path.join(tmpDir, rootFileName));
                });
        });

        after(function () {
            return rootInstance.removeDirectory(tmpDir, true);
        });

        it('detect internal changes', function (done) {
            const instance = new FileManager();
            const filePath = path.join(tmpDir, rootFileName);
            instance.watchFileChange(filePath, (path, isExternal) => {
                path.should.equal(filePath);
                isExternal.should.be.false;
                expect(instance.fileSaves).property(filePath).to.exist;
                expect(instance.fileSaves).property(filePath).property('size').to.equal(0);
                done();
            });
            instance.writeFile(filePath, 'new content').should.be.fulfilled;
        });

        it('detect external changes', function (done) {
            const instance = new FileManager();
            const filePath = path.join(tmpDir, rootFileName);
            instance.watchFileChange(filePath, (path, isExternal) => {
                path.should.equal(filePath);
                isExternal.should.be.true;
                expect(instance.fileSaves).property(filePath).to.exist;
                expect(instance.fileSaves).property(filePath).property('size').to.equal(0);
                done();
            });

            fs.writeFile(filePath, 'new content');
        });
    });

    describe('#readDirectory', function () {
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

        it('work non-recursively by default', function (done) {
            const instance = new FileManager();
            instance.readDirectory('root', false).should.be.fulfilled.then(files => {
                files.length.should.equal(2);
                const paths = files.map(file => file.path);
                paths.should.include.members([
                    path.join('root', 'directory'),
                    path.join('root', 'root-file.txt')
                ]);
            }).should.notify(done);
        });

        it('work recursively when specified', function (done) {
            const instance = new FileManager();
            instance.readDirectory('root', true).should.be.fulfilled.then(files => {
                files.length.should.equal(4);
                const paths = files.map(file => file.path);
                paths.should.include.members([
                    path.join('root', 'directory'),
                    path.join('root', 'root-file.txt'),
                    path.join('root', 'directory', 'subdirectory'),
                    path.join('root', 'directory', 'subdirectory', 'file.txt')
                ]);
            }).should.notify(done);
        });
    });
});
