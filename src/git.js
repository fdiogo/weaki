import SimpleGit from 'simple-git';

/**
 * A wrapper to the 'simple-git' package which promisifies some operations.
 * @class Git
 */
class Git {

    constructor () {
        this.gitInterface = SimpleGit();
    }

    /**
     * Adds files to the staging area.
     * @param {string|string[]} [files='./*'] - The files to add.
     * @returns {Promise.<void, Error>} A promise to the operation.
     */
    add (files = './*') {
        return new Promise((resolve, reject) => {
            this.gitInterface.add(files, error => {
                if (error) reject(new Error(error));
                else resolve();
            });
        });
    }

    /**
     * Checkouts a collection of files to a specific commit.
     * @param {string} [commitHash = 'HEAD'] - The hash of the commit.
     * @param {string|string[]} [fileGlobs = '.'] - The files to checkout.
     * @returns {Promise.<Object, Error>} A promise to the checkout operation.
     */
    checkout (commitHash = 'HEAD', fileGlobs = '.') {
        if (typeof fileGlobs === 'string')
            fileGlobs = [fileGlobs];

        return new Promise((resolve, reject) => {
            this.gitInterface.checkout([commitHash, ...fileGlobs], function (err, data) {
                if (err) reject(new Error(err));
                resolve(data);
            });
        });
    }

    /**
     * Creates a commit with a message.
     * @param {string|string[]} message - A single string or a collection of lines to be used as the message.
     * @returns {Promise.<Object, Error>} - A promise to the commit.
     */
    commit (message) {
        return new Promise((resolve, reject) => {
            this.gitInterface.commit(message, (error, commit) => {
                if (error) reject(new Error(error));
                else resolve(commit);
            });
        });
    }

    /**
     * @param {string} [remote] - The remote repository.
     * @param {string} [branch] - The branch of the repository.
     * @returns {Promise.<void, Error>} A promise to the operation.
     */
    push (remote, branch) {
        return new Promise((resolve, reject) => {
            this.gitInterface.push(remote, branch, error => {
                if (error) reject(new Error(error));
                else resolve();
            });
        });
    }

    /**
     * Opens an existing local git repository.
     * @param {string} repositoryPath - The repository path.
     * @returns {Promise.<Object, Error>} - A promise to the repository status.
     */
    openRepository (repositoryPath) {
        return new Promise((resolve, reject) => {
            this.gitInterface.cwd(repositoryPath).status(function (err, data) {
                if (err)
                    reject(new Error(err));
                else
                    resolve(data);
            });
        });
    }

    /**
     * Fetches the remote changes of the current git repository.
     * @returns {Promise.<Object, Error>} A promise to the remote changes.
     */
    fetchChanges () {
        return this.status().then(new Promise((resolve, reject) => {
            this.gitInterface.fetch((error, data) => {
                if (error)
                    reject(new Error(`Something went wrong while fetching remote changes. Details: ${error}`));
                else
                    resolve(data);
            });
        }));
    }

    /**
     * Obtains the status of the currently open repository.
     * @returns {Promise.<Object, Error>} A promise to the repository status.
     */
    status () {
        return new Promise((resolve, reject) => {
            this.gitInterface.status((error, data) => {
                if (error) reject(new Error('There is no open repository!'));
                else resolve(data);
            });
        });
    }

    /**
     * Obtains all the commits where a specific file was changed.
     * @returns {Promise.<Object, Error>} A promise to the commits.
     */
    getCommitsForFile (filePath) {
        return new Promise((resolve, reject) => {
            this.gitInterface.log({ file: filePath }, function (err, data) {
                if (err) reject(new Error(err));
                else resolve(data);
            });
        });
    }

    /**
     * Tests a directory as a git repository.
     * @returns {Promise.<boolean>} A promise to the answer.
     */
    isRepository (directory) {
        return new Promise(function (resolve, reject) {
            SimpleGit(directory).status((error, data) => {
                if (error) resolve(false);
                else resolve(true);
            });
        });
    }
}

export default Git;
