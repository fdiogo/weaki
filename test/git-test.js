import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import bluebird from 'bluebird';
import fs from 'fs';
import rimraf from 'rimraf';
import path from 'path';
import SimpleGit from 'simple-git';
import Git from '../src/git';

const fsAsync = bluebird.promisifyAll(fs);
const SimpleGitAsync = bluebird.promisifyAll(SimpleGit());
chai.use(chaiAsPromised);
chai.should();

let TMP_DIR;
let REPO_DIR;
const README_ORIGINAL_CONTENT = 'Hello';

describe('Git', function () {
    before(function () {
        return fsAsync.mkdtempAsync(path.join('..', 'tmp'))
            .then(folderPath => {
                TMP_DIR = folderPath;
                REPO_DIR = path.join(TMP_DIR, 'repo');
                return fsAsync.mkdirAsync(REPO_DIR);
            })
            .then(() => SimpleGitAsync.cwdAsync(REPO_DIR))
            .then(() => SimpleGitAsync.initAsync(false))
            .then(() => SimpleGitAsync.addConfigAsync('user.email', 'john.doe@gmail.com'))
            .then(() => SimpleGitAsync.addConfigAsync('user.name', 'johndoe'))
            .then(() => fsAsync.appendFileAsync(path.join(REPO_DIR, 'README'), README_ORIGINAL_CONTENT))
            .then(() => SimpleGitAsync.addAsync(['README']))
            .then(() => SimpleGitAsync.commitAsync('First commit'));
    });

    after(function (done) {
        rimraf(TMP_DIR, function (err) {
            if (err) throw err;
            else done();
        });
    });

    describe('between calls', function () {
        it('maintain state', function () {
            const instance = new Git();
            instance.openRepository(REPO_DIR).then(() => instance.checkout()).should.be.fulfilled;
        });
    });

    describe('#openRepository', function () {
        it('return the repository status', function () {
            const instance = new Git();
            return instance.openRepository(REPO_DIR).should.be.fulfilled;
        });

        it('error when opening a directory which is not a repository', function () {
            const instance = new Git();
            return instance.openRepository(TMP_DIR).should.be.rejected;
        });
    });

    describe('#checkout', function () {
        it('reset all files to HEAD with no arguments', function () {
            const instance = new Git();
            const readmePath = path.join(REPO_DIR, 'README');
            return instance.openRepository(REPO_DIR)
                .then(() => fsAsync.appendFileAsync(readmePath, ' Bye'))
                .then(() => instance.checkout())
                .then(() => fsAsync.readFileAsync(readmePath, 'utf8'))
                .should.become(README_ORIGINAL_CONTENT);
        });
    });

    describe('#getCommitsForFile', function () {
        it('work with an absolute path', function () {
            const instance = new Git();
            const readmePath = path.join(path.resolve(process.cwd(), REPO_DIR), 'README');
            return instance.openRepository(REPO_DIR)
                .then(() => instance.getCommitsForFile(readmePath))
                .should.eventually.have.property('total').equal(1);
        });
    });
});
