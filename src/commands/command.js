/**
 * The base class for all Commands.
 */
class Command {

    /**
     * @param {action} execute - The action to perform when the command is executed.
     * @param {action} [undo] - The action to perform when the command is reversed.
     */
    constructor (execute, undo) {
        this.execute = execute;
        this.undo = undo;
    }

}

export default Command;
