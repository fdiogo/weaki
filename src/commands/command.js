/**
 * The base class for all Commands.
 */
class Command {

    /**
     * @param {action} execute - The action to perform when the command is executed.
     * @param {action} [undo] - The action to perform when the command is reversed.
     */
    constructor (execute, undo) {
        this.execute = () => Promise.resolve(execute());
        this.undo = () => Promise.resolve(undo());
    }

}

export default Command;
