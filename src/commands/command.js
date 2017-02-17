class Command {

    constructor (execute, undo) {
        this.execute = execute;
        this.undo = undo;
    }

}

export default Command;
