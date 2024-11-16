const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const path = require('path');
const fs = require('fs');
const config = require('../config.js');
const Logger = require('./Logger.js');

class BotClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ]
        });

        this.commands = new Collection();
        this.aliases = new Collection();
        this.events = new Collection();
        this.addons = new Collection();
        this.cooldowns = new Collection();
        this.registeredEvents = new Set();

        this.db = {
            prefix: new QuickDB({ filePath: config.database.quickdb.prefixFile }),
            settings: new QuickDB({ filePath: config.database.quickdb.settingsFile }),
            userData: new QuickDB({ filePath: config.database.quickdb.userDataFile })
        };

        this.logger = new Logger();
        this.config = config;
        
        this.embed = require('./builders/EmbedBuilder');
        this.button = require('./builders/ButtonBuilder');
        this.row = require('./builders/RowBuilder');
        this.menu = require('./builders/MenuBuilder');
    }

    async start() {
        await this.loadHandlers();
        await this.login(this.config.token);
    }

    async loadHandlers() {
        const handlersPath = path.join(__dirname, '..', 'handlers');
        const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

        for (const file of handlerFiles) {
            delete require.cache[require.resolve(path.join(handlersPath, file))];
            const handler = require(path.join(handlersPath, file));
            await handler(this);
            this.logger.success(`Loaded handler: ${file}`);
        }
    }

    async getPrefix(message) {
        const mentionRegex = new RegExp(`^<@!?${this.user.id}> `);
        if (mentionRegex.test(message.content)) return message.content.match(mentionRegex)[0];

        const guildPrefix = await this.db.prefix.get(`guild_${message.guild.id}`);
        const userPrefix = await this.db.prefix.get(`user_${message.author.id}`);

        return userPrefix || guildPrefix || this.config.defaultPrefix;
    }

    removeAllEventListeners() {
        for (const eventName of this.eventNames()) {
            this.removeAllListeners(eventName);
        }
        this.registeredEvents.clear();
    }

    clearRequireCache() {
        const basePath = path.join(__dirname, '..');
        Object.keys(require.cache).forEach(key => {
            if (key.startsWith(basePath)) {
                delete require.cache[key];
            }
        });
    }

    async reload() {
        try {
            this.removeAllEventListeners();
            this.commands.clear();
            this.aliases.clear();
            this.events.clear();
            this.addons.clear();
            
            this.clearRequireCache();
            await this.loadHandlers();
            
            return true;
        } catch (error) {
            this.logger.error(`Reload failed: ${error.stack}`);
            throw error;
        }
    }
}

module.exports = BotClient;