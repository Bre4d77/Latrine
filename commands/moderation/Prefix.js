module.exports = {
    name: 'prefix',
    category: 'settings',
    description: 'Change the prefix for yourself or the server',
    aliases: ['setprefix'],
    usage: '<user/guild> <newPrefix>',
    examples: [
        'prefix user !',
        'prefix guild >',
        'prefix guild reset',
        'prefix user reset'
    ],
    permissions: {
        user: [],
        bot: [],
        owner: false,
        nsfw: false
    },
    args: {
        min: 2,
        max: 2,
        required: true
    },
    cooldown: 10,
    async execute(client, message, args) {
        const type = args[0].toLowerCase();
        const newPrefix = args[1];

        // Validate prefix length
        if (newPrefix !== 'reset' && (newPrefix.length > 3 || newPrefix.length < 1)) {
            return message.reply('Prefix must be between 1 and 3 characters long.');
        }

        // Handle user prefix
        if (type === 'user') {
            if (newPrefix === 'reset') {
                await client.db.prefix.delete(`user_${message.author.id}`);
                return message.reply('Your personal prefix has been reset to the server default.');
            }

            await client.db.prefix.set(`user_${message.author.id}`, newPrefix);
            return message.reply(`Your personal prefix has been set to: \`${newPrefix}\``);
        }

        // Handle guild prefix
        if (type === 'guild') {
            // Check if user has manage guild permission
            if (!message.member.permissions.has('ManageGuild')) {
                return message.reply('You need the "Manage Server" permission to change the server prefix.');
            }

            if (newPrefix === 'reset') {
                await client.db.prefix.delete(`guild_${message.guild.id}`);
                return message.reply(`Server prefix has been reset to the default: \`${client.config.defaultPrefix}\``);
            }

            await client.db.prefix.set(`guild_${message.guild.id}`, newPrefix);
            return message.reply(`Server prefix has been set to: \`${newPrefix}\``);
        }

        // Invalid type specified
        return message.reply('Invalid type. Use `user` or `guild`.');
    }
};