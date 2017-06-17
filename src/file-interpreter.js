import path from 'path';

class FileInterpreter {

    constructor (fileManager, codeInterpreters = []) {
        this.fileManager = fileManager;
        this.codeInterpreters = codeInterpreters;

        this.interpretedFiles = {};
        this.interpretersByType = {};
        this.interpretersByExtension = {};

        for (let interpreter of this.codeInterpreters) {
            const types = interpreter.fileType instanceof Array ? interpreter.fileType : [interpreter.fileType];
            const extensions = interpreter.fileExtension instanceof Array
                ? interpreter.fileExtension
                : [interpreter.fileExtension];

            for (let type of types) {
                try {
                    this.registerInterpreterByType(interpreter, type);
                } catch (error) {
                    console.log(error);
                }
            }

            for (let extension of extensions) {
                try {
                    this.registerInterpreterByFileExtension(interpreter, extension);
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    registerInterpreterByType (interpreter, fileType) {
        if (!interpreter || !fileType)
            throw new Error('Both the interpreter and its file type must be provided.');

        if (this.interpretersByType[fileType])
            throw new Error(`There's already an existing interpreter for ${fileType}.`);

        this.interpretersByType[fileType] = interpreter;
    }

    registerInterpreterByFileExtension (interpreter, fileExtension) {
        if (!interpreter || !fileExtension)
            throw new Error('Both the interpreter and its file extension must be provided.');

        if (this.interpretersByExtension[fileExtension])
            throw new Error(`There's already an existing interpreter for .${fileExtension} files.`);

        this.interpretersByExtension[fileExtension] = interpreter;
    }

    /**
     * @typedef {object} FileSection
     * @property {number} start The start index of the section.
     * @property {number} end The end index of the section.
     * @property {string} name The section's name.
     */

    /**
     * Interprets a file returning its type and relevant sections based on the language.
     * @returns {Promise.<FileSection[], Error>}
     */
    interpretFile (filePath, fileType) {
        if (!filePath)
            throw new Error('No file path was provided');

        const cached = this.interpretedFiles[filePath];
        if (cached)
            return Promise.resolve(cached);

        let interpreter = null;
        if (fileType)
            interpreter = this.interpretersByType[fileType];
        else {
            const extension = path.parse(filePath).ext;
            if (!extension)
                throw new Error('No file type was provided and no extension could be found.');

            const extensionWithoutDot = extension.substring(1);
            interpreter = this.interpretersByExtension[extensionWithoutDot];
            if (interpreter)
                fileType = interpreter.fileType;
        }

        if (!interpreter)
            throw new Error(`No interpreter was found for the file ${filePath}.`);

        const promise = this.fileManager.readFile(filePath)
            .then(text => {
                const sections = interpreter.getSections(text);
                const result = {
                    text: text,
                    sections: sections,
                    type: fileType
                };

                this.interpretedFiles[filePath] = result;
                return result;
            });

        return promise;
    }

};

export default FileInterpreter;
