const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = class extends EmbedBuilder {
    constructor(data = {}) {
        super(data);
        this.setColor(data.color || config.embedColors.default)
            .setTimestamp();
        
        if (data.footer !== false) {
            this.setFooter({ 
                text: data.footer?.text || 'Powered by muthi',
                iconURL: data.footer?.iconURL
            });
        }
    }

    setSuccessStyle() {
        return this.setColor(config.embedColors.success);
    }

    setErrorStyle() {
        return this.setColor(config.embedColors.error);
    }

    setInfoStyle() {
        return this.setColor(config.embedColors.info);
    }
};