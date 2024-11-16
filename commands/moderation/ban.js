module.exports = {
    name: 'ban',
    category: 'moderation',
    description: 'Bans a user from the server',
    aliases: ['banish'],
    usage: '<user> [reason]',
    examples: ['ban @user', 'ban @user Breaking rules'],
    permissions: {
        user: ['BanMembers'],
        bot: ['BanMembers'],
        owner: false,
        nsfw: false
    },
    args: {
        min: 1,
        max: 2,
        required: true
    },
    cooldown: 5,
    async execute(client, message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Please mention a valid user to ban.');

        if (target.id === message.author.id) return message.reply('You cannot ban yourself.');
        if (target.id === client.user.id) return message.reply('You cannot ban me.');

        if (!target.bannable || target.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('I cannot ban this user due to role hierarchy or insufficient permissions.');
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            // Attempt to DM the user about their ban
            await target.send(`You have been banned from **${message.guild.name}** for the following reason: ${reason}`)
                .catch(() => message.channel.send('Could not DM the user about the ban.'));

            // Ban the user
            await target.ban({ reason });

            // Send confirmation message
            message.reply(`Successfully banned **${target.user.tag}** for: ${reason}`);
        } catch (error) {
            console.error(`Failed to ban ${target.user.tag}:`, error);
            message.reply(`An error occurred while trying to ban **${target.user.tag}**.`);
        }
    }
};

