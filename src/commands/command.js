class Command {

    // TODO make execute and undo return a promise
    constructor (execute, undo) {
        this.execute = execute;
        this.undo = undo;
    }

}

export default Command;
