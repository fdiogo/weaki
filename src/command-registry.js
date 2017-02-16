class CommandRegistry {

    constructor () {
        this.registeredCommands = {};
    }

    on (selector, action) {
        this.registeredCommands[selector] = action;
    }

    get (selector) {
        return this.registeredCommands[selector];
    }

}

export default CommandRegistry;
