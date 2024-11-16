const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = class extends ButtonBuilder {
    constructor(data = {}) {
        super(data);
    }

    static success(customId, label) {
        return new ButtonBuilder()
            .setCustomId(customId)
            .setLabel(label)
            .setStyle(ButtonStyle.Success);
    }

    static danger(customId, label) {
        return new ButtonBuilder()
            .setCustomId(customId)
            .setLabel(label)
            .setStyle(ButtonStyle.Danger);
    }

    static link(url, label) {
        return new ButtonBuilder()
            .setURL(url)
            .setLabel(label)
            .setStyle(ButtonStyle.Link);
    }
};
