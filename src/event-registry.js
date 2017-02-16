class EventRegistry {

    constructor () {
        this.actions = {};
    }

    register (eventType, action) {
        let registeredActions = this.actions[eventType];

        if (!registeredActions)
            this.actions[eventType] = registeredActions = [];

        registeredActions.push[action];
    }

    fire (eventType, payload) {
        let registeredActions = this.actions[eventType];

        if (!registeredActions || !(registeredActions instanceof Array))
            return;

        let action;
        for (action of registeredActions)
            action(payload);
    }

}

export default EventRegistry;
