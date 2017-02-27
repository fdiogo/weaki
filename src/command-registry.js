/**
 * A registry for command classes stored and fetched by a selector.
 */
class CommandRegistry {

    constructor () {
        this.registeredCommands = {};
    }

    /**
     * Registers a command class with an identifier.
     * @param {string} selector - The command identifier.
     * @param {Command} commandClass - A Command class.
     */
    register (selector, commandClass) {
        this.registeredCommands[selector] = commandClass;
    }

    /**
     * Fetches a command class by its selector.
     * @param {string} selector - The command identifier.
     * @returns {Command} The respective Command class.
     */
    get (selector) {
        return this.registeredCommands[selector];
    }

}

export default CommandRegistry;
