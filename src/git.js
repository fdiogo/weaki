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
        return new Promise(function (resolve, reject) {
            this.gitInterface.status((error) => {
                if (error) reject('There is no open repository!');
                this.gitInterface.fetch((error, data) => {
                    if (error)
                        reject(new Error(`Something went wrong while fetching remote changes. Details: ${error}`));
                    else
                        resolve(data);
                });
            });
        });
    }

    /**
     * Checkouts a collection of files to a specific commit.
     * @returns {Promise.<Object, Error>} A promise to the checkout operation.
     */
    checkout (commitHash = 'HEAD', fileGlobs = ['.']) {
        return new Promise((resolve, reject) => {
            this.gitInterface.checkout([commitHash, ...fileGlobs], function (err, data) {
                if (err) reject(new Error(err));
                resolve(data);
            });
        });
    }

}

export default Git;
