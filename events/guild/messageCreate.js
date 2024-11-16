const { Collection } = require('discord.js')
module.exports = {
    name: 'messageCreate',
    category: 'guild',
    once: false,
    async execute(client, message) {
        if (message.author.bot) return;

        // Handle bot mention
        const mentionRegex = new RegExp(`^<@!?${client.user.id}>( )?$`);
        if (mentionRegex.test(message.content)) {
            try {
                const guildPrefix = await client.db.prefix.get(`guild_${message.guild.id}`);
                const userPrefix = await client.db.prefix.get(`user_${message.author.id}`);
                const currentPrefix = userPrefix || guildPrefix || client.config.defaultPrefix;
                
                // Check if user has NPR
                const nprUsers = await client.db.settings.get('npr_users') || [];
                const hasNPR = nprUsers.includes(message.author.id);

                const embed = {
                    color: 0x2F3136,
                    title: `👋 Hello! I'm ${client.user.username}`,
                    thumbnail: {
                        url: client.user.displayAvatarURL()
                    },
                    fields: [
                        {
                            name: '📌 Current Prefix',
                            value: `Your current prefix is \`${currentPrefix}\`\n` +
                                   `${userPrefix ? '*(Using personal prefix)*' : 
                                     guildPrefix ? '*(Using server prefix)*' : 
                                     '*(Using default prefix)*'}` +
                                   `${hasNPR ? '\n**🌟 You have No-Prefix Rights!**' : ''}`
                        },
                        {
                            name: '❓ Need Help?',
                            value: `Use \`${currentPrefix}help\` to see all commands\n` +
                                   `Use \`${currentPrefix}prefix\` to change your prefix`
                        }
                    ],
                    footer: {
                        text: `Server: ${message.guild.name}`,
                        icon_url: message.guild.iconURL()
                    },
                    timestamp: new Date()
                };

                return message.reply({ embeds: [embed] });
            } catch (error) {
                client.logger.error(`Ping response error: ${error.stack}`);
                return message.reply('There was an error while trying to respond!');
            }
        }

        // Get prefix and check NPR
        const prefix = await client.getPrefix(message);
        const nprUsers = await client.db.settings.get('npr_users') || [];
        const hasNPR = nprUsers.includes(message.author.id);

        // Get command name and args
        let args, commandName;

        if (message.content.startsWith(prefix)) {
            args = message.content.slice(prefix.length).trim().split(/ +/);
            commandName = args.shift().toLowerCase();
        } else if (hasNPR) {
            args = message.content.trim().split(/ +/);
            commandName = args.shift().toLowerCase();
        } else {
            return;
        }

        // Get command
        const command = client.commands.get(commandName) || 
                       client.commands.get(client.aliases.get(commandName));
        if (!command) return;

        
        // [permission checks, argument validation, cooldown]
        
        try {
            // Check permissions
            if (command.permissions) {
                if (command.permissions.owner && !client.config.owners.includes(message.author.id)) {
                    return message.reply('This command is owner-only!');
                }

                if (command.permissions.nsfw && !message.channel.nsfw) {
                    return message.reply('This command can only be used in NSFW channels!');
                }

                if (command.permissions.user) {
                    const missing = message.member.permissions.missing(command.permissions.user);
                    if (missing.length) {
                        return message.reply(`You're missing the following permissions: ${missing.join(', ')}`);
                    }
                }

                if (command.permissions.bot) {
                    const missing = message.guild.members.me.permissions.missing(command.permissions.bot);
                    if (missing.length) {
                        return message.reply(`I'm missing the following permissions: ${missing.join(', ')}`);
                    }
                }
            }

            // Check arguments
            if (command.args) {
                if (command.args.required && !args.length) {
                    return message.reply(`Usage: ${prefix}${command.name} ${command.usage}`);
                }

                if (command.args.min && args.length < command.args.min) {
                    return message.reply(`This command requires at least ${command.args.min} arguments!`);
                }

                if (command.args.max && args.length > command.args.max) {
                    return message.reply(`This command accepts maximum ${command.args.max} arguments!`);
                }
            }

            // Check cooldown
            if (command.cooldown) {
                const now = Date.now();
                const cooldownAmount = command.cooldown * 1000;
                const timestamps = client.cooldowns.get(command.name) || new Collection();

                if (timestamps.has(message.author.id)) {
                    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        return message.reply(`Please wait ${timeLeft.toFixed(1)} second(s) before using this command again.`);
                    }
                }

                timestamps.set(message.author.id, now);
                client.cooldowns.set(command.name, timestamps);
            }

            // Execute command
            await command.execute(client, message, args);

            // Log command usage
            if (client.config.logging.commands) {
                client.logger.command(
                    message.author.tag,
                    command.name,
                    args.join(' '),
                    message.guild.name
                );
            }

        } catch (error) {
            client.logger.error(`Command Error: ${command.name}\n${error.stack}`);
            message.reply('There was an error executing this command!');
        }
    }
};