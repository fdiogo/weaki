import { expect } from 'chai';
import path from 'path';
import FileTree from '../src/file-tree';

const ROOT = process.platform === 'win32' ? 'C:\\' : '/';

describe('FileTree', function () {
    describe('#addDirectory()', function () {
        it('create a root node when necessary', function () {
            const fileTree = new FileTree();
            const rootCountAtStart = Object.keys(fileTree.root.children).length;
            fileTree.addDirectory(path.join(ROOT, 'asd'));
            const rootCountAfterAddition = Object.keys(fileTree.root.children).length;

            expect(rootCountAtStart).to.equal(0);
            expect(rootCountAfterAddition).to.equal(1);
            expect(fileTree.root.hasChild(ROOT)).to.be.true;
        });

        it('create intermediate nodes as directories if necessary', function () {
            const fileTree = new FileTree();
            const node = fileTree.addDirectory('/a/b/c');

            expect(node.parent.name).to.equal('b');
            expect(node.parent.isDirectory).to.be.true;
            expect(node.parent.children['c']).to.exist;
            expect(node.parent.parent.name).to.equal('a');
            expect(node.parent.parent.isDirectory).to.be.true;
            expect(node.parent.parent.children['b']).to.exist;
            expect(node.parent.parent.parent.name).to.equal('/');
            expect(node.parent.parent.parent.isDirectory).to.be.true;
            expect(node.parent.parent.parent.children['a']).to.exist;
        });

        it('throw error when a relative path is supplied', function () {
            const fileTree = new FileTree();

            expect(fileTree.addDirectory.bind('asd')).to.throw();
        });
    });

    describe('#addFile()', function () {
        it('create a non-directory node', function () {
            const fileTree = new FileTree();
            const pathFormat = {
                dir: '/files',
                base: 'file.txt'
            };

            const fileNode = fileTree.addFile(path.format(pathFormat));
            expect(fileNode.name).to.equal(pathFormat.base);
            expect(fileNode.isDirectory).to.be.false;
        });

        it('throw error when a relative path is supplied', function () {
            const fileTree = new FileTree();

            expect(fileTree.addFile.bind('files/file.txt')).to.throw();
        });
    });

    describe('#getWorkspaceNode()', function () {
        it('return the first directory containing multiple directories', function () {
            const fileTree = new FileTree();
            fileTree.addDirectory(path.join(ROOT, 'home', 'user', 'Documents'));
            fileTree.addDirectory(path.join(ROOT, 'home', 'user', 'Desktop'));
            const workspaceNode = fileTree.getWorkspaceNode();

            expect(workspaceNode).to.exist;
            expect(workspaceNode.name).to.equal('user');
        });

        describe('when the tree is flat', function () {
            it('return the first directory with a file', function () {
                const fileTree = new FileTree();
                fileTree.addFile(path.join(ROOT, 'home', 'user', 'file.txt'));
                const workspaceNode = fileTree.getWorkspaceNode();

                expect(workspaceNode).to.exist;
                expect(workspaceNode.name).to.equal('user');
            });

            it('return the last directory if there are no files', function () {
                const fileTree = new FileTree();
                fileTree.addDirectory(path.join(ROOT, 'home', 'user'));
                const workspaceNode = fileTree.getWorkspaceNode();

                expect(workspaceNode).to.exist;
                expect(workspaceNode.name).to.equal('user');
            });
        });
    });

    describe('.splitPath()', function () {
        it('include root', function () {
            const fullPath = ROOT + 'users/john/documents';

            expect(FileTree.splitPath(fullPath)).to.deep.equal([ROOT, 'users', 'john', 'documents']);
        });
    });
});
