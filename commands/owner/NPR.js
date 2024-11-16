module.exports = {
    name: 'npr',
    category: 'owner',
    description: 'Manage No-Prefix Rights for users',
    aliases: ['noprefix'],
    usage: '<add/remove/list> [user]',
    examples: [
        'npr add @user',
        'npr remove @user',
        'npr list'
    ],
    permissions: {
        user: [],
        bot: [],
        owner: true,
        nsfw: false
    },
    args: {
        min: 1,
        max: 2,
        required: true
    },
    cooldown: 3,
    async execute(client, message, args) {
        const action = args[0].toLowerCase();

        // List all users with NPR
        if (action === 'list') {
            const nprUsers = await client.db.settings.get('npr_users') || [];
            
            if (nprUsers.length === 0) {
                return message.reply('No users have No-Prefix Rights.');
            }

            const userList = await Promise.all(nprUsers.map(async (id) => {
                try {
                    const user = await client.users.fetch(id);
                    return `${user.tag} (${id})`;
                } catch {
                    return `Unknown User (${id})`;
                }
            }));

            const embed = {
                color: 0x2F3136,
                title: '👑 Users with No-Prefix Rights',
                description: userList.join('\n'),
                footer: {
                    text: `Total: ${userList.length} users`
                },
                timestamp: new Date()
            };

            return message.reply({ embeds: [embed] });
        }

        // Get target user for add/remove
        const target = message.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);
        if (!target) {
            return message.reply('Please provide a valid user mention or ID.');
        }

        // Get current NPR users
        const nprUsers = await client.db.settings.get('npr_users') || [];

        if (action === 'add') {
            if (nprUsers.includes(target.id)) {
                return message.reply(`${target.tag} already has No-Prefix Rights.`);
            }

            nprUsers.push(target.id);
            await client.db.settings.set('npr_users', nprUsers);
            return message.reply(`Added No-Prefix Rights for ${target.tag}.`);

        } else if (action === 'remove') {
            if (!nprUsers.includes(target.id)) {
                return message.reply(`${target.tag} doesn't have No-Prefix Rights.`);
            }

            const updatedUsers = nprUsers.filter(id => id !== target.id);
            await client.db.settings.set('npr_users', updatedUsers);
            return message.reply(`Removed No-Prefix Rights from ${target.tag}.`);

        } else {
            return message.reply('Invalid action. Use `add`, `remove`, or `list`.');
        }
    }
};