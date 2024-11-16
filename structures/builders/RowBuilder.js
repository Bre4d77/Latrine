const { ActionRowBuilder } = require('discord.js');

module.exports = class extends ActionRowBuilder {
    constructor(data = {}) {
        super(data);
    }

    static from(...components) {
        const row = new ActionRowBuilder();
        row.addComponents(components);
        return row;
    }
}