const { StringSelectMenuBuilder } = require('discord.js');

module.exports = class extends StringSelectMenuBuilder {
    constructor(data = {}) {
        super(data);
    }

    static simple(customId, placeholder, options) {
        return new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .addOptions(options);
    }
};
